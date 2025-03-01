import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Questions page component
 * Shows all pending questions for the current user
 */
export default function QuestionsPage() {
  // This would fetch data from the server in a real implementation
  const pendingQuestions = [
    { 
      id: '1', 
      question: 'What are your goals for next week?', 
      loop: 'Family Newsletter',
      loopId: '1',
      dueDate: '2023-06-20'
    },
    { 
      id: '2', 
      question: 'What book should we read next?', 
      loop: 'Book Club',
      loopId: '2',
      dueDate: '2023-06-25'
    },
  ];

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col gap-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Questions</h1>
          <p className="text-muted-foreground">
            Questions that need your response
          </p>
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {pendingQuestions.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle>{item.question}</CardTitle>
                <CardDescription>
                  <Link href={`/loops/${item.loopId}`} className="hover:underline">
                    {item.loop}
                  </Link> • Due: {item.dueDate}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full">Respond</Button>
              </CardFooter>
            </Card>
          ))}

          {pendingQuestions.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">No pending questions</h3>
              <p className="text-sm text-muted-foreground">
                You're all caught up! There are no questions waiting for your response.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
