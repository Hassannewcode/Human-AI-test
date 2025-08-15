import React from 'react';
import ChatList from './ChatList';
import type { Conversation } from '../types';
import { UserIcon } from './icons/UserIcon';

interface SidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ conversations, selectedConversationId }) => {
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 h-screen bg-gray-800 border-r border-gray-700/50 flex flex-col">
      <header className="p-3 bg-gray-800 flex justify-between items-center border-b border-gray-700/50 h-[60px] flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-gray-300" />
            </div>
            <h1 className="text-xl font-bold">Chats</h1>
        </div>
      </header>
      
      <ChatList
        conversations={conversations}
        selectedConversationId={selectedConversationId}
      />
    </div>
  );
};

export default Sidebar;