export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Loop {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  is_active: boolean;
  frequency: 'monthly' | 'quarterly';
  next_issue_date?: string;
}

export interface LoopMember {
  id: string;
  loop_id: string;
  user_id: string;
  role: 'coordinator' | 'member';
  joined_at: string;
  user?: User;
}

export interface Question {
  id: string;
  text: string;
  is_default: boolean;
  created_by: string;
  created_at: string;
}

export interface LoopQuestion {
  id: string;
  loop_id: string;
  question_id: string;
  month: number;
  year: number;
  created_at: string;
}

export interface Answer {
  id: string;
  loop_question_id: string;
  user_id: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface Newsletter {
  id: string;
  loop_id: string;
  title: string;
  content: string;
  published_at?: string;
  created_at: string;
  month: number;
  year: number;
}
