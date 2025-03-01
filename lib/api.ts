/**
 * API utilities for interacting with Supabase
 */
import { supabase } from './supabase/client';
import { Loop, Question, Response, User, LoopQuestion, LoopMember } from './types';
import logger from './logger';

const contextLogger = logger.createContextLogger('API');

/**
 * Fetch all loops for a user
 * @param userId - User ID to fetch loops for
 * @returns Array of loops
 */
export async function getLoops(userId: string): Promise<Loop[]> {
  try {
    // For coordinators, get loops they created
    const { data: coordinatorLoops, error: coordinatorError } = await supabase
      .from('loops')
      .select('*')
      .eq('coordinator_id', userId);
    
    if (coordinatorError) throw coordinatorError;
    
    // For members, get loops they're part of
    const { data: memberLoops, error: memberError } = await supabase
      .from('loop_members')
      .select('loop_id')
      .eq('user_id', userId)
      .eq('status', 'active');
    
    if (memberError) throw memberError;
    
    // If user is a member of any loops, fetch those loops
    let memberLoopDetails: Loop[] = [];
    if (memberLoops && memberLoops.length > 0) {
      const loopIds = memberLoops.map(member => member.loop_id);
      const { data: loopDetails, error: loopError } = await supabase
        .from('loops')
        .select('*')
        .in('id', loopIds);
      
      if (loopError) throw loopError;
      memberLoopDetails = loopDetails || [];
    }
    
    // Combine and deduplicate loops
    const allLoops = [...(coordinatorLoops || []), ...memberLoopDetails];
    const uniqueLoops = Array.from(
      new Map(allLoops.map(loop => [loop.id, loop])).values()
    );
    
    return uniqueLoops;
  } catch (error) {
    contextLogger.error('Failed to fetch loops', { error, userId });
    throw error;
  }
}

/**
 * Fetch a single loop by ID
 * @param loopId - Loop ID to fetch
 * @returns Loop object or null if not found
 */
export async function getLoop(loopId: string): Promise<Loop | null> {
  try {
    const { data, error } = await supabase
      .from('loops')
      .select('*')
      .eq('id', loopId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    contextLogger.error('Failed to fetch loop', { error, loopId });
    return null;
  }
}

/**
 * Create a new loop
 * @param loop - Loop data to create
 * @returns Created loop or null on error
 */
export async function createLoop(loop: Omit<Loop, 'id' | 'created_at' | 'updated_at'>): Promise<Loop | null> {
  try {
    const { data, error } = await supabase
      .from('loops')
      .insert([loop])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    contextLogger.error('Failed to create loop', { error, loop });
    return null;
  }
}

/**
 * Update an existing loop
 * @param loopId - ID of loop to update
 * @param updates - Loop data to update
 * @returns Updated loop or null on error
 */
export async function updateLoop(
  loopId: string, 
  updates: Partial<Omit<Loop, 'id' | 'created_at' | 'updated_at'>>
): Promise<Loop | null> {
  try {
    const { data, error } = await supabase
      .from('loops')
      .update(updates)
      .eq('id', loopId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    contextLogger.error('Failed to update loop', { error, loopId, updates });
    return null;
  }
}

/**
 * Delete a loop
 * @param loopId - ID of loop to delete
 * @returns Success status
 */
export async function deleteLoop(loopId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('loops')
      .delete()
      .eq('id', loopId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    contextLogger.error('Failed to delete loop', { error, loopId });
    return false;
  }
}

/**
 * Fetch questions for a loop
 * @param loopId - Loop ID to fetch questions for
 * @returns Array of questions with their details
 */
export async function getLoopQuestions(loopId: string): Promise<(LoopQuestion & { question: Question })[]> {
  try {
    const { data, error } = await supabase
      .from('loop_questions')
      .select(`
        *,
        question:question_id(*)
      `)
      .eq('loop_id', loopId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    contextLogger.error('Failed to fetch loop questions', { error, loopId });
    return [];
  }
}

/**
 * Add a question to a loop
 * @param loopQuestion - Loop question data
 * @returns Created loop question or null on error
 */
export async function addQuestionToLoop(
  loopQuestion: Omit<LoopQuestion, 'id' | 'created_at' | 'updated_at'>
): Promise<LoopQuestion | null> {
  try {
    const { data, error } = await supabase
      .from('loop_questions')
      .insert([loopQuestion])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    contextLogger.error('Failed to add question to loop', { error, loopQuestion });
    return null;
  }
}

/**
 * Fetch members of a loop
 * @param loopId - Loop ID to fetch members for
 * @returns Array of loop members with user details
 */
export async function getLoopMembers(loopId: string): Promise<(LoopMember & { user: User })[]> {
  try {
    const { data, error } = await supabase
      .from('loop_members')
      .select(`
        *,
        user:user_id(*)
      `)
      .eq('loop_id', loopId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    contextLogger.error('Failed to fetch loop members', { error, loopId });
    return [];
  }
}

/**
 * Add a member to a loop
 * @param loopMember - Loop member data
 * @returns Created loop member or null on error
 */
export async function addMemberToLoop(
  loopMember: Omit<LoopMember, 'id' | 'created_at' | 'updated_at'>
): Promise<LoopMember | null> {
  try {
    const { data, error } = await supabase
      .from('loop_members')
      .insert([loopMember])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    contextLogger.error('Failed to add member to loop', { error, loopMember });
    return null;
  }
}

/**
 * Fetch responses for a loop question
 * @param loopQuestionId - Loop question ID to fetch responses for
 * @returns Array of responses with user details
 */
export async function getResponses(loopQuestionId: string): Promise<(Response & { user: User })[]> {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select(`
        *,
        user:user_id(*)
      `)
      .eq('loop_question_id', loopQuestionId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    contextLogger.error('Failed to fetch responses', { error, loopQuestionId });
    return [];
  }
}

/**
 * Submit a response to a loop question
 * @param response - Response data
 * @returns Created response or null on error
 */
export async function submitResponse(
  response: Omit<Response, 'id' | 'created_at' | 'updated_at'>
): Promise<Response | null> {
  try {
    const { data, error } = await supabase
      .from('responses')
      .insert([response])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    contextLogger.error('Failed to submit response', { error, response });
    return null;
  }
}

/**
 * Fetch user responses
 * @param userId - User ID to fetch responses for
 * @returns Array of responses with question details
 */
export async function getUserResponses(userId: string): Promise<Response[]> {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select(`
        *,
        loop_question:loop_question_id(
          *,
          question:question_id(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    contextLogger.error('Failed to fetch user responses', { error, userId });
    return [];
  }
}
