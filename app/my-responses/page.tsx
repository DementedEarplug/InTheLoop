"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"

export default function MyResponsesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [responses, setResponses] = useState([])

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setIsLoading(true)
        logger.debug('Fetching user session', { context: 'MyResponsesPage' })
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          logger.warn('No active session found', { context: 'MyResponsesPage' })
          return
        }
        
        logger.debug('Fetching user responses', { context: 'MyResponsesPage', data: { userId: session.user.id } })
        
        // This is a placeholder query - you'll need to adjust based on your actual schema
        const { data, error } = await supabase
          .from('responses')
          .select(`
            id,
            text,
            created_at,
            loop_question_id,
            loop_questions(
              question_id,
              questions(text),
              loop_id,
              loops(name)
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        logger.info('Responses fetched successfully', { 
          context: 'MyResponsesPage', 
          data: { count: data?.length || 0 } 
        })
        
        setResponses(data || [])
      } catch (error) {
        logger.error('Error fetching responses', { context: 'MyResponsesPage', data: error })
      } finally {
        setIsLoading(false)
      }
    }

    fetchResponses()
  }, [])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">My Responses</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading your responses...</p>
        </div>
      ) : responses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {responses.map((response: any) => (
            <Card key={response.id}>
              <CardHeader>
                <CardTitle className="text-lg">{response.loop_questions?.questions?.text || 'Question'}</CardTitle>
                <CardDescription>
                  {response.loop_questions?.loops?.name || 'Loop'} • {new Date(response.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{response.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No responses yet</CardTitle>
            <CardDescription>
              You haven't submitted any responses to questions yet. When you do, they'll appear here.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
