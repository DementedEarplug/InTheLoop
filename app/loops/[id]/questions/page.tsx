import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Loop questions page component
 * Shows questions for a specific loop
 */
export default function LoopQuestionsPage({ params }: { params: { id: string } }) {
  // This would fetch data from the server in a real implementation
  const loop = {
    id: params.id,
    name: 'Family Newsletter',
    description: 'Weekly updates from the family',
    isCoordinator: true,
  };

  // Mock data for questions
  const questions = [
    { 
      id: '1', 
      text: 'What was your highlight this week?', 
      sendDate: '2023-06-15', 
      status: 'completed',
      responseCount: 6
    },
    { 
      id: '2', 
      text: 'What are your goals for next week?', 
      sendDate: '2023-06-22', 
      status: 'pending',
      responseCount: 0
    },
    { 
      id: '3', 
      text: 'Share a photo from your week', 
      sendDate: '2023-06-29', 
      status: 'scheduled',
      responseCount: 0
    },
  ];

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col gap-8">
        {/* Page header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Questions for {loop.name}</h1>
            <p className="text-muted-foreground">
              Manage questions sent to loop members
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/loops/${loop.id}`}>
              <Button variant="outline">Back to Loop</Button>
            </Link>
            {loop.isCoordinator && (
              <Button>Add Question</Button>
            )}
          </div>
        </div>

        {/* Questions list */}
        <div className="space-y-6">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle>{question.text}</CardTitle>
                <CardDescription>
                  Send date: {question.sendDate} • Status: <span className="capitalize">{question.status}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {question.responseCount} responses received
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {question.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        View Responses
                      </Button>
                    )}
                    {loop.isCoordinator && question.status !== 'completed' && (
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    )}
                    {loop.isCoordinator && (
                      <Button variant="destructive" size="sm">
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {questions.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">No questions found</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                This loop doesn't have any questions yet.
              </p>
              {loop.isCoordinator && (
                <Button>Add Your First Question</Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
