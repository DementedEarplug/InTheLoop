"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"
import { Question } from "@/lib/types"

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      logger.debug('Fetching questions', { context: 'QuestionsPage' })
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        logger.warn('No active session found', { context: 'QuestionsPage' })
        return
      }
      
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .or(`created_by.eq.${session.user.id},is_public.eq.true`)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      logger.info('Questions fetched successfully', { 
        context: 'QuestionsPage', 
        data: { count: data?.length || 0 } 
      })
      
      setQuestions(data || [])
    } catch (error) {
      logger.error('Error fetching questions', { context: 'QuestionsPage', data: error })
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newQuestion.trim()) {
      toast({
        title: "Error",
        description: "Question text cannot be empty",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      logger.debug('Creating new question', { context: 'QuestionsPage' })
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }
      
      const { data, error } = await supabase
        .from('questions')
        .insert([
          {
            text: newQuestion,
            created_by: session.user.id,
            is_public: isPublic
          }
        ])
        .select()
      
      if (error) {
        throw error
      }
      
      logger.info('Question created successfully', { context: 'QuestionsPage' })
      
      toast({
        title: "Success",
        description: "Question added successfully",
      })
      
      setNewQuestion("")
      fetchQuestions()
    } catch (error) {
      logger.error('Error creating question', { context: 'QuestionsPage', data: error })
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Question Bank</h1>
      
      <Card className="mb-8">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Add New Question</CardTitle>
            <CardDescription>
              Create a new question to use in your loops
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your question here..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="isPublic" className="text-sm">
                Make this question available to all coordinators
              </label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Question"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <h2 className="text-2xl font-bold mb-4">Available Questions</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading questions...</p>
        </div>
      ) : questions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">{question.text}</CardTitle>
                <CardDescription>
                  {question.is_public ? "Public Question" : "Your Question"}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No questions found</CardTitle>
            <CardDescription>
              Add your first question using the form above.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
