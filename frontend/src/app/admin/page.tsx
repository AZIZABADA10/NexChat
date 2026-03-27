'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import { getSocket, disconnectSocket } from '@/lib/socket';
import api from '@/lib/api';
import ChatLayout from '@/components/layout/ChatLayout';
import Sidebar from '@/components/chat/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';

export default function AdminDashboard() {
  const { setMe, setUsers, activeUser, setActiveUser, setMessages, addMessage, updateMessageStatus, updateUserStatus, addReaction } = useChatStore();
  const [replyTo, setReplyTo] = useState<any>(null);
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
      }
    };

    fetchData();

    const socket = getSocket();
    socket.connect();

    socket.on('receive_message', (message) => {
      // Logic for adding message if active user matches, or updating unread count
      // This is a simplified version, ideally handle activeUser check here
      addMessage(message);
    });

    socket.on('user_presence', ({ userId, status }) => {
      updateUserStatus(userId, status);
    });

    socket.on('receive_reaction', ({ messageId, reaction }) => {
      addReaction(messageId, reaction);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_presence');
      socket.off('receive_reaction');
      disconnectSocket();
    };
  }, []);

  // Effect to fetch history when activeUser changes
  useEffect(() => {
    if (activeUser) {
      const fetchHistory = async () => {
        const { data } = await api.get(`/messages/history/${activeUser.id}`);
        setMessages(data);
        
        // Mark as seen
        const unseenIds = data.filter((m: any) => m.senderId === activeUser.id && m.status !== 'SEEN').map((m: any) => m.id);
        if (unseenIds.length > 0) {
          getSocket().emit('message_seen', { messageIds: unseenIds, senderId: activeUser.id });
        }
      };
      fetchHistory();
    }
  }, [activeUser]);

  const handleSendMessage = (content: string) => {
    if (!activeUser) return;
    getSocket().emit('send_message', {
      receiverId: activeUser.id,
      content,
      replyToId: replyTo?.id
    });
  };

  return (
    <ChatLayout sidebar={<Sidebar onLogout={() => { localStorage.clear(); router.push('/login'); }} />}>
      <ChatWindow 
        onSendMessage={handleSendMessage} 
        onTyping={(t) => getSocket().emit('typing', { receiverId: activeUser?.id, isTyping: t })}
        onReact={(id, emo) => getSocket().emit('send_reaction', { messageId: id, emoji: emo })}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
      />
    </ChatLayout>
  );
}
