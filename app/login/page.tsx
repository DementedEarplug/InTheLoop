"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    
    try {
      logger.info('Attempting login', { context: 'LoginPage', data: { email: data.email } })
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        logger.error('Login failed', { context: 'LoginPage', data: { error: error.message } })
        throw error
      }

      logger.info('Login successful', { context: 'LoginPage', data: { userId: authData.user?.id } })

      // Check user role to redirect to appropriate page
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', data.email)
        .single()

      if (userError) {
        logger.error('Failed to fetch user role', { context: 'LoginPage', data: { error: userError.message } })
        throw userError
      }

      logger.debug('User role retrieved', { context: 'LoginPage', data: { role: userData?.role } })

      if (userData?.role === 'coordinator') {
        router.push('/dashboard')
      } else {
        router.push('/my-responses')
      }
    } catch (error: any) {
      logger.error('Login error', { context: 'LoginPage', data: { message: error.message } })
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Default test user credentials helper
  const fillTestCredentials = () => {
    const form = document.getElementById('login-form') as HTMLFormElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
    
    emailInput.value = 'admin@letterloop.test';
    passwordInput.value = 'password123';
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <form id="login-form" onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="underline">
                Sign up
              </Link>
            </div>
            <div className="text-center">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={fillTestCredentials}
                className="text-xs"
              >
                Use Test Account
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
