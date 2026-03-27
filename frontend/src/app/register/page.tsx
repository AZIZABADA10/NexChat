'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { UserPlus, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-fuchsia-500 rounded-full mb-4 shadow-lg shadow-fuchsia-500/50">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Join NexChat</h1>
          <p className="text-indigo-200 mt-2">Connect with Aziz today.</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-light"
              placeholder="Jean Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-200 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              placeholder="jane@example.com"
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
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-fuchsia-600/30 transition-all flex items-center justify-center group mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Create Account 
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-indigo-200 mt-8 text-sm">
          Already have an account? {' '}
          <Link href="/login" className="text-fuchsia-400 hover:text-fuchsia-300 font-semibold underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
