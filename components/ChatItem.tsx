import React from 'react';
import type { Conversation } from '../types';
import { currentUser } from '../constants';
import { UserIcon } from './icons/UserIcon';

interface ChatItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ conversation, isSelected, onSelect }) => {
  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!otherParticipant || !lastMessage) {
    return null;
  }

  return (
    <div
      onClick={onSelect}
      className={`flex items-center p-3 cursor-pointer transition-colors duration-200 ${
        isSelected ? 'bg-gray-700' : 'hover:bg-gray-700/50'
      }`}
    >
      <div className="relative">
        {otherParticipant.avatarUrl ? (
          <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-12 h-12 rounded-full mr-4" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center mr-4">
            <UserIcon className="w-6 h-6 text-gray-300" />
          </div>
        )}
        {otherParticipant.online && <span className="absolute bottom-0 right-4 block h-3 w-3 rounded-full bg-blue-500 border-2 border-gray-800"></span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <p className="font-semibold truncate text-gray-100">{otherParticipant.name}</p>
          <p className={`text-xs ${conversation.unreadCount ? 'text-blue-400' : 'text-gray-400'}`}>
            {formatTimestamp(lastMessage.timestamp)}
          </p>
        </div>
        <div className="flex justify-between items-start mt-1">
          <p className="text-sm text-gray-400 truncate pr-2">{lastMessage.text || 'Image'}</p>
          {conversation.unreadCount && conversation.unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;