'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  replyTo: any;
  setReplyTo: (val: any) => void;
}

export default function MessageInput({ onSendMessage, onTyping, replyTo, setReplyTo }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
    }
  }, [content]);

  const handleSend = () => {
    if (!content.trim()) return;
    onSendMessage(content);
    setContent('');
    setReplyTo(null);
    handleTyping(false);
  };

  const handleTyping = (typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      onTyping(typing);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    handleTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-linear-to-t from-[#020617] via-[#020617]/90 to-transparent">
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-between glass h-14 px-4 rounded-t-2xl mb-[-1px] border-b-0"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-1 h-8 bg-indigo-500 rounded-full shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Replying to</p>
                <p className="text-xs text-slate-300 truncate">{replyTo.content}</p>
              </div>
            </div>
            <button 
              onClick={() => setReplyTo(null)} 
              className="p-1.5 hover:bg-white/5 rounded-full text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`p-2 glass ${replyTo ? 'rounded-b-2xl' : 'rounded-2xl'} flex items-end gap-2 group focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all shadow-2xl`}>
        <button className="p-2.5 text-slate-500 hover:text-indigo-400 transition-colors">
          <Plus size={20} />
        </button>
        
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type your message..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-600 resize-none py-2.5 px-2 text-sm sm:text-base custom-scrollbar outline-hidden"
          value={content}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
        />

        <div className="flex items-center gap-1">
          <button className="hidden sm:block p-2.5 text-slate-500 hover:text-indigo-400 transition-colors">
            <Smile size={20} />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!content.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
