import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ONLINE' | 'OFFLINE';
  lastSeen: string;
  _count?: { sentMessages: number };
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  status: 'SENT' | 'DELIVERED' | 'SEEN';
  createdAt: string;
  replyTo?: Message | null;
  reactions?: any[];
}

interface ChatState {
  users: User[];
  activeUser: User | null;
  messages: Message[];
  me: User | null;
  isTyping: boolean;
  setUsers: (users: User[]) => void;
  setActiveUser: (user: User | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  updateUserStatus: (userId: string, status: User['status']) => void;
  setMe: (me: User | null) => void;
  setIsTyping: (typing: boolean) => void;
  addReaction: (messageId: string, reaction: any) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  users: [],
  activeUser: null,
  messages: [],
  me: null,
  isTyping: false,
  setUsers: (users) => set({ users }),
  setActiveUser: (activeUser) => set({ activeUser }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  updateMessageStatus: (messageId, status) => set((state) => ({
    messages: state.messages.map(m => m.id === messageId ? { ...m, status } : m)
  })),
  updateUserStatus: (userId, status) => set((state) => ({
    users: state.users.map(u => u.id === userId ? { ...u, status } : u)
  })),
  setMe: (me) => set({ me }),
  setIsTyping: (isTyping) => set({ isTyping }),
  addReaction: (messageId, reaction) => set((state) => ({
    messages: state.messages.map(m => 
      m.id === messageId ? { ...m, reactions: [...(m.reactions || []), reaction] } : m
    )
  })),
}));
