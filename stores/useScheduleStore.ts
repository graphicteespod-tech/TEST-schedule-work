
import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import type { WorkSchedule } from '../types';

interface ScheduleState {
  schedules: WorkSchedule[];
  loading: boolean;
  fetchSchedules: (filters: { userId?: string; departmentId?: string; startDate: string; endDate: string }) => Promise<void>;
  createSchedule: (data: Omit<WorkSchedule, 'id' | 'user' | 'shift'>) => Promise<void>;
  updateSchedule: (id: string, data: Partial<WorkSchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],
  loading: false,
  fetchSchedules: async ({ userId, departmentId, startDate, endDate }) => {
    set({ loading: true });
    let query = supabase
      .from('work_schedules')
      .select('*, user:profiles(*), shift:shifts(*)')
      .gte('work_date', startDate)
      .lte('work_date', endDate);
    
    // In a real app with RLS, Supabase handles security. Here, our mock does.
    // We only add userId filter for individual views for clarity.
    if(userId) {
        query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching schedules:', error);
      set({ loading: false });
      return;
    }
    set({ schedules: data as WorkSchedule[], loading: false });
  },
  createSchedule: async (scheduleData) => {
    const { error } = await supabase.from('work_schedules').insert(scheduleData);
    if (error) {
      console.error('Error creating schedule:', error);
    } else {
      // Re-fetch schedules to show the new one
      // This is a simple approach; more advanced state updates are possible.
    }
  },
  updateSchedule: async (id, data) => {
    const { error } = await supabase.from('work_schedules').update(data).eq('id', id);
    if (error) {
      console.error('Error updating schedule:', error);
    }
  },
  deleteSchedule: async (id) => {
    const { error } = await supabase.from('work_schedules').delete().eq('id', id);
     if (error) {
      console.error('Error deleting schedule:', error);
    }
  },
}));
