
import React, { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import Message from './Message';
import MessageInput from './MessageInput';
import type { Conversation, Message as MessageType } from '../types';
import { currentUser } from '../constants';

interface ChatWindowProps {
  conversation: Conversation;
  onSendMessage: (text: string, imageBase64: string | null) => void;
  onReact: (messageId: string, emoji: string) => void;
  isTyping: boolean;
  replyingTo: MessageType | null;
  onSetReplyTo: (message: MessageType | null) => void;
  onOpenSettings: () => void;
  onUserTyping: (isTyping: boolean) => void;
}

const TypingIndicator = () => (
    <div className={`flex flex-col max-w-xs md:max-w-md self-start items-start mt-1`}>
        <div className={`px-4 py-3 flex items-end gap-2 bg-gray-700 self-start text-gray-200 rounded-2xl`}>
            <div className="flex items-center justify-center space-x-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
            </div>
        </div>
    </div>
);


const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onSendMessage, onReact, isTyping, replyingTo, onSetReplyTo, onOpenSettings, onUserTyping }) => {
  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isTyping]);

  if (!otherParticipant) {
    return <div className="flex-1 bg-gray-900">Error: Chat participant not found.</div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      <ChatHeader user={otherParticipant} onEditPersona={onOpenSettings} />
      
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col space-y-1">
            {conversation.messages.map((msg, index) => {
               const prevMsg = index > 0 ? conversation.messages[index - 1] : null;
               const nextMsg = index < conversation.messages.length - 1 ? conversation.messages[index + 1] : null;
               const isGrouped = prevMsg ? prevMsg.senderId === msg.senderId : false;

               const getReactions = () => {
                   const allReactions = { ...(msg.reactions || {}) };
                   // This logic is for displaying reactions. Let's find reactions from BOTH users.
                   const aiParticipant = conversation.participants.find(p => p.id.startsWith('ai-'));
                   if (aiParticipant && msg.reactions?.[aiParticipant.id]) {
                       allReactions[aiParticipant.id] = msg.reactions[aiParticipant.id];
                   }
                   if (msg.reactions?.[currentUser.id]) {
                       allReactions[currentUser.id] = msg.reactions[currentUser.id];
                   }
                   return Object.entries(allReactions);
               }

               return (
                <Message key={msg.id} message={msg} isGrouped={isGrouped} onReact={onReact} onSetReplyTo={onSetReplyTo} reactions={getReactions()} />
               )
            })}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <MessageInput onSendMessage={onSendMessage} replyingTo={replyingTo} onCancelReply={() => onSetReplyTo(null)} onUserTyping={onUserTyping} />
      </div>
    </div>
  );
};

export default ChatWindow;
