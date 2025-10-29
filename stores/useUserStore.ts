
import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import type { UserProfile } from '../types';

interface UserState {
  users: UserProfile[];
  loading: boolean;
  fetchUsers: (departmentId?: string) => Promise<void>;
  updateUser: (id: string, data: Partial<UserProfile>) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  fetchUsers: async (departmentId) => {
    set({ loading: true });
    let query = supabase.from('profiles').select('*');
    if (departmentId) {
        query = query.eq('department_id', departmentId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching users:', error);
      set({ loading: false });
      return;
    }
    set({ users: data as UserProfile[], loading: false });
  },
  updateUser: async (id, data) => {
    const { error } = await supabase.from('profiles').update(data).eq('id', id);
    if (error) console.error('Error updating user:', error);
  },
}));
