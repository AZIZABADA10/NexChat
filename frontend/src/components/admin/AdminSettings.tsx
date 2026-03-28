'use client';

import { useEffect, useState } from 'react';
import { Settings, EyeOff, ShieldCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function AdminSettings() {
  const [stealthMode, setStealthMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/admin/settings');
        const stealth = data.find((s: any) => s.key === 'STEALTH_MODE');
        setStealthMode(stealth?.value === 'true');
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleToggleStealth = async () => {
    setLoading(true);
    try {
      const newValue = !stealthMode;
      await api.post('/admin/settings', { key: 'STEALTH_MODE', value: String(newValue) });
      setStealthMode(newValue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight mb-2">System Control Panel</h2>
        <p className="text-slate-500 text-sm font-light">Manage global application behavior and privacy settings.</p>
      </div>

      <div className="space-y-4">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="glass p-6 rounded-[2rem] border border-white/5 flex items-center justify-between"
        >
          <div className="flex gap-4">
            <div className={`p-4 rounded-3xl flex items-center justify-center transition-all ${stealthMode ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
              <EyeOff size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white">Stealth Read Mode</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                When enabled, you can read user messages without triggering the "Seen" status on their end.
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleToggleStealth}
            disabled={loading}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${stealthMode ? 'bg-indigo-600' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${stealthMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </motion.div>

        <div className="p-6 rounded-[2rem] border border-indigo-500/10 bg-indigo-500/5 flex gap-4">
          <Info className="text-indigo-400 shrink-0" size={20} />
          <div className="text-xs text-slate-400 leading-relaxed">
            <p className="font-bold text-indigo-300 uppercase tracking-widest text-[9px] mb-1">Architecture Note</p>
            The stealth mode operates at the WebSocket layer. When active, message status events are intercepted and dropped before they reach recipients, ensuring complete invisibility.
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5">
        <div className="flex items-center gap-2 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck size={12} /> Root Administrative Access Verified
        </div>
      </div>
    </div>
  );
}
