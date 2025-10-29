
import { Role } from './constants';

export interface Department {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string; // Not in DB schema but added for convenience
  department_id: string;
  role: Role;
  department?: Department; // Joined data
}

export interface Shift {
  id: string;
  name:string;
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
  department_id: string;
}

export interface WorkSchedule {
  id: string;
  user_id: string;
  shift_id: string;
  work_date: string; // "YYYY-MM-DD"
  notes: string | null;
  created_by: string;
  user?: UserProfile; // Joined data
  shift?: Shift; // Joined data
}

export type CalendarViewType = 'MONTH' | 'WEEK' | 'DAY';
