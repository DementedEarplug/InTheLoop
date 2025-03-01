import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Loop details page component
 * Shows information about a specific loop
 */
export default function LoopDetailsPage({ params }: { params: { id: string } }) {
  // This would fetch data from the server in a real implementation
  const loop = {
    id: params.id,
    name: 'Family Newsletter',
    description: 'Weekly updates from the family',
    sendDay: 5, // Friday
    gracePeriodDays: 2,
    isCoordinator: true,
  };

  // Mock data for members
  const members = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'pending' },
  ];

  // Mock data for recent questions
  const recentQuestions = [
    { id: '1', text: 'What was your highlight this week?', sendDate: '2023-06-15', status: 'completed' },
    { id: '2', text: 'What are your goals for next week?', sendDate: '2023-06-22', status: 'pending' },
  ];

  // Mock data for newsletters
  const newsletters = [
    { id: '1', title: 'Family Updates - June 15', sendDate: '2023-06-15', status: 'sent' },
    { id: '2', title: 'Family Updates - June 8', sendDate: '2023-06-08', status: 'sent' },
  ];

  // Convert day number to day name
  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  return (
    <div className="container px-4 py-8 md:px-6 md:py-12">
      <div className="flex flex-col gap-8">
        {/* Page header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{loop.name}</h1>
            <p className="text-muted-foreground">{loop.description}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {loop.isCoordinator && (
              <Link href={`/loops/${loop.id}/edit`}>
                <Button variant="outline">Edit Loop</Button>
              </Link>
            )}
            <Link href={`/loops/${loop.id}/questions`}>
              <Button>Manage Questions</Button>
            </Link>
          </div>
        </div>

        {/* Loop details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Loop Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Send Day</p>
                  <p>{getDayName(loop.sendDay)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grace Period</p>
                  <p>{loop.gracePeriodDays} days</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your Role</p>
                  <p>{loop.isCoordinator ? 'Coordinator' : 'Member'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Members</p>
                  <p>{members.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent activity card */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentQuestions.length > 0 ? (
                recentQuestions.map((question) => (
                  <div key={question.id} className="flex flex-col space-y-1">
                    <span className="font-medium">{question.text}</span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Send date: {question.sendDate}</span>
                      <span className="text-xs capitalize text-muted-foreground">{question.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs for members, questions, and newsletters */}
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
          </TabsList>
          
          {/* Members tab */}
          <TabsContent value="members" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Loop Members</CardTitle>
                  <CardDescription>People who receive and contribute to this loop</CardDescription>
                </div>
                {loop.isCoordinator && (
                  <Button size="sm">Invite Member</Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2 text-xs capitalize text-muted-foreground">{member.status}</span>
                        {loop.isCoordinator && (
                          <Button variant="ghost" size="sm">
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Questions tab */}
          <TabsContent value="questions" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Loop Questions</CardTitle>
                  <CardDescription>Questions sent to loop members</CardDescription>
                </div>
                <Link href={`/loops/${loop.id}/questions`}>
                  <Button size="sm">Manage Questions</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentQuestions.map((question) => (
                    <div key={question.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{question.text}</p>
                        <p className="text-sm text-muted-foreground">Send date: {question.sendDate}</p>
                      </div>
                      <span className="text-xs capitalize text-muted-foreground">{question.status}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Newsletters tab */}
          <TabsContent value="newsletters" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Newsletters</CardTitle>
                  <CardDescription>Compiled responses sent to all members</CardDescription>
                </div>
                {loop.isCoordinator && (
                  <Button size="sm">Create Newsletter</Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsletters.map((newsletter) => (
                    <div key={newsletter.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{newsletter.title}</p>
                        <p className="text-sm text-muted-foreground">Send date: {newsletter.sendDate}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
