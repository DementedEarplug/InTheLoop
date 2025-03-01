import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Dashboard page component
 * Shows overview of user's loops, recent responses, and pending questions
 */
export default function DashboardPage() {
  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col gap-8">
        {/* Page header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your LetterLoop activity.
            </p>
          </div>
          <Link href="/loops/new">
            <Button>Create New Loop</Button>
          </Link>
        </div>

        {/* Dashboard content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* My Loops card */}
          <Card>
            <CardHeader>
              <CardTitle>My Loops</CardTitle>
              <CardDescription>Loops you've created or joined</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading loops...</div>}>
                <DashboardLoops />
              </Suspense>
            </CardContent>
            <CardFooter>
              <Link href="/loops" className="w-full">
                <Button variant="outline" className="w-full">View All Loops</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Recent Responses card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Responses</CardTitle>
              <CardDescription>Your latest contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading responses...</div>}>
                <DashboardResponses />
              </Suspense>
            </CardContent>
            <CardFooter>
              <Link href="/my-responses" className="w-full">
                <Button variant="outline" className="w-full">View All Responses</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pending Questions card */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Questions</CardTitle>
              <CardDescription>Questions awaiting your response</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading questions...</div>}>
                <DashboardPendingQuestions />
              </Suspense>
            </CardContent>
            <CardFooter>
              <Link href="/questions" className="w-full">
                <Button variant="outline" className="w-full">View All Questions</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard loops component - shows user's loops
 */
function DashboardLoops() {
  // This would fetch data from the server in a real implementation
  const loops = [
    { id: '1', name: 'Family Newsletter', description: 'Weekly updates from the family' },
    { id: '2', name: 'Book Club', description: 'Monthly book discussions' },
    { id: '3', name: 'Team Updates', description: 'Work team collaboration' },
  ];

  return (
    <div className="space-y-4">
      {loops.length > 0 ? (
        loops.map((loop) => (
          <div key={loop.id} className="flex flex-col space-y-1">
            <Link href={`/loops/${loop.id}`} className="font-medium hover:underline">
              {loop.name}
            </Link>
            <p className="text-sm text-muted-foreground">{loop.description}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No loops found. Create your first loop!</p>
      )}
    </div>
  );
}

/**
 * Dashboard responses component - shows user's recent responses
 */
function DashboardResponses() {
  // This would fetch data from the server in a real implementation
  const responses = [
    { id: '1', question: 'What was your highlight this week?', loop: 'Family Newsletter', date: '2023-06-15' },
    { id: '2', question: 'What did you think of the book?', loop: 'Book Club', date: '2023-06-10' },
  ];

  return (
    <div className="space-y-4">
      {responses.length > 0 ? (
        responses.map((response) => (
          <div key={response.id} className="flex flex-col space-y-1">
            <span className="font-medium">{response.question}</span>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{response.loop}</span>
              <span className="text-xs text-muted-foreground">{response.date}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No responses yet. Start contributing!</p>
      )}
    </div>
  );
}

/**
 * Dashboard pending questions component - shows questions awaiting response
 */
function DashboardPendingQuestions() {
  // This would fetch data from the server in a real implementation
  const pendingQuestions = [
    { id: '1', question: 'What are your goals for next week?', loop: 'Family Newsletter', dueDate: '2023-06-20' },
    { id: '2', question: 'What book should we read next?', loop: 'Book Club', dueDate: '2023-06-25' },
  ];

  return (
    <div className="space-y-4">
      {pendingQuestions.length > 0 ? (
        pendingQuestions.map((item) => (
          <div key={item.id} className="flex flex-col space-y-1">
            <span className="font-medium">{item.question}</span>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{item.loop}</span>
              <span className="text-xs text-muted-foreground">Due: {item.dueDate}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No pending questions. You're all caught up!</p>
      )}
    </div>
  );
}
