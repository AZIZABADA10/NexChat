'use client';

import { useEffect, useState } from 'react';
import { Users, Activity, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
    
    // Refresh every 30s or on specific socket events
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div className="h-40 flex items-center justify-center text-slate-500">Loading statistics...</div>;

  const data = [
    { name: 'Total Users', value: stats.totalUsers },
    { name: 'Online', value: stats.onlineUsers },
    { name: 'Total Messages', value: stats.totalMessages },
    { name: 'Active (24h)', value: stats.activeConvs },
  ];

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
          { label: 'Online Now', value: stats.onlineUsers, icon: Activity, color: 'text-green-400' },
          { label: 'Total Messages', value: stats.totalMessages, icon: MessageSquare, color: 'text-purple-400' },
          { label: 'Active 24h', value: stats.activeConvs, icon: MessageSquare, color: 'text-pink-400' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl border border-white/5 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-3xl font-black text-white">{item.value}</p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="glass p-6 rounded-3xl border border-white/5 shadow-xl h-80">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Growth & Engagement</h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
              cursor={{ fill: '#ffffff05' }}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
