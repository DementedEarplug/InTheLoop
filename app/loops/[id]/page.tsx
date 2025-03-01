"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { Loop, LoopMember, Newsletter } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { PlusCircle, Mail, Trash2, Edit, Users, Calendar } from "lucide-react"

export default function LoopDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loop, setLoop] = useState<Loop | null>(null)
  const [members, setMembers] = useState<LoopMember[]>([])
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberName, setNewMemberName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const loopId = params.id as string

  useEffect(() => {
    const fetchLoopDetails = async () => {
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

        // Fetch loop members
        const { data: membersData, error: membersError } = await supabase
          .from('loop_members')
          .select('*')
          .eq('loop_id', loopId)
          .order('created_at', { ascending: true })
        
        if (membersError) {
          throw membersError
        }
        
        setMembers(membersData as LoopMember[])

        // Fetch newsletters
        const { data: newslettersData, error: newslettersError } = await supabase
          .from('newsletters')
          .select('*')
          .eq('loop_id', loopId)
          .order('created_at', { ascending: false })
        
        if (newslettersError) {
          throw newslettersError
        }
        
        setNewsletters(newslettersData as Newsletter[])
      } catch (error) {
        console.error('Error fetching loop details:', error)
        toast({
          title: "Error",
          description: "Failed to load loop details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoopDetails()
  }, [loopId, toast])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingMember(true)
    
    try {
      // Check if member already exists
      const { data: existingMember } = await supabase
        .from('loop_members')
        .select('*')
        .eq('loop_id', loopId)
        .eq('email', newMemberEmail)
        .maybeSingle()
      
      if (existingMember) {
        toast({
          title: "Member already exists",
          description: "This email is already a member of this loop",
          variant: "destructive",
        })
        return
      }

      // Add new member
      const { data, error } = await supabase
        .from('loop_members')
        .insert({
          loop_id: loopId,
          email: newMemberEmail,
          name: newMemberName,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      setMembers([...members, data as LoopMember])
      setNewMemberEmail("")
      setNewMemberName("")
      setIsDialogOpen(false)
      
      toast({
        title: "Member added",
        description: `${newMemberName} has been added to the loop`,
      })
    } catch (error: any) {
      toast({
        title: "Failed to add member",
        description: error.message || "There was an error adding the member",
        variant: "destructive",
      })
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this loop?`)) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('loop_members')
        .delete()
        .eq('id', memberId)

      if (error) {
        throw error
      }

      setMembers(members.filter(member => member.id !== memberId))
      
      toast({
        title: "Member removed",
        description: `${memberName} has been removed from the loop`,
      })
    } catch (error: any) {
      toast({
        title: "Failed to remove member",
        description: error.message || "There was an error removing the member",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center p-8">Loading...</div>
      </div>
    )
  }

  if (!loop) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Loop not found</CardTitle>
            <CardDescription>
              The loop you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/loops">
              <Button>Back to Loops</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{loop.name}</h1>
            <p className="text-muted-foreground">{loop.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/loops/${loopId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Loop
              </Button>
            </Link>
            <Link href={`/loops/${loopId}/questions`}>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Manage Questions
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Send Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Day {loop.send_date}</div>
              <p className="text-xs text-muted-foreground">
                of each month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Grace Period</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loop.grace_period} days</div>
              <p className="text-xs text-muted-foreground">
                to collect responses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                people in this loop
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Loop Members</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                    <DialogDescription>
                      Add a new member to your loop. They will receive questions and newsletters.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddMember}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isAddingMember}>
                        {isAddingMember ? "Adding..." : "Add Member"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {members.length > 0 ? (
              <div className="border rounded-md">
                <div className="grid grid-cols-3 p-4 font-medium border-b">
                  <div>Name</div>
                  <div>Email</div>
                  <div className="text-right">Actions</div>
                </div>
                {members.map((member) => (
                  <div key={member.id} className="grid grid-cols-3 p-4 border-b last:border-0 items-center">
                    <div>{member.name}</div>
                    <div className="text-muted-foreground">{member.email}</div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id, member.name)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No members yet</CardTitle>
                  <CardDescription>
                    Add members to your loop to start sending them questions and newsletters.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Member
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="newsletters" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Newsletters</h2>
              <Link href={`/loops/${loopId}/questions`}>
                <Button>
                  <Mail className="mr-2 h-4 w-4" />
                  Manage Questions
                </Button>
              </Link>
            </div>

            {newsletters.length > 0 ? (
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
                  <CardTitle>No newsletters yet</CardTitle>
                  <CardDescription>
                    Set up questions for your loop to start generating newsletters.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href={`/loops/${loopId}/questions`}>
                    <Button>Set Up Questions</Button>
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
