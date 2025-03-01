'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import logger from '@/lib/logger';

/**
 * Create new loop page component
 */
export default function NewLoopPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sendDay, setSendDay] = useState<number>(5); // Default to Friday (5)
  const [gracePeriod, setGracePeriod] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to create a loop');
      }

      // Create new loop
      const { data, error: insertError } = await supabase
        .from('loops')
        .insert([
          {
            name,
            description,
            coordinator_id: session.user.id,
            send_day: sendDay,
            grace_period_days: gracePeriod
          }
        ])
        .select()
        .single();
      
      if (insertError) {
        throw insertError;
      }

      // Redirect to the new loop page
      router.push(`/loops/${data.id}`);
    } catch (err: any) {
      logger.error('Error creating loop', { error: err });
      setError(err.message || 'Failed to create loop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl px-4 py-8 md:px-6 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create New Loop</CardTitle>
          <CardDescription>
            Set up a new collaborative newsletter group
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Loop name */}
            <div className="space-y-2">
              <Label htmlFor="name">Loop Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Family Newsletter, Book Club"
                required
              />
            </div>

            {/* Loop description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this loop about?"
                rows={3}
              />
            </div>

            {/* Send day */}
            <div className="space-y-2">
              <Label htmlFor="sendDay">Newsletter Send Day</Label>
              <select
                id="sendDay"
                value={sendDay}
                onChange={(e) => setSendDay(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
              <p className="text-xs text-muted-foreground">
                The day of the week when newsletters<boltAction type="file" filePath="app/loops/new/page.tsx">                are sent to all members
              </p>
            </div>

            {/* Grace period */}
            <div className="space-y-2">
              <Label htmlFor="gracePeriod">Response Grace Period (Days)</Label>
              <Input
                id="gracePeriod"
                type="number"
                min={1}
                max={7}
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">
                Number of days members have to respond to questions
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/loops">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Loop'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
