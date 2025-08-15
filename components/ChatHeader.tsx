
import React from 'react';
import type { User } from '../types';
import { UserIcon } from './icons/UserIcon';
import { PencilIcon } from './icons/PencilIcon';

interface ChatHeaderProps {
  user: User;
  onEditPersona: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ user, onEditPersona }) => {
  return (
    <header className="flex items-center p-3 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 h-[60px] flex-shrink-0">
      <div className="flex items-center">
        {user.avatarUrl ? (
           <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
        ) : (
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                <UserIcon className="w-6 h-6 text-gray-300" />
            </div>
        )}
        <div>
          <h2 className="font-semibold">{user.name}</h2>
          <p className="text-xs text-gray-400">{user.online ? 'Online' : 'Offline'}</p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onEditPersona}
          className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors"
          aria-label="Edit AI persona"
        >
          <PencilIcon />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
