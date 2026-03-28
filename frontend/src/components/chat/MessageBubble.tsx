'use client';

import { format } from 'date-fns';
import { Check, CheckCheck, Reply, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '@/components/ui/Avatar';

interface MessageProps {
  message: any;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: any) => void;
}

export default function MessageBubble({ message, currentUserId, onReact, onReply }: MessageProps) {
  const isMine = message.senderId === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`group flex items-end gap-2 mb-4 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isMine && <Avatar name={message.sender?.name || 'User'} size="sm" />}
      
      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {/* Reply Preview */}
        {message.replyTo && (
          <div className={`text-[10px] sm:text-xs mb-[-12px] pb-4 px-3 py-1.5 rounded-t-xl glass-light border-b-0 opacity-80 ${isMine ? 'mr-2 text-indigo-200' : 'ml-2 text-slate-400'}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <Reply size={10} />
              <span className="font-bold">Replying to msg</span>
            </div>
            <p className="truncate italic">"{message.replyTo.content}"</p>
          </div>
        )}

        {/* Message Content */}
        <div className="relative group/content">
          <div className={`px-4 py-2.5 rounded-2xl shadow-xl transition-all ${
            isMine 
              ? 'bg-linear-to-br from-indigo-600 to-purple-600 text-white rounded-br-none' 
              : 'glass text-slate-100 border border-white/5 rounded-bl-none'
          }`}>
            <p className="text-sm sm:text-base leading-relaxed break-words">{message.content}</p>
            
            <div className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${isMine ? 'text-indigo-200' : 'text-slate-500'}`}>
              <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
              {isMine && (
                <span className="flex">
                  {message.status === 'SENT' && <Check className="w-3.5 h-3.5" />}
                  {message.status === 'DELIVERED' && <CheckCheck className="w-3.5 h-3.5 opacity-60" />}
                  {message.status === 'SEEN' && <CheckCheck className="w-3.5 h-3.5 text-cyan-400 drop-shadow-[0_0_2px_rgba(34,211,238,0.5)]" />}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions (Hover) */}
          <div className={`absolute top-0 ${isMine ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-all flex flex-col gap-1 z-20`}>
            {['👍', '❤️', '😂', '😮'].map(emo => (
              <button 
                key={emo} 
                onClick={() => onReact(message.id, emo)}
                className="w-7 h-7 rounded-full glass-light hover:bg-white/20 flex items-center justify-center text-[10px] shadow-sm"
              >
                {emo}
              </button>
            ))}
            <button 
              onClick={() => onReply(message)}
              className="w-7 h-7 rounded-full glass-light text-slate-400 hover:text-white flex items-center justify-center shadow-sm"
            >
              <Reply size={12} />
            </button>
          </div>

          {/* Reactions Display */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(
                message.reactions.reduce((acc: any, r: any) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {})
              ).map(([emoji, count]: any) => (
                <motion.div
                  key={emoji}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-2 py-0.5 rounded-full glass border border-white/10 text-[10px] flex items-center gap-1.5 shadow-sm"
                >
                  <span className="leading-none">{emoji}</span>
                  <span className="font-bold text-slate-400">{count}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
