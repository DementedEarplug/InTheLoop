"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { Loop, Question, LoopQuestion } from "@/lib/types"
import { PlusCircle, Shuffle, Calendar, MessageSquare } from "lucide-react"

export default function LoopQuestionsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loop, setLoop] = useState<Loop | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loopQuestions, setLoopQuestions] = useState<LoopQuestion[]>([])
  const [defaultQuestions, setDefaultQuestions] = useState<Question[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getMonth() + 1}-${new Date().getFullYear()}`
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [isAssigningQuestion, setIsAssigningQuestion] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("")

  const loopId = params.id as string
  const [month, year] = selectedMonth.split('-').map(Number)

  useEffect(() => {
    const fetchLoopAndQuestions = async () => {
      setIsLoading(true)
      
      try {
        // Fetch loop details
        const { data: loopData, error: loopError } = await supabase
          .from('loops')
          .select('*')
          .eq('id', loopId)
          .single()
        
        if (loopError) {
          throw loopError
        }
        
        setLoop(loopData as Loop)

        // Fetch all questions created by this coordinator
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
        
        if (questionsError) {
          throw questionsError
        }
        
        setQuestions(questionsData as Question[])
        setDefaultQuestions(questionsData.filter(q => q.is_default) as Question[])

        // Fetch questions assigned to this loop for the selected month/year
        await fetchLoopQuestions(month, year)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load loop and questions data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoopAndQuestions()
  }, [loopId, router, toast])

  const fetchLoopQuestions = async (month: number, year: number) => {
    try {
      const { data, error } = await supabase
        .from('loop_questions')
        .select('*')
        .eq('loop_id', loopId)
        .eq('month', month)
        .eq('year', year)
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      setLoopQuestions(data as LoopQuestion[])
    } catch (error) {
      console.error('Error fetching loop questions:', error)
      toast({
        title: "Error",
        description: "Failed to load assigned questions",
        variant: "destructive",
      })
    }
  }

  const handleMonthChange = async (value: string) => {
    setSelectedMonth(value)
    const [newMonth, newYear] = value.split('-').map(Number)
    await fetchLoopQuestions(newMonth, newYear)
  }

  const handleCreateQuestion = async () => {
    if (!newQuestion.trim()) {
      toast({
        title: "Error",
        description: "Question text cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsAddingQuestion(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('questions')
        .insert({
          text: newQuestion,
          is_default: false,
          created_by: user.id
        })
        .select()
      
      if (error) {
        throw error
      }
      
      setQuestions([data[0] as Question, ...questions])
      setNewQuestion("")
      toast({
        title: "Success",
        description: "Question created successfully",
      })
    } catch (error) {
      console.error('Error creating question:', error)
      toast({
        title: "Error",
        description: "Failed to create question",
        variant: "destructive",
      })
    } finally {
      setIsAddingQuestion(false)
    }
  }

  const handleAssignQuestion = async () => {
    if (!selectedQuestionId) {
      toast({
        title: "Error",
        description: "Please select a question to assign",
        variant: "destructive",
      })
      return
    }

    setIsAssigningQuestion(true)

    try {
      // Check if this question is already assigned for this month/year
      const existingAssignment = loopQuestions.find(
        lq => lq.question_id === selectedQuestionId
      )

      if (existingAssignment) {
        toast({
          title: "Warning",
          description: "This question is already assigned for the selected month",
        })
        setIsAssigningQuestion(false)
        setIsDialogOpen(false)
        return
      }

      const { data, error } = await supabase
        .from('loop_questions')
        .insert({
          loop_id: loopId,
          question_id: selectedQuestionId,
          month,
          year
        })
        .select()
      
      if (error) {
        throw error
      }
      
      setLoopQuestions([data[0] as LoopQuestion, ...loopQuestions])
      toast({
        title: "Success",
        description: "Question assigned successfully",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error assigning question:', error)
      toast({
        title: "Error",
        description: "Failed to assign question",
        variant: "destructive",
      })
    } finally {
      setIsAssigningQuestion(false)
    }
  }

  const handleRemoveQuestion = async (loopQuestionId: string) => {
    try {
      const { error } = await supabase
        .from('loop_questions')
        .delete()
        .eq('id', loopQuestionId)
      
      if (error) {
        throw error
      }
      
      setLoopQuestions(loopQuestions.filter(lq => lq.id !== loopQuestionId))
      toast({
        title: "Success",
        description: "Question removed successfully",
      })
    } catch (error) {
      console.error('Error removing question:', error)
      toast({
        title: "Error",
        description: "Failed to remove question",
        variant: "destructive",
      })
    }
  }

  const handleRandomQuestion = async () => {
    if (defaultQuestions.length === 0) {
      toast({
        title: "Warning",
        description: "No default questions available",
      })
      return
    }

    // Select a random question from default questions
    const randomIndex = Math.floor(Math.random() * defaultQuestions.length)
    setSelectedQuestionId(defaultQuestions[randomIndex].id)
    handleAssignQuestion()
  }

  // Generate month options for the last 12 months and next 12 months
  const generateMonthOptions = () => {
    const options = []
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    // Past 12 months
    for (let i = 12; i > 0; i--) {
      let month = currentMonth - i
      let year = currentYear
      
      if (month <= 0) {
        month += 12
        year -= 1
      }
      
      options.push({
        value: `${month}-${year}`,
        label: `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`
      })
    }

    // Current month
    options.push({
      value: `${currentMonth}-${currentYear}`,
      label: `${new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' })} ${currentYear} (Current)`
    })

    // Next 12 months
    for (let i = 1; i <= 12; i++) {
      let month = currentMonth + i
      let year = currentYear
      
      if (month > 12) {
        month -= 12
        year += 1
      }
      
      options.push({
        value: `${month}-${year}`,
        label: `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}`
      })
    }

    return options
  }

  const getQuestionText = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    return question ? question.text : "Unknown question"
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{loop?.name} - Questions</h1>
          <p className="text-muted-foreground">Manage questions for your loop</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/loops/${loopId}`}>
              Back to Loop
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Assigned Questions
                  </CardTitle>
                  <CardDescription>
                    Questions assigned to this loop for the selected month
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateMonthOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loopQuestions.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No questions assigned for this month</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Assign Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Question</DialogTitle>
                          <DialogDescription>
                            Select a question to assign to this loop for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a question" />
                            </SelectTrigger>
                            <SelectContent>
                              {questions.map(question => (
                                <SelectItem key={question.id} value={question.id}>
                                  {question.text.length > 50 ? `${question.text.substring(0, 50)}...` : question.text}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAssignQuestion} disabled={isAssigningQuestion}>
                            {isAssigningQuestion ? "Assigning..." : "Assign Question"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={handleRandomQuestion}>
                      <Shuffle className="h-4 w-4 mr-2" />
                      Random Question
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {loopQuestions.map(loopQuestion => {
                    const questionText = getQuestionText(loopQuestion.question_id)
                    return (
                      <div key={loopQuestion.id} className="flex justify-between items-start p-4 border rounded-md">
                        <div>
                          <p className="font-medium">{questionText}</p>
                          <p className="text-sm text-muted-foreground">
                            Assigned for {new Date(loopQuestion.year, loopQuestion.month - 1).toLocaleString('default', { month: 'long' })} {loopQuestion.year}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveQuestion(loopQuestion.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    )
                  })}
                  <div className="mt-4 flex justify-end gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Assign Another Question
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Question</DialogTitle>
                          <DialogDescription>
                            Select a question to assign to this loop for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Select value={selectedQuestionId} onValueChange={setSelectedQuestionId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a question" />
                            </SelectTrigger>
                            <SelectContent>
                              {questions.map(question => (
                                <SelectItem key={question.id} value={question.id}>
                                  {question.text.length > 50 ? `${question.text.substring(0, 50)}...` : question.text}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAssignQuestion} disabled={isAssigningQuestion}>
                            {isAssigningQuestion ? "Assigning..." : "Assign Question"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Question Bank
              </CardTitle>
              <CardDescription>
                Create and manage your questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a new question..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                  />
                  <Button onClick={handleCreateQuestion} disabled={isAddingQuestion}>
                    {isAddingQuestion ? "Adding..." : "Add"}
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Your Questions</h3>
                  {questions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No questions created yet</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {questions.map(question => (
                        <div key={question.id} className="p-3 border rounded-md text-sm">
                          <p>{question.text}</p>
                          {question.is_default && (
                            <span className="inline-block mt-1 text-xs bg-secondary px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
