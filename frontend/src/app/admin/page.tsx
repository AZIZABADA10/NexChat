'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import { getSocket, disconnectSocket } from '@/lib/socket';
import api from '@/lib/api';
import ChatLayout from '@/components/layout/ChatLayout';
import Sidebar from '@/components/chat/Sidebar';
import DashboardStats from '@/components/admin/DashboardStats';
import UserManagement from '@/components/admin/UserManagement';
import GroupManagement from '@/components/admin/GroupManagement';
import AdminSettings from '@/components/admin/AdminSettings';
import { BarChart3, Users, LayoutGrid, Settings, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboardPage() {
  const { setMe, setUsers, activeUser } = useChatStore();
  const [activeTab, setActiveTab] = useState('stats');
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr || JSON.parse(userStr).role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    const me = JSON.parse(userStr);
    setMe(me);

    const fetchData = async () => {
      try {
        const { data: convs } = await api.get('/messages/conversations');
        setUsers(convs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();

    getSocket().connect();
    return () => disconnectSocket();
  }, []);

  const tabs = [
    { id: 'stats', label: 'Overview', icon: LayoutGrid },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'groups', label: 'Groups', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen w-full flex bg-[#020617] overflow-hidden text-slate-100">
      {/* Mini Sidebar Nav */}
      <div className="w-20 sm:w-24 h-full glass border-r border-white/5 flex flex-col items-center py-8 gap-10 z-30">
        <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <BarChart3 className="text-white" size={24} />
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl transition-all relative group ${
                activeTab === tab.id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              <tab.icon size={22} />
              {activeTab === tab.id && (
                <motion.div layoutId="tabIndicator" className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full" />
              )}
              <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        <button 
          onClick={() => router.push('/chat')}
          className="p-4 text-slate-500 hover:text-white transition-colors"
          title="Open Chat"
        >
          <MessageSquare size={22} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 h-full overflow-y-auto custom-scrollbar relative">
        <div className="max-w-7xl mx-auto p-6 sm:p-10">
          {/* Header */}
          <header className="mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em] mb-2">Management Suite</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 px-4 pr-2">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none">Admin Area</p>
                  <p className="text-[10px] text-slate-500 font-medium">Verified Session</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-black text-indigo-400 border border-white/5">
                A
               </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'stats' && <DashboardStats />}
              {activeTab === 'users' && <UserManagement />}
              {activeTab === 'groups' && <GroupManagement />}
              {activeTab === 'settings' && <AdminSettings />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Decor */}
        <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      </div>
    </div>
  );
}
