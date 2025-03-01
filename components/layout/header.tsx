"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Mail, 
  LogOut 
} from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { User } from "@/lib/types"

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (data) {
          setUser(data as User)
        }
      }
    }

    fetchUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  // Don't show header on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null
  }

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Mail className="h-6 w-6" />
          <span className="text-xl">LetterLoop</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          {user?.role === 'coordinator' && (
            <>
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary flex items-center gap-1`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <Link 
                href="/loops" 
                className={`text-sm font-medium ${pathname.startsWith('/loops')? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary flex items-center gap-1`}
              >
                <Users className="h-4 w-4" />
                <span className="hidden md:inline">Loops</span>
              </Link>
              <Link 
                href="/questions" 
                className={`text-sm font-medium ${pathname.startsWith('/questions') ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary flex items-center gap-1`}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden md:inline">Questions</span>
              </Link>
            </>
          )}
          {user?.role === 'member' && (
            <Link 
              href="/my-responses" 
              className={`text-sm font-medium ${pathname === '/my-responses' ? 'text-primary' : 'text-muted-foreground'} transition-colors hover:text-primary flex items-center gap-1`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">My Responses</span>
            </Link>
          )}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button>Sign in</Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
