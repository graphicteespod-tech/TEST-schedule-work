
import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import type { Shift } from '../types';

interface ShiftState {
  shifts: Shift[];
  loading: boolean;
  fetchShifts: (departmentId?: string) => Promise<void>;
  createShift: (data: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (id: string, data: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
}

export const useShiftStore = create<ShiftState>((set) => ({
  shifts: [],
  loading: false,
  fetchShifts: async (departmentId) => {
    set({ loading: true });
    let query = supabase.from('shifts').select('*');
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    const { data, error } = await query.order('start_time', { ascending: true });
    if (error) {
      console.error('Error fetching shifts:', error);
      set({ loading: false });
      return;
    }
    set({ shifts: data as Shift[], loading: false });
  },
  createShift: async (shiftData) => {
    const { error } = await supabase.from('shifts').insert(shiftData);
    if (error) console.error('Error creating shift:', error);
  },
  updateShift: async (id, data) => {
    const { error } = await supabase.from('shifts').update(data).eq('id', id);
    if (error) console.error('Error updating shift:', error);
  },
  deleteShift: async (id) => {
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) console.error('Error deleting shift:', error);
  },
}));
