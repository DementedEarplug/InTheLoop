import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * My Responses page component
 * Shows all responses submitted by the current user
 */
export default function MyResponsesPage() {
  // This would fetch data from the server in a real implementation
  const responses = [
    { 
      id: '1', 
      question: 'What was your highlight this week?', 
      loop: 'Family Newsletter',
      loopId: '1',
      responseDate: '2023-06-15',
      text: 'I finally finished the project I was working on for the past month. It was a lot of work but I\'m really proud of the result.'
    },
    { 
      id: '2', 
      question: 'What did you think of the book?', 
      loop: 'Book Club',
      loopId: '2',
      responseDate: '2023-06-10',
      text: 'I thought the character development was excellent, but the ending felt a bit rushed. Overall I enjoyed it though!'
    },
    { 
      id: '3', 
      question: 'Share a photo from your week', 
      loop: 'Family Newsletter',
      loopId: '1',
      responseDate: '2023-06-08',
      text: 'Here\'s a photo from our hike last weekend. The weather was perfect!'
    },
  ];

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col gap-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Responses</h1>
          <p className="text-muted-foreground">
            View and manage your responses to loop questions
          </p>
        </div>

        {/* Responses list */}
        <div className="space-y-6">
          {responses.map((response) => (
            <Card key={response.id}>
              <CardHeader>
                <CardTitle>{response.question}</CardTitle>
                <CardDescription>
                  <Link href={`/loops/${response.loopId}`} className="hover:underline">
                    {response.loop}
                  </Link> • {response.responseDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{response.text}</p>
              </CardContent>
            </Card>
          ))}

          {responses.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <h3 className="mb-2 text-lg font-medium">No responses found</h3>
              <p className="mb-6 text-sm text-muted-foreground">
                You haven't submitted any responses yet.
              </p>
              <Link href="/questions">
                <Button>View Pending Questions</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
