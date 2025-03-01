export type UserRole = 'coordinator' | 'member'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
}

export interface Loop {
  id: string
  name: string
  description: string
  coordinator_id: string
  send_date: number // Day of month to send newsletter
  grace_period: number // Days to wait for responses
  created_at: string
}

export interface LoopMember {
  id: string
  loop_id: string
  user_id: string
  email: string
  name: string
  created_at: string
}

export interface Question {
  id: string
  text: string
  is_default: boolean
  created_by: string
  created_at: string
}

export interface LoopQuestion {
  id: string
  loop_id: string
  question_id: string
  month: number
  year: number
  created_at: string
}

export interface Response {
  id: string
  loop_id: string
  question_id: string
  member_id: string
  text: string
  media_url?: string
  month: number
  year: number
  created_at: string
}

export interface Newsletter {
  id: string
  loop_id: string
  month: number
  year: number
  status: 'draft' | 'sent'
  sent_at?: string
  created_at: string
}
