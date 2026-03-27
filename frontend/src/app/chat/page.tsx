'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/useChatStore';
import { getSocket, disconnectSocket } from '@/lib/socket';
import api from '@/lib/api';
import ChatLayout from '@/components/layout/ChatLayout';
import Sidebar from '@/components/chat/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';

export default function UserChatPage() {
  const { setMe, setUsers, setActiveUser, setMessages, addMessage, updateMessageStatus, setIsTyping, addReaction, activeUser } = useChatStore();
  const [replyTo, setReplyTo] = useState<any>(null);
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
        setUsers([adminUser]);
        setActiveUser(adminUser);

        const { data: history } = await api.get(`/messages/history/${adminUser.id}`);
        setMessages(history);

        const socket = getSocket();
        socket.connect();

        // Mark all as seen
        const unseenIds = history.filter((m: any) => m.senderId === adminUser.id && m.status !== 'SEEN').map((m: any) => m.id);
        if (unseenIds.length > 0) {
          socket.emit('message_seen', { messageIds: unseenIds, senderId: adminUser.id });
        }
      } catch (err) {
        console.error("Failed to load admin or history", err);
      }
    };

    initChat();

    const socket = getSocket();
    
    socket.on('receive_message', (message) => {
      addMessage(message);
      socket.emit('message_seen', { messageIds: [message.id], senderId: message.senderId });
    });

    socket.on('message_status_update', ({ messageId, status }) => {
      updateMessageStatus(messageId, status);
    });

    socket.on('user_typing', ({ isTyping: typing }) => {
      setIsTyping(typing);
    });

    socket.on('receive_reaction', ({ messageId, reaction }) => {
      addReaction(messageId, reaction);
    });

    socket.on('user_presence', ({ userId, status }) => {
      // update user status logic
    });

    return () => {
      socket.off('receive_message');
      socket.off('message_status_update');
      socket.off('user_typing');
      socket.off('receive_reaction');
      socket.off('user_presence');
      disconnectSocket();
    };
  }, []);

  const handleSendMessage = (content: string) => {
    if (!activeUser) return;
    const socket = getSocket();
    socket.emit('send_message', {
      receiverId: activeUser.id,
      content,
      replyToId: replyTo?.id
    });
  };

  const handleTyping = (typing: boolean) => {
    if (!activeUser) return;
    const socket = getSocket();
    socket.emit('typing', { receiverId: activeUser.id, isTyping: typing });
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <ChatLayout sidebar={<Sidebar onLogout={handleLogout} />}>
      <ChatWindow 
        onSendMessage={handleSendMessage} 
        onTyping={handleTyping}
        onReact={(id, emo) => getSocket().emit('send_reaction', { messageId: id, emoji: emo })}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
      />
    </ChatLayout>
  );
}
