"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"
import { Loop } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { PlusCircle, Search } from "lucide-react"

export default function LoopsPage() {
  const [loops, setLoops] = useState<Loop[]>([])
  const [filteredLoops, setFilteredLoops] = useState<Loop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLoops = async () => {
      setIsLoading(true)
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          window.location.href = '/login'
          return
        }

        const { data, error } = await supabase
          .from('loops')
          .select('*')
          .eq('coordinator_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          throw error
        }
        
        setLoops(data as Loop[])
        setFilteredLoops(data as Loop[])
      } catch (error) {
        console.error('Error fetching loops:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoops()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLoops(loops)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredLoops(
        loops.filter(
          (loop) =>
            loop.name.toLowerCase().includes(query) ||
            loop.description.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, loops])

  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Your Loops</h1>
          <Link href="/loops/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Loop
            </Button>
          </Link>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search loops..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">Loading...</div>
        ) : filteredLoops.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLoops.map((loop) => (
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
                <CardFooter className="flex gap-2">
                  <Link href={`/loops/${loop.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">Manage</Button>
                  </Link>
                  <Link href={`/loops/${loop.id}/questions`} className="flex-1">
                    <Button variant="outline" className="w-full">Questions</Button>
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
                {searchQuery
                  ? "No loops match your search criteria. Try a different search term."
                  : "You haven't created any loops yet. Get started by creating your first loop."}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/loops/new">
                <Button>Create Your First Loop</Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
