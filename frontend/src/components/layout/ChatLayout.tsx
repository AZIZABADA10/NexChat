'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function ChatLayout({ sidebar, children }: ChatLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-screen w-full flex bg-[#020617] overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Mobile Toggle */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 left-4 z-50 p-2 glass rounded-xl text-white shadow-xl"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Sidebar Container */}
      <AnimatePresence mode="wait">
        {(isSidebarOpen || !isMobile) && (
          <motion.div
            initial={isMobile ? { x: -320 } : false}
            animate={{ x: 0 }}
            exit={isMobile ? { x: -320 } : false}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`absolute lg:relative z-40 h-full ${isMobile ? 'w-[280px]' : 'w-80'}`}
          >
            {sidebar}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 h-full relative z-10">
        {children}
      </div>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30"
        />
      )}
    </div>
  );
}
