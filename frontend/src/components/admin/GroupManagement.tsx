'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, X, Search, MessageSquare, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';

export default function GroupManagement() {
  const [groups, setGroups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [gRes, uRes] = await Promise.all([
        api.get('/groups/my'),
        api.get('/admin/users')
      ]);
      setGroups(gRes.data);
      setUsers(uRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName || selectedUserIds.length === 0) return;
    try {
      await api.post('/groups', { 
        name: newGroupName, 
        userIds: selectedUserIds 
      });
      setIsCreating(false);
      setNewGroupName('');
      setSelectedUserIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight">Messaging Groups</h2>
        <Button onClick={() => setIsCreating(true)} size="sm">
          <Plus size={16} className="mr-2" /> New Group
        </Button>
      </div>

      {/* Create Group Modal-like state */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass p-6 rounded-3xl border border-indigo-500/20 overflow-hidden"
          >
            <div className="flex justify-between mb-6">
              <h3 className="font-bold text-indigo-400 tracking-wider uppercase text-xs">Create New Circle</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Group Name</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-indigo-500/50 outline-none"
                    placeholder="Engineering Team..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
                <div className="pt-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Selected Members ({selectedUserIds.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {users.filter(u => selectedUserIds.includes(u.id)).map(u => (
                      <div key={u.id} className="p-1 pr-3 bg-indigo-600/20 rounded-full flex items-center gap-2 border border-indigo-500/20">
                        <Avatar name={u.name} size="sm" />
                        <span className="text-xs text-indigo-200 font-medium">{u.name.split(' ')[0]}</span>
                        <X onClick={() => toggleUserSelection(u.id)} size={12} className="cursor-pointer hover:text-white" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 max-h-[300px] flex flex-col">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Find users..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                  {users.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map(user => (
                    <button
                      key={user.id}
                      onClick={() => toggleUserSelection(user.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                        selectedUserIds.includes(user.id) ? 'bg-indigo-600/40 border border-indigo-500/20' : 'hover:bg-white/5'
                      }`}
                    >
                      <Avatar name={user.name} status={user.status} size="sm" />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-[10px] text-slate-500">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button onClick={handleCreateGroup} disabled={!newGroupName || selectedUserIds.length === 0}>
                Create Group
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <motion.div
            key={group.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
               <Shield size={24} className="text-indigo-500" />
            </div>
            
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/10">
                  <Users size={28} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{group.name}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{group.members.length} Members</p>
                </div>
              </div>

              <div className="flex -space-x-3 mb-6 items-center">
                {group.members.slice(0, 5).map((m: any) => (
                  <Avatar key={m.userId} name={m.user.name} size="sm" className="border-2 border-[#020617]" />
                ))}
                {group.members.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#020617] flex items-center justify-center text-[10px] font-bold text-slate-400">
                    +{group.members.length - 5}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-indigo-500" />
                  {group._count.messages} Total Messages
                </div>
                <button className="text-white hover:text-indigo-400 transition-colors">Details</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="py-20 text-center glass rounded-3xl opacity-30">
          <MessageSquare size={48} className="mx-auto mb-4" />
          <p>No groups created yet. Click "New Group" to start.</p>
        </div>
      )}
    </div>
  );
}
