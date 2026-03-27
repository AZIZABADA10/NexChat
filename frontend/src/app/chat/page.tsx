'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket, disconnectSocket } from '@/lib/socket';
import api from '@/lib/api';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import { User, LogOut, Loader2, Circle } from 'lucide-react';

export default function UserChatPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [admin, setAdmin] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const loggedInUser = JSON.parse(userStr);
    setMe(loggedInUser);

    const initChat = async () => {
      try {
        const { data: adminUser } = await api.get('/messages/admin');
        setAdmin(adminUser);

        const { data: history } = await api.get(`/messages/history/${adminUser.id}`);
        setMessages(history);
        
        // Mark all as seen
        const unseenIds = history.filter((m: any) => m.senderId === adminUser.id && m.status !== 'SEEN').map((m: any) => m.id);
        if (unseenIds.length > 0) {
          getSocket().emit('message_seen', { messageIds: unseenIds, senderId: adminUser.id });
        }
      } catch (err) {
        console.error("Failed to load admin or history", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    const socket = getSocket();
    socket.connect();

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
      // Mark as seen if we are looking at it
      socket.emit('message_seen', { messageIds: [message.id], senderId: message.senderId });
    });

    socket.on('message_status_update', ({ messageId, status }) => {
      setMessages((prev) => prev.map(m => m.id === messageId ? { ...m, status } : m));
    });

    socket.on('user_typing', ({ isTyping: typing }) => {
      setIsTyping(typing);
    });

    socket.on('receive_reaction', ({ messageId, reaction }) => {
      setMessages((prev) => prev.map(m => 
        m.id === messageId ? { ...m, reactions: [...(m.reactions || []), reaction] } : m
      ));
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_status_update');
      socket.off('user_typing');
      socket.off('receive_reaction');
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (content: string) => {
    if (!admin) return;
    const socket = getSocket();
    socket.emit('send_message', {
      receiverId: admin.id,
      content,
      replyToId: replyTo?.id
    });
  };

  const handleTyping = (typing: boolean) => {
    if (!admin) return;
    const socket = getSocket();
    socket.emit('typing', { receiverId: admin.id, isTyping: typing });
  };

  const logout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-white/10 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">A</div>
          <div>
            <h2 className="font-semibold">Aziz (Admin)</h2>
            <p className="text-xs text-indigo-400 flex items-center gap-1">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" /> Online
            </p>
          </div>
        </div>
        <button onClick={logout} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {messages.map((m) => (
            <MessageBubble 
              key={m.id} 
              message={m} 
              currentUserId={me?.id} 
              onReact={(id, emoji) => getSocket().emit('send_reaction', { messageId: id, emoji })}
              onReply={(msg) => setReplyTo(msg)}
            />
          ))}
          {isTyping && (
            <div className="text-xs text-indigo-400 animate-pulse mb-4">Aziz is typing...</div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input */}
      <div className="max-w-4xl mx-auto w-full">
        <ChatInput 
          onSendMessage={sendMessage} 
          onTyping={handleTyping} 
          replyTo={replyTo} 
          setReplyTo={setReplyTo} 
        />
      </div>
    </div>
  );
}
