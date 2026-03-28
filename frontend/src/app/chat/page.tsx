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

    const socket = getSocket();
    socket.connect();

    // Listeners
    socket.on('receive_message', (message) => {
      if (activeUser?.id === message.senderId || activeUser?.id === message.receiverId) {
        addMessage(message);
        socket.emit('message_seen', { messageIds: [message.id], senderId: message.senderId });
      }
    });

    socket.on('receive_group_message', (message) => {
      if (activeUser?.id === message.groupId) {
        addMessage(message);
      }
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

    return () => {
      socket.off('receive_message');
      socket.off('receive_group_message');
      socket.off('message_status_update');
      socket.off('user_typing');
      socket.off('receive_reaction');
      disconnectSocket();
    };
  }, [activeUser]);

  useEffect(() => {
    const initData = async () => {
      try {
        const { data: convs } = await api.get('/messages/conversations');
        setUsers(convs);

        const { data: groups } = await api.get('/groups/my');
        const socket = getSocket();
        socket.emit('join_groups', groups.map((g: any) => g.id));
      } catch (err) {
        console.error(err);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!activeUser) return;
      try {
        const url = activeUser.role === 'GROUP' 
          ? `/groups/${activeUser.id}/messages` 
          : `/messages/history/${activeUser.id}`;
        const { data } = await api.get(url);
        setMessages(data);
        
        if (activeUser.role !== 'GROUP') {
           const unseenIds = data.filter((m: any) => m.senderId === activeUser.id && m.status !== 'SEEN').map((m: any) => m.id);
           if (unseenIds.length > 0) {
             getSocket().emit('message_seen', { messageIds: unseenIds, senderId: activeUser.id });
           }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [activeUser]);

  const handleSendMessage = (content: string) => {
    if (!activeUser) return;
    const socket = getSocket();
    const isGroup = activeUser.role === 'GROUP';
    socket.emit('send_message', {
      receiverId: isGroup ? null : activeUser.id,
      groupId: isGroup ? activeUser.id : null,
      content,
      replyToId: replyTo?.id
    });
  };

  const handleTyping = (typing: boolean) => {
    if (!activeUser || activeUser.role === 'GROUP') return;
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
