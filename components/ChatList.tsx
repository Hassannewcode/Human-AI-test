
import React from 'react';
import ChatItem from './ChatItem';
import type { Conversation } from '../types';

interface ChatListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
}

const ChatList: React.FC<ChatListProps> = ({ conversations, selectedConversationId }) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map(convo => (
        <ChatItem
          key={convo.id}
          conversation={convo}
          isSelected={convo.id === selectedConversationId}
          onSelect={() => {}} // No-op as there's only one chat
        />
      ))}
    </div>
  );
};

export default ChatList;