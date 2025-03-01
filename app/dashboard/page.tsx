"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase/client"
import { Loop, Newsletter, Response } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { PlusCircle, Users, Mail, MessageSquare } from "lucide-react"

export default function DashboardPage() {
  const [loops, setLoops] = useState<Loop[]>([])
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [pendingResponses, setPendingResponses] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          window.location.href = '/login'
          return
        }

        // Fetch loops created by the coordinator
        const { data: loopsData } = await supabase
          .from('loops')
          .select('*')
          .eq('coordinator_id', user.id)
          .order('created_at', { ascending: false })
        
        if (loopsData) {
          setLoops(loopsData as Loop[])
        }

        // Fetch recent newsletters
        const { data: newslettersData } = await supabase
          .from('newsletters')
          .select('*')
          .in('loop_id', loopsData?.map(loop => loop.id) || [])
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (newslettersData) {
          setNewsletters(newslettersData as Newsletter[])
        }

        // Count pending responses
        const { count } = await supabase
          .from('loop_questions')
          .select('*', { count: 'exact' })
          .in('loop_id', loopsData?.map(loop => loop.id) || [])
          .eq('month', new Date().getMonth() + 1)
          .eq('year', new Date().getFullYear())
        
        setPendingResponses(count || 0)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link href="/loops/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Loop
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Loops</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loops.length}</div>
              <p className="text-xs text-muted-foreground">
                Active groups you're coordinating
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Newsletters Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {newsletters.filter(n => n.status === 'sent').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Total newsletters distributed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Responses</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingResponses}</div>
              <p className="text-xs text-muted-foreground">
                Questions awaiting responses this month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="loops" className="space-y-4">
          <TabsList>
            <TabsTrigger value="loops">Your Loops</TabsTrigger>
            <TabsTrigger value="newsletters">Recent Newsletters</TabsTrigger>
          </TabsList>
          <TabsContent value="loops" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-4">Loading...</div>
            ) : loops.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loops.map((loop) => (
                  <Card key={loop.id}>
                    <CardHeader>
                      <CardTitle>{loop.name}</CardTitle>
                      <CardDescription>
                        {loop.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        <p>Send date: Day {loop.send_date} of each month</p>
                        <p>Grace period: {loop.grace_period} days</p>
                        <p>Created: {formatDate(new Date(loop.created_at))}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/loops/${loop.id}`} className="w-full">
                        <Button variant="outline" className="w-full">View Loop</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No loops found</CardTitle>
                  <CardDescription>
                    You haven't created any loops yet. Get started by creating your first loop.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/loops/new">
                    <Button>Create Your First Loop</Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="newsletters" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-4">Loading...</div>
            ) : newsletters.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {newsletters.map((newsletter) => (
                  <Card key={newsletter.id}>
                    <CardHeader>
                      <CardTitle>
                        {new Date(newsletter.year, newsletter.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </CardTitle>
                      <CardDescription>
                        Status: {newsletter.status === 'sent' ? 'Sent' : 'Draft'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm">
                        {newsletter.status === 'sent' && newsletter.sent_at && (
                          <p>Sent on: {formatDate(new Date(newsletter.sent_at))}</p>
                        )}
                        <p>Created: {formatDate(new Date(newsletter.created_at))}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/newsletters/${newsletter.id}`} className="w-full">
                        <Button variant="outline" className="w-full">View Newsletter</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No newsletters found</CardTitle>
                  <CardDescription>
                    You haven't sent any newsletters yet. Create a loop and send questions to get started.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/loops/new">
                    <Button>Create a Loop</Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
