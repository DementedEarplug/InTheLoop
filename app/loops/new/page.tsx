"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

const loopSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  send_date: z.coerce.number().min(1, { message: "Send date must be between 1-28" }).max(28, { message: "Send date must be between 1-28" }),
  grace_period: z.coerce.number().min(1, { message: "Grace period must be at least 1 day" }).max(14, { message: "Grace period cannot exceed 14 days" }),
})

type LoopFormValues = z.infer<typeof loopSchema>

export default function NewLoopPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoopFormValues>({
    resolver: zodResolver(loopSchema),
    defaultValues: {
      name: "",
      description: "",
      send_date: 15,
      grace_period: 7,
    },
  })

  const onSubmit = async (data: LoopFormValues) => {
    setIsLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: loop, error } = await supabase
        .from('loops')
        .insert({
          name: data.name,
          description: data.description,
          coordinator_id: user.id,
          send_date: data.send_date,
          grace_period: data.grace_period,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Loop created",
        description: `${data.name} has been created successfully.`,
      })

      router.push(`/loops/${loop.id}`)
    } catch (error: any) {
      toast({
        title: "Failed to create loop",
        description: error.message || "There was an error creating your loop",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Loop</CardTitle>
            <CardDescription>
              Set up a new group to start collecting and sharing stories
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
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Loop"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
