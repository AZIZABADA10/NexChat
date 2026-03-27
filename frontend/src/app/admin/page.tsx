'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket, disconnectSocket } from '@/lib/socket';
import api from '@/lib/api';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import { LogOut, Loader2, Circle, Users, MessageSquare, Search } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr || JSON.parse(userStr).role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    setMe(JSON.parse(userStr));

    const fetchData = async () => {
      try {
        const { data: convs } = await api.get('/messages/conversations');
        setUsers(convs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const socket = getSocket();
    socket.connect();

    socket.on('receive_message', (message) => {
      if (selectedUser?.id === message.senderId) {
        setMessages((prev) => [...prev, message]);
        socket.emit('message_seen', { messageIds: [message.id], senderId: message.senderId });
      } else {
        // Update user list unread count
        setUsers(prev => prev.map(u => u.id === message.senderId ? { ...u, _count: { sentMessages: u._count.sentMessages + 1 } } : u));
      }
    });

    socket.on('user_presence', ({ userId, status }) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_presence');
      disconnectSocket();
    };
  }, [selectedUser]);

  const fetchHistory = async (user: any) => {
    setSelectedUser(user);
    const { data } = await api.get(`/messages/history/${user.id}`);
    setMessages(data);
    
    // Mark all as seen
    const unseenIds = data.filter((m: any) => m.senderId === user.id && m.status !== 'SEEN').map((m: any) => m.id);
    if (unseenIds.length > 0) {
      getSocket().emit('message_seen', { messageIds: unseenIds, senderId: user.id });
    }
    
    // Reset unread count
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, _count: { sentMessages: 0 } } : u));
  };

  const sendMessage = (content: string) => {
    if (!selectedUser) return;
    getSocket().emit('send_message', {
      receiverId: selectedUser.id,
      content,
      replyToId: replyTo?.id
    });
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="h-screen flex bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/5 bg-slate-900/50 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">NexChat Admin</h1>
          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="p-2 hover:bg-white/5 rounded-full text-slate-400"><LogOut size={18} /></button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              onClick={() => fetchHistory(user)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedUser?.id === user.id ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'hover:bg-white/5'}`}
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md ${selectedUser?.id === user.id ? 'bg-white/20' : 'bg-indigo-500'}`}>
                  {user.name.charAt(0)}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${user.status === 'ONLINE' ? 'bg-green-500' : 'bg-slate-500'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className={`text-[10px] truncate ${selectedUser?.id === user.id ? 'text-indigo-100' : 'text-slate-400'}`}>{user.email}</p>
              </div>
              {user._count?.sentMessages > 0 && (
                <div className="bg-fuchsia-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {user._count.sentMessages}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-white/5 bg-slate-900/40 backdrop-blur-md flex items-center gap-4 z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-lg shadow-inner">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold text-white">{selectedUser.name}</h2>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${selectedUser.status === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-xs text-slate-400 font-medium">{selectedUser.status === 'ONLINE' ? 'Active now' : 'Logged out'}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="max-w-3xl mx-auto w-full">
                {messages.map((m) => (
                  <MessageBubble 
                    key={m.id} 
                    message={m} 
                    currentUserId={me?.id} 
                    onReact={(id, emoji) => getSocket().emit('send_reaction', { messageId: id, emoji })}
                    onReply={(msg) => setReplyTo(msg)}
                  />
                ))}
                <div ref={scrollRef} />
              </div>
            </div>

            <div className="max-w-3xl mx-auto w-full">
              <ChatInput 
                onSendMessage={sendMessage} 
                onTyping={(t) => getSocket().emit('typing', { receiverId: selectedUser.id, isTyping: t })} 
                replyTo={replyTo} 
                setReplyTo={setReplyTo} 
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 mb-6">
              <MessageSquare size={48} className="text-indigo-500/50" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Select a conversation</h2>
            <p className="max-w-xs text-center text-slate-400 italic font-light">Choose a user from the sidebar to start messaging and manage their experience.</p>
          </div>
        )}
      </div>
    </div>
  );
}
