'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase/client';
import logger from '@/lib/logger';

/**
 * Registration page component
 */
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      logger.info('Attempting to create new user account', { context: 'auth', data: { email } });
      
      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        logger.error('Failed to create auth user', { context: 'auth', data: { error: signUpError } });
        throw signUpError;
      }
      
      logger.info('Successfully created auth user', { context: 'auth', data: { userId: data.user?.id } });

      if (data.user) {
        logger.info('Attempting to create user profile', { context: 'database', data: { userId: data.user.id } });
        
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email,
              name,
              role: 'member' // Default role for new users
            }
          ]);
        
        if (profileError) {
          logger.error('Failed to create user profile', { context: 'database', data: { error: profileError } });
          throw profileError;
        }
        
        logger.info('Successfully created user profile', { context: 'database', data: { userId: data.user.id, name } });

        setSuccess(true);
        logger.info('User registration completed successfully', { context: 'auth', data: { userId: data.user.id } });
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      logger.error('Registration error', { error: err });
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex h-screen items-center justify-center px-4 md:px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your information to create a LetterLoop account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Success message */}
            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
                Account created successfully! Redirecting to login...
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading || success}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
