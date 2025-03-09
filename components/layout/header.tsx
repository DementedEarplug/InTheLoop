"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/supabase/hooks';
import { supabase } from '@/lib/supabase/client';
import { useState } from 'react';

/**
 * Main application header with navigation
 */
export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Navigation items with their paths and labels
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/loops', label: 'Loops' },
    { path: '/questions', label: 'Questions' },
    { path: '/my-responses', label: 'My Responses' },
  ];
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      
      // Small delay to ensure auth state is cleared
      // await new Promise(resolve => setTimeout(resolve, 3000));
      
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <header className="border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">LetterLoop</span>
          </Link>
          
          {/* Main navigation */}
          <nav className={cn(
            "md:flex items-center space-x-6",
            !user && "hidden"
          )}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Auth buttons */}
        <div className="flex items-center gap-4">
          {!loading && !user ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="transition-opacity duration-200"
            >
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
