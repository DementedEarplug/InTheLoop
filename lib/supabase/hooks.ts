import { useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './client';
import { User } from '../types';
import logger from '../logger';

/**
 * Custom hook to get the current authenticated user
 * @returns Current user object and loading state
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current user from Supabase auth
    const getCurrentUser = async () => {
      try {
        setLoading(true);
        
        // Get session data
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          setUser(null);
          return;
        }
        
        // Get user profile data from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userError) {
          throw userError;
        }
        
        setUser(userData as User);
      } catch (error) {
        logger.error('Error fetching user data', { error });
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          // Fetch user profile when auth state changes
          supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data, error }) => {
              if (error) {
                logger.error('Error fetching user profile', { error });
                setUser(null);
              } else {
                setUser(data as User);
              }
              setLoading(false);
            });
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}

/**
 * Custom hook to handle authentication
 * @returns Auth methods and states
 */
export function useAuth() {
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      logger.error('Sign in error', { error });
      setAuthError(error.message || 'Failed to sign in');
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
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
        
        if (profileError) throw profileError;
      }
      
      return { success: true };
    } catch (error: any) {
      logger.error('Sign up error', { error });
      setAuthError(error.message || 'Failed to sign up');
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      logger.error('Sign out error', { error });
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };
  
  return {
    signIn,
    signUp,
    signOut,
    authLoading,
    authError
  };
}
