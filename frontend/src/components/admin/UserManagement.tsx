'use client';

import { useEffect, useState } from 'react';
import { User, Trash2, ShieldAlert, ShieldCheck, Search, Mail, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (userId: string, isBanned: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}`, { isBanned: !isBanned });
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: !isBanned } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white tracking-tight">System Users</h2>
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-500/50 outline-none w-64 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map((user, i) => (
            <motion.div
              layout
              key={user.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`glass p-5 rounded-3xl border ${user.isBanned ? 'border-red-500/20 bg-red-500/5' : 'border-white/5'} shadow-xl group`}
            >
              <div className="flex items-start justify-between mb-4">
                <Avatar name={user.name} status={user.status} size="lg" />
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleToggleBan(user.id, user.isBanned)}
                    className={`p-2 rounded-xl transition-colors ${user.isBanned ? 'text-green-400 hover:bg-green-400/10' : 'text-amber-400 hover:bg-amber-400/10'}`}
                    title={user.isBanned ? 'Unban User' : 'Ban User'}
                  >
                    {user.isBanned ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-white truncate">{user.name}</h3>
                  {user.isBanned && <Badge variant="primary" className="bg-red-500">BANNED</Badge>}
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mail size={12} className="text-slate-600" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={12} className="text-slate-600" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {user._count.sentMessages} Messages Sent
                  </div>
                  <div className={`text-[10px] uppercase font-bold tracking-widest ${user.status === 'ONLINE' ? 'text-green-500' : 'text-slate-600'}`}>
                    {user.status}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && filteredUsers.length === 0 && (
        <div className="py-20 text-center glass rounded-3xl opacity-30">
          <User size={48} className="mx-auto mb-4" />
          <p>No users match your search criteria</p>
        </div>
      )}
    </div>
  );
}
