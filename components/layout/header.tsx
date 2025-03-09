"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/supabase/hooks';

/**
 * Main application header with navigation
 */
export function Header() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  
  // Navigation items with their paths and labels
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/loops', label: 'Loops' },
    { path: '/questions', label: 'Questions' },
    { path: '/my-responses', label: 'My Responses' },
  ];
  
  return (
    <header className="border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">LetterLoop</span>
          </Link>
          
          {/* Main navigation */}
          <nav className="md:flex items-center gap-6">
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
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default Header;
