import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import type { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  session: any | null; // Replace 'any' with Supabase session type if available
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  login: async (email, password) => {
    set({ loading: true });
    // FIX: The mock `signInWithPassword` function only accepts `email`. The password was extraneous.
    const { data, error } = await supabase.auth.signInWithPassword({ email });
    if (error) {
      set({ loading: false });
      throw new Error(error.message);
    }
    if (data.user) {
      set({ user: data.user as UserProfile, session: data.session, loading: false });
    }
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
  checkSession: async () => {
    set({ loading: true });
    // In a real app, you'd get the user from the session and then fetch their profile.
    // Here we just use the mock user from the sign-in.
    const { data } = await supabase.auth.getSession();
    if (data.session) {
       // Our mock directly puts the profile in the session user object
       set({ user: data.session.user as UserProfile, session: data.session, loading: false });
    } else {
       set({ user: null, session: null, loading: false });
    }
  },
}));