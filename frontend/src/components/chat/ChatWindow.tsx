'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Avatar from '@/components/ui/Avatar';
import { MessageSquare, ShieldCheck, MoreVertical, Phone, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWindowProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  onReact: (messageId: string, emoji: string) => void;
  replyTo: any;
  setReplyTo: (msg: any) => void;
}

export default function ChatWindow({ onSendMessage, onTyping, onReact, replyTo, setReplyTo }: ChatWindowProps) {
  const { activeUser, messages, me, isTyping } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (!activeUser) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#020617]/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 glass rounded-full mb-8 shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
          <MessageSquare size={64} className="text-indigo-500 relative z-10" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Your conversations</h2>
        <p className="text-slate-400 max-w-sm font-light">
          Select a user to start a secure, real-time conversation. All messages are encrypted and private.
        </p>
        <div className="mt-12 flex items-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
          <ShieldCheck size={12} /> Securely connected to NexChat
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#020617]/30">
      {/* Header */}
      <div className="px-6 py-4 glass border-b border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Avatar name={activeUser.name} status={activeUser.status} size="lg" />
          <div>
            <h3 className="font-bold text-white tracking-tight">{activeUser.name}</h3>
            <p className="text-xs text-indigo-400 font-medium">
              {activeUser.status === 'ONLINE' ? 'Active now' : 'Logged out'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 transition-colors hidden sm:block">
            <Phone size={20} />
          </button>
          <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 transition-colors hidden sm:block">
            <Video size={20} />
          </button>
          <button className="p-2.5 hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-95">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          <div className="flex-1" />
          
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <MessageBubble 
                key={m.id || Math.random()} 
                message={m} 
                currentUserId={me?.id || ''} 
                onReact={onReact}
                onReply={setReplyTo}
              />
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 mb-4"
            >
              <Avatar name={activeUser.name} size="sm" />
              <div className="glass-light px-4 py-2.5 rounded-2xl rounded-bl-none flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} className="h-0" />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        <MessageInput 
          onSendMessage={onSendMessage} 
          onTyping={onTyping} 
          replyTo={replyTo} 
          setReplyTo={setReplyTo} 
        />
      </div>
    </div>
  );
}
