'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  replyTo: any;
  setReplyTo: (val: any) => void;
}

export default function ChatInput({ onSendMessage, onTyping, replyTo, setReplyTo }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    <div className="p-4 bg-white/5 border-t border-white/10">
      {replyTo && (
        <div className="flex items-center justify-between bg-indigo-500/20 p-2 rounded-lg mb-2 border-l-4 border-indigo-500">
          <div className="text-xs text-indigo-200">
            Replying to: <span className="font-semibold">{replyTo.content.substring(0, 30)}...</span>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-indigo-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
        <textarea
          rows={1}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-white/30 resize-none py-2 px-2 max-h-32"
          value={content}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 text-white rounded-xl transition-all shadow-lg"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
