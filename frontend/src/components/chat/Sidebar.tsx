'use client';

import { useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { Search, LogOut, Settings, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { users, activeUser, setActiveUser, me } = useChatStore();
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 h-full glass border-r border-white/5 flex flex-col overflow-hidden relative z-20">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
          NexChat
        </h1>
        <div className="flex gap-1">
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
          <p className="text-[10px] text-slate-400 truncate uppercase tracking-widest">{me?.role}</p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 px-6 mt-2">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar pb-6">
        <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Recent Chats
        </div>
        <AnimatePresence initial={false}>
          {filteredUsers.map((user) => (
            <motion.button
              key={user.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => setActiveUser(user)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all relative group ${
                activeUser?.id === user.id ? 'bg-indigo-600/90 shadow-lg shadow-indigo-600/20 text-white' : 'hover:bg-white/5 text-slate-300'
              }`}
            >
              <Avatar name={user.name} status={user.status} />
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <span className={`text-[9px] ${activeUser?.id === user.id ? 'text-indigo-200' : 'text-slate-500'}`}>12:30</span>
                </div>
                <p className={`text-[11px] truncate ${activeUser?.id === user.id ? 'text-indigo-100/70' : 'text-slate-500'}`}>
                  Click to start chatting
                </p>
              </div>
              {user._count?.sentMessages ? (
                <Badge variant="accent" className="animate-bounce">
                  {user._count.sentMessages}
                </Badge>
              ) : null}
              {activeUser?.id === user.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
        
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-30">
            <MessageSquare size={32} />
            <p className="text-xs mt-2">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
