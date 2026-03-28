'use client';

import { useEffect, useState } from 'react';
import { Search, Settings, LogOut, MessageSquare, Users, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { users, activeUser, setActiveUser, me } = useChatStore();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<'PRIVATE' | 'GROUP'>('PRIVATE');
  const [groups, setGroups] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      const { data } = await api.get('/groups/my');
      setGroups(data);
    };
    fetchGroups();
  }, [activeType]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 h-full glass border-r border-white/5 flex flex-col overflow-hidden relative z-20">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
          NexChat
        </h1>
        <div className="flex gap-1">
          {me?.role === 'ADMIN' && (
            <button 
              onClick={() => router.push('/admin')} 
              className="p-2 hover:bg-white/5 rounded-full text-indigo-400 transition-colors"
              title="Admin Dashboard"
            >
              <ShieldCheck size={18} />
            </button>
          )}
          <button className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
            <Settings size={18} />
          </button>
          <button onClick={onLogout} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Profile summary */}
      <div className="mx-4 mt-4 p-3 glass-light rounded-2xl flex items-center gap-3">
        <Avatar name={me?.name || 'Me'} status="ONLINE" size="sm" />
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-semibold truncate">{me?.name}</p>
          <p className="text-[10px] text-slate-500 truncate uppercase tracking-widest font-bold tracking-tighter shrink-0">{me?.role}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-white/5 mx-6 mt-4 rounded-xl border border-white/5">
        <button 
          onClick={() => setActiveType('PRIVATE')}
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeType === 'PRIVATE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Direct
        </button>
        <button 
          onClick={() => setActiveType('GROUP')}
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${activeType === 'GROUP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Groups
        </button>
      </div>

      {/* Search */}
      <div className="p-4 px-6 mt-2">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
          <input
            type="text"
            placeholder={activeType === 'PRIVATE' ? "Search users..." : "Search groups..."}
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar pb-6">
        <AnimatePresence mode="wait">
          {activeType === 'PRIVATE' ? (
            <motion.div key="private" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setActiveUser(user)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative group mb-1 ${
                    activeUser?.id === user.id ? 'bg-indigo-600/90 shadow-lg shadow-indigo-600/20 text-white' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <Avatar name={user.name} status={user.status} />
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                    </div>
                    <p className={`text-[11px] truncate ${activeUser?.id === user.id ? 'text-indigo-100/70' : 'text-slate-500'}`}>
                      {user.status === 'ONLINE' ? 'Active now' : 'Away'}
                    </p>
                  </div>
                  {activeUser?.id === user.id && (
                    <motion.div layoutId="activeTab" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                  )}
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div key="group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => setActiveUser({ ...group, role: 'GROUP' })} // Mark as group
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative group mb-1 ${
                    activeUser?.id === group.id ? 'bg-indigo-600/90 shadow-lg shadow-indigo-600/20 text-white' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5">
                    <Users size={18} className={activeUser?.id === group.id ? 'text-white' : 'text-indigo-400'} />
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm font-semibold truncate">{group.name}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-widest ${activeUser?.id === group.id ? 'text-indigo-100/70' : 'text-slate-500'}`}>
                      {group.members.length} Members
                    </p>
                  </div>
                  {activeUser?.id === group.id && (
                    <motion.div layoutId="activeTabGroup" className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
