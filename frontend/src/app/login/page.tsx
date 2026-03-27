'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/chat');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-500 rounded-full mb-4 shadow-lg shadow-indigo-500/50">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NexChat</h1>
          <p className="text-indigo-200 mt-2">Welcome back!</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="aziz@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center group"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Login 
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-indigo-200 mt-8 text-sm">
          Don't have an account? {' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
