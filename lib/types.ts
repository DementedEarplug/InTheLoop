// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'coordinator' | 'member';
  created_at?: string;
  updated_at?: string;
}

// Loop types
export interface Loop {
  id: string;
  name: string;
  description?: string;
  coordinator_id: string;
  send_day?: number;
  grace_period_days?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LoopMember {
  id: string;
  loop_id: string;
  user_id: string;
  status: 'active' | 'inactive' | 'pending';
  created_at?: string;
  updated_at?: string;
}

// Question types
export interface Question {
  id: string;
  text: string;
  created_by: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoopQuestion {
  id: string;
  loop_id: string;
  question_id: string;
  send_date: string;
  status: 'pending' | 'sent' | 'completed';
  created_at?: string;
  updated_at?: string;
}

// Response types
export interface Response {
  id: string;
  loop_question_id: string;
  user_id: string;
  text: string;
  media_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Newsletter types
export interface Newsletter {
  id: string;
  loop_id: string;
  title: string;
  send_date: string;
  status: 'draft' | 'sent';
  created_at?: string;
  updated_at?: string;
}
