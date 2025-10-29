// This is a mock Supabase client to make the app runnable without a real backend.
// It simulates the Supabase API and Row Level Security (RLS).

import { Role } from '../constants';
import type { Department, Shift, UserProfile, WorkSchedule } from '../types';

// --- MOCK DATABASE ---
const departments: Department[] = [
  { id: 'd1', name: 'Engineering' },
  { id: 'd2', name: 'Sales' },
  { id: 'd3', name: 'Marketing' },
];

const users: UserProfile[] = [
  { id: 'u1', full_name: 'Alex Johnson', email: 'leader@example.com', department_id: 'd1', role: Role.LEADERSHIP },
  { id: 'u2', full_name: 'Maria Garcia', email: 'admin@example.com', department_id: 'd1', role: Role.DEPT_ADMIN },
  { id: 'u3', full_name: 'James Smith', email: 'member1@example.com', department_id: 'd1', role: Role.MEMBER },
  { id: 'u4', full_name: 'Patricia Williams', email: 'member2@example.com', department_id: 'd1', role: Role.MEMBER },
  { id: 'u5', full_name: 'John Brown', email: 'salesadmin@example.com', department_id: 'd2', role: Role.DEPT_ADMIN },
  { id: 'u6', full_name: 'Jennifer Jones', email: 'salesmember@example.com', department_id: 'd2', role: Role.MEMBER },
];

const shifts: Shift[] = [
  { id: 's1', name: 'Morning Shift', start_time: '08:00', end_time: '16:00', department_id: 'd1' },
  { id: 's2', name: 'Afternoon Shift', start_time: '16:00', end_time: '00:00', department_id: 'd1' },
  { id: 's3', name: 'Night Shift', start_time: '00:00', end_time: '08:00', department_id: 'd1' },
  { id: 's4', name: 'Sales AM', start_time: '09:00', end_time: '17:00', department_id: 'd2' },
  { id: 's5', name: 'Sales PM', start_time: '12:00', end_time: '20:00', department_id: 'd2' },
];

let workSchedules: WorkSchedule[] = [
  // ... seed data
  { id: 'ws1', user_id: 'u3', shift_id: 's1', work_date: '2024-07-29', notes: 'Project kickoff', created_by: 'u2' },
  { id: 'ws2', user_id: 'u4', shift_id: 's2', work_date: '2024-07-29', notes: null, created_by: 'u2' },
  { id: 'ws3', user_id: 'u6', shift_id: 's4', work_date: '2024-07-30', notes: 'Client meeting', created_by: 'u5' },
];


// --- MOCK CLIENT LOGIC ---
let currentUser: UserProfile | null = null;

const mockAuth = {
  async signInWithPassword({ email }: { email: string }) {
    const user = users.find(u => u.email === email);
    if (user) {
      currentUser = user;
      return { data: { user, session: { access_token: 'mock_token' } }, error: null };
    }
    return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } };
  },
  async signOut() {
    currentUser = null;
    return { error: null };
  },
  getSession: async () => {
    if (currentUser) {
        return { data: { session: { user: currentUser } } }
    }
    return { data: { session: null } }
  }
};

const applyRls = (table: string, data: any[]) => {
  if (!currentUser) return [];
  
  if (currentUser.role === Role.LEADERSHIP) {
    return data;
  }

  switch (table) {
    case 'profiles':
        if (currentUser.role === Role.DEPT_ADMIN) {
            return data.filter(u => u.department_id === currentUser.department_id);
        }
        return data.filter(u => u.id === currentUser.id);

    case 'work_schedules':
        if (currentUser.role === Role.DEPT_ADMIN) {
            const userIdsInDept = users.filter(u => u.department_id === currentUser.department_id).map(u => u.id);
            return data.filter(ws => userIdsInDept.includes(ws.user_id));
        }
        return data.filter(ws => ws.user_id === currentUser.id);
        
    case 'shifts':
         if (currentUser.role === Role.DEPT_ADMIN) {
            return data.filter(s => s.department_id === currentUser.department_id);
         }
         return data; // Members can see all shifts
    
    case 'departments':
        return data; // Everyone can see all departments

    default:
      return data;
  }
};

class MockQueryBuilder {
  private data: any[];
  private error: Error | null = null;

  constructor(private table: string) {
    let sourceData;
    switch (table) {
      case 'profiles': sourceData = users; break;
      case 'departments': sourceData = departments; break;
      case 'shifts': sourceData = shifts; break;
      case 'work_schedules': sourceData = workSchedules; break;
      default: sourceData = []; this.error = new Error(`Table ${table} not found`);
    }
    this.data = JSON.parse(JSON.stringify(sourceData)); // Deep copy
  }

  select(query = '*') {
    if (query !== '*' && query.includes('profiles(*)')) { // basic join simulation
        this.data = this.data.map(item => {
            const user = users.find(u => u.id === item.user_id);
            return {...item, user };
        });
    }
    if (query !== '*' && query.includes('shifts(*)')) {
        this.data = this.data.map(item => {
            const shift = shifts.find(s => s.id === item.shift_id);
            return {...item, shift };
        });
    }
    return this;
  }

  eq(column: string, value: any) {
    this.data = this.data.filter(item => item[column] === value);
    return this;
  }
  
  in(column: string, values: any[]) {
    this.data = this.data.filter(item => values.includes(item[column]));
    return this;
  }

  lte(column: string, value: any) {
    this.data = this.data.filter(item => item[column] <= value);
    return this;
  }
  
  gte(column: string, value: any) {
    this.data = this.data.filter(item => item[column] >= value);
    return this;
  }

  order(column: string, { ascending }: { ascending: boolean }) {
    this.data.sort((a, b) => {
        if (a[column] < b[column]) return ascending ? -1 : 1;
        if (a[column] > b[column]) return ascending ? 1 : -1;
        return 0;
    });
    return this;
  }
  
  async then(resolve: (result: { data: any[], error: Error | null }) => void) {
    setTimeout(() => { // Simulate network delay
        const rlsData = applyRls(this.table, this.data);
        resolve({ data: rlsData, error: this.error });
    }, 200);
  }

  async insert(newData: any) {
    if (!currentUser) return { error: { message: 'Permission denied' } };
    const newItem = { ...newData, id: `new_${Date.now()}`, created_at: new Date().toISOString() };
    if (this.table === 'work_schedules') {
      workSchedules.push(newItem);
    } else if (this.table === 'shifts') {
      shifts.push(newItem);
    }
    return { data: [newItem], error: null };
  }

  // FIX: Made `update` synchronous to allow for method chaining (e.g., .update().eq()).
  // The original `async` version returned a Promise, which broke the chain.
  // The mock doesn't actually perform an update, but this fixes the compile error.
  update(updatedData: any) {
    if (!currentUser) {
      this.error = new Error('Permission denied');
    }
    return this;
  }
  
  // FIX: Made `delete` synchronous to allow for method chaining (e.g., .delete().eq()).
  // The original `async` version returned a Promise, which broke the chain.
  // The mock doesn't actually perform a delete, but this fixes the compile error.
  delete() {
    if (!currentUser) {
      this.error = new Error('Permission denied');
    }
    return this;
  }
}


export const supabase = {
  auth: mockAuth,
  from: (table: string) => new MockQueryBuilder(table),
};