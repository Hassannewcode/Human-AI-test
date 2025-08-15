
export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  online: boolean;
};

export type MessageStatus = 'sent' | 'delivered' | 'read';

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: MessageStatus;
  imageUrl?: string;
  reactions?: { [senderId: string]: string };
  replyTo?: {
    messageId: string;
    text: string;
    senderName: string;
  };
};

export type Conversation = {
  id: string;
  participants: User[];
  messages: Message[];
  unreadCount?: number;
};
