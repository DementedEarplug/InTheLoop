'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import logger from '@/lib/logger';
import { Loop } from '@/lib/types';

/**
 * Edit loop page component
 */
export default function EditLoopPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loop, setLoop] = useState<Loop | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sendDay, setSendDay] = useState<number>(5);
  const [gracePeriod, setGracePeriod] = useState<number>(2);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch loop data
  useEffect(() => {
    const fetchLoop = async () => {
      try {
        const { data, error } = await supabase
          .from('loops')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (error) throw error;
        
        setLoop(data);
        setName(data.name);
        setDescription(data.description || '');
        setSendDay(data.send_day || 5);
        setGracePeriod(data.grace_period_days || 2);
      } catch (err: any) {
        logger.error('Error fetching loop', { error: err, loopId: params.id });
        setError('Failed to load loop details');
      } finally {
        setLoading(false);
      }
    };

    fetchLoop();
  }, [params.id]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Update loop
      const { error: updateError } = await supabase
        .from('loops')
        .update({
          name,
          description,
          send_day: sendDay,
          grace_period_days: gracePeriod
        })
        .eq('id', params.id);
      
      if (updateError) throw updateError;

      // Redirect back to loop details
      router.push(`/loops/${params.id}`);
    } catch (err: any) {
      logger.error('Error updating loop', { error: err, loopId: params.id });
      setError(err.message || 'Failed to update loop');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle loop deletion
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this loop? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      
      // Delete loop
      const { error } = await supabase
        .from('loops')
        .delete()
        .eq('id', params.id);
      
      if (error) throw error;

      // Redirect to loops list
      router.push('/loops');
    } catch (err: any) {
      logger.error('Error deleting loop', { error: err, loopId: params.id });
      setError(err.message || 'Failed to delete loop');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center px-4 py-8 md:px-6 md:py-12">
        <p>Loading loop details...</p>
      </div>
    );
  }

  if (!loop) {
    return (
      <div className="container flex items-center justify-center px-4 py-8 md:px-6 md:py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || 'Loop not found'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/loops">
              <Button>Back to Loops</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl px-4 py-8 md:px-6 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle>Edit Loop</CardTitle>
          <CardDescription>
            Update your loop settings
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
                The day of the week when newsletters are sent to all members
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
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving}>
              Delete Loop
            </Button>
            <div className="flex gap-2">
              <Link href={`/loops/${params.id}`}>
                <Button variant="outline" disabled={saving}>Cancel</Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
