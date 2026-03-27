'use client';

import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-4`}
    >
      {message.replyTo && (
        <div className={`text-xs text-indigo-300 mb-1 px-2 py-1 bg-white/5 rounded-t-lg border-l-2 border-indigo-500 overflow-hidden text-ellipsis max-w-[200px]`}>
          Replying to: <span className="italic">{message.replyTo.content}</span>
        </div>
      )}
      
      <div className="group relative flex items-center gap-2">
        {!isMine && (
          <button 
            onClick={() => onReply(message)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all text-indigo-300"
            title="Reply"
          >
            ↩
          </button>
        )}

        <div
          className={`px-4 py-2 rounded-2xl max-w-xs sm:max-w-md ${
            isMine 
              ? 'bg-indigo-600 text-white rounded-tr-none' 
              : 'bg-white/10 text-white border border-white/10 rounded-tl-none'
          } shadow-lg relative`}
        >
          <p className="text-sm sm:text-base whitespace-pre-wrap">{message.content}</p>
          
          <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMine ? 'text-indigo-200' : 'text-indigo-300'}`}>
            <span>{format(new Date(message.createdAt), 'HH:mm')}</span>
            {isMine && (
              <span>
                {message.status === 'SENT' && <Check className="w-3 h-3" />}
                {message.status === 'DELIVERED' && <CheckCheck className="w-3 h-3" />}
                {message.status === 'SEEN' && <CheckCheck className="w-3 h-3 text-cyan-400" />}
              </span>
            )}
          </div>

          {/* Reactions */}
          <div className="absolute -bottom-2 -right-2 flex gap-1">
            {message.reactions?.map((r: any) => (
              <span key={r.id} className="bg-slate-800 rounded-full px-1 text-xs border border-white/10 shadow-sm" title={r.user?.name}>
                {r.emoji}
              </span>
            ))}
          </div>
        </div>

        {isMine && (
          <button 
            onClick={() => onReply(message)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all text-indigo-300"
            title="Reply"
          >
            ↩
          </button>
        )}
      </div>
      
      <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {['❤️', '👍', '😂', '😮'].map(emoji => (
          <button 
            key={emoji} 
            onClick={() => onReact(message.id, emoji)}
            className="text-xs grayscale hover:grayscale-0 transition-all hover:scale-125"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
