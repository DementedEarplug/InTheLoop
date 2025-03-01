"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"
import { Loop } from "@/lib/types"

export default function DashboardPage() {
  const [loops, setLoops] = useState<Loop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLoops: 0,
    activeMembers: 0,
    pendingQuestions: 0,
    sentNewsletters: 0
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        logger.debug('Fetching dashboard data', { context: 'DashboardPage' })
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          logger.warn('No active session found', { context: 'DashboardPage' })
          return
        }
        
        // Fetch loops
        const { data: loopsData, error: loopsError } = await supabase
          .from('loops')
          .select('*')
          .eq('coordinator_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (loopsError) {
          throw loopsError
        }
        
        setLoops(loopsData || [])
        
        // Fetch stats (these are placeholder queries - adjust based on your schema)
        const [
          { count: loopsCount },
          { count: membersCount },
          { count: questionsCount },
          { count: newslettersCount }
        ] = await Promise.all([
          supabase.from('loops').select('id', { count: 'exact', head: true })
            .eq('coordinator_id', session.user.id),
          supabase.from('loop_members').select('id', { count: 'exact', head: true })
            .eq('status', 'active'),
          supabase.from('loop_questions').select('id', { count: 'exact', head: true })
            .eq('status', 'pending'),
          supabase.from('newsletters').select('id', { count: 'exact', head: true })
            .eq('status', 'sent')
        ])
        
        setStats({
          totalLoops: loopsCount || 0,
          activeMembers: membersCount || 0,
          pendingQuestions: questionsCount || 0,
          sentNewsletters: newslettersCount || 0
        })
        
        logger.info('Dashboard data fetched successfully', { context: 'DashboardPage' })
      } catch (error) {
        logger.error('Error fetching dashboard data', { context: 'DashboardPage', data: error })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Loops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLoops}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingQuestions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent Newsletters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sentNewsletters}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Recent Loops</h2>
        <Link href="/loops/new">
          <Button>Create New Loop</Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading your loops...</p>
        </div>
      ) : loops.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loops.map((loop) => (
            <Card key={loop.id}>
              <CardHeader>
                <CardTitle>{loop.name}</CardTitle>
                <CardDescription>
                  {loop.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href={`/loops/${loop.id}`}>
                  <Button variant="outline">View Details</Button>
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
              Create your first loop to get started with LetterLoop.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/loops/new">
              <Button>Create Loop</Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
