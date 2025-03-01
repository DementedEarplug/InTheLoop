"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { Loop } from "@/lib/types"

const loopSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  send_date: z.coerce.number().min(1, { message: "Send date must be between 1-28" }).max(28, { message: "Send date must be between 1-28" }),
  grace_period: z.coerce.number().min(1, { message: "Grace period must be at least 1 day" }).max(14, { message: "Grace period cannot exceed 14 days" }),
})

type LoopFormValues = z.infer<typeof loopSchema>

export default function EditLoopPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const loopId = params.id as string

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoopFormValues>({
    resolver: zodResolver(loopSchema),
  })

  useEffect(() => {
    const fetchLoop = async () => {
      setIsLoading(true)
      
      try {
        const { data, error } = await supabase
          .from('loops')
          .select('*')
          .eq('id', loopId)
          .single()
        
        if (error) {
          throw error
        }
        
        reset({
          name: data.name,
          description: data.description,
          send_date: data.send_date,
          grace_period: data.grace_period,
        })
      } catch (error) {
        console.error('Error fetching loop:', error)
        toast({
          title: "Error",
          description: "Failed to load loop details",
          variant: "destructive",
        })
        router.push('/loops')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoop()
  }, [loopId, reset, router, toast])

  const onSubmit = async (data: LoopFormValues) => {
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('loops')
        .update({
          name: data.name,
          description: data.description,
          send_date: data.send_date,
          grace_period: data.grace_period,
        })
        .eq('id', loopId)

      if (error) {
        throw error
      }

      toast({
        title: "Loop updated",
        description: `${data.name} has been updated successfully.`,
      })

      router.push(`/loops/${loopId}`)
    } catch (error: any) {
      toast({
        title: "Failed to update loop",
        description: error.message || "There was an error updating your loop",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this loop? This action cannot be undone.")) {
      return
    }
    
    setIsDeleting(true)
    
    try {
      // Delete all related data first
      await supabase.from('loop_members').delete().eq('loop_id', loopId)
      await supabase.from('loop_questions').delete().eq('loop_id', loopId)
      await supabase.from('responses').delete().eq('loop_id', loopId)
      await supabase.from('newsletters').delete().eq('loop_id', loopId)
      
      // Finally delete the loop
      const { error } = await supabase
        .from('loops')
        .delete()
        .eq('id', loopId)

      if (error) {
        throw error
      }

      toast({
        title: "Loop deleted",
        description: "The loop has been deleted successfully.",
      })

      router.push('/loops')
    } catch (error: any) {
      toast({
        title: "Failed to delete loop",
        description: error.message || "There was an error deleting your loop",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center p-8">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Loop</CardTitle>
            <CardDescription>
              Update your loop settings
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Loop Name</Label>
                <Input
                  id="name"
                  placeholder="Family Updates, Team Newsletter, etc."
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this loop about? Who is it for?"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="send_date">Send Date (Day of Month)</Label>
                  <Input
                id="send_date"
                    type="number"
                    min={1}
                    max={28}
                    {...register("send_date")}
                  />
                  {errors.send_date && (
                    <p className="text-sm text-red-500">{errors.send_date.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Day of the month when newsletters will be sent (1-28)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="grace_period">Grace Period (Days)</Label>
                  <Input
                    id="grace_period"
                    type="number"
                    min={1}
                    max={14}
                    {...register("grace_period")}
                  />
                  {errors.grace_period && (
                    <p className="text-sm text-red-500">{errors.grace_period.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Days to wait for responses before sending the newsletter
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
              >
                {isDeleting ? "Deleting..." : "Delete Loop"}
              </Button>
              <div className="flex gap-2">
                <Link href={`/loops/${loopId}`}>
                  <Button variant="outline" disabled={isSubmitting || isDeleting}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting || isDeleting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
