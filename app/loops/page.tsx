'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getLoops } from '@/lib/api';
import { useUser } from '@/lib/supabase/hooks';
import { useState, useEffect } from 'react';
import { Loop } from '@/lib/types';

/**
 * Loops page component
 * Shows all loops the user is part of
 */
export default function LoopsPage() {
  const { user } = useUser();
  const [loops, setLoops] = useState<Loop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLoops() {
      if (!user) return;
      try {
        const loopsData = await getLoops(user.id);
        setLoops(loopsData);
      } catch (err) {
        setError('Failed to fetch loops. Please try again later.');
        console.error('Error fetching loops:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLoops();
  }, [user]);

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col gap-8">
        {/* Page header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Loops</h1>
            <p className="text-muted-foreground">
              Manage your collaborative newsletter groups
            </p>
          </div>
          <Link href="/loops/new">
            <Button>Create New Loop</Button>
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading loops...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Loops grid */}
        {!isLoading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loops.map((loop) => (
              <Card key={loop.id}>
                <CardHeader>
                  <CardTitle>{loop.name}</CardTitle>
                  <CardDescription>{loop.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">0</span> members
                    </div>
                    <div>
                      <span className="font-medium">0</span> questions
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href={`/loops/${loop.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                  <Link href={`/loops/${loop.id}/questions`}>
                    <Button>Manage Questions</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}

            {loops.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <h3 className="mb-2 text-lg font-medium">No loops found</h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  You haven't created or joined any loops yet.
                </p>
                <Link href="/loops/new">
                  <Button>Create Your First Loop</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
