
import React, { useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('member1@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };
  
  const quickLogin = async (userEmail: string) => {
      setEmail(userEmail);
      setPassword('password'); // mock password
      setLoading(true);
      setError('');
      try {
        await login(userEmail, 'password');
      } catch (err: any) {
        setError(err.message || 'Failed to login');
      } finally {
        setLoading(false);
      }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Workforce Scheduler
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <Input
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Quick Logins</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3">
              <Button variant="secondary" onClick={() => quickLogin('member1@example.com')} disabled={loading}>Login as Member</Button>
              <Button variant="secondary" onClick={() => quickLogin('admin@example.com')} disabled={loading}>Login as Dept. Admin</Button>
              <Button variant="secondary" onClick={() => quickLogin('leader@example.com')} disabled={loading}>Login as Leadership</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
