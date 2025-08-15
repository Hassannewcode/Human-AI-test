
import React, { useState } from 'react';
import type { Message as MessageType } from '../types';
import { currentUser } from '../constants';
import { CheckIcon } from './icons/CheckIcon';
import { SmileIcon } from './icons/SmileIcon';
import { ReplyIcon } from './icons/ReplyIcon';
import EmojiPicker from './EmojiPicker';

interface MessageProps {
  message: MessageType;
  isGrouped: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onSetReplyTo: (message: MessageType) => void;
  reactions: [string, string][];
}

const Message: React.FC<MessageProps> = ({ message, isGrouped, onReact, onSetReplyTo, reactions }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const isSentByCurrentUser = message.senderId === currentUser.id;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  
  const bubbleClasses = isSentByCurrentUser
    ? 'bg-gradient-to-r from-blue-500 to-purple-600 self-end text-white'
    : 'bg-gray-700 self-start text-gray-200';
    
  const groupedMargin = isGrouped ? 'mt-1' : 'mt-4';
  
  const bubbleBorderRadius = 'rounded-2xl';

  const hasContent = message.text || message.imageUrl;

  const handleEmojiSelect = (emoji: string) => {
    onReact(message.id, emoji);
    setShowPicker(false);
  };

  return (
    <div
      className={`relative flex items-end gap-2 max-w-xs md:max-w-md ${isSentByCurrentUser ? 'self-end flex-row-reverse' : 'self-start'} ${groupedMargin}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if(!showPicker) setShowPicker(false);
      }}
    >
        <div className="flex flex-col w-full">
            {hasContent && (
                <div className={`relative px-3 py-2 flex flex-col ${bubbleClasses} ${bubbleBorderRadius}`}>
                    {message.replyTo && (
                        <div className="bg-black/20 rounded-lg p-2 mb-2 text-sm backdrop-blur-sm border border-white/10 text-left">
                            <p className="font-bold text-xs text-blue-300">{message.replyTo.senderName}</p>
                            <p className="text-gray-300 line-clamp-2">{message.replyTo.text}</p>
                        </div>
                    )}
                    {message.imageUrl && (
                        <img 
                            src={message.imageUrl} 
                            alt="User upload" 
                            className={`rounded-lg max-w-full h-auto ${message.text ? 'mb-2' : ''}`} 
                            style={{maxHeight: '300px'}}
                        />
                    )}
                    {message.text && (
                        <div className={`flex items-end gap-2 ${isSentByCurrentUser ? 'self-end' : 'self-start'}`}>
                            <span style={{ wordBreak: 'break-word' }}>{message.text}</span>
                            <div className="flex-shrink-0 flex items-center self-end text-xs text-gray-300/80 -mb-1">
                                <span className="mr-1">{formatTimestamp(message.timestamp)}</span>
                                {isSentByCurrentUser && (
                                    <CheckIcon status={message.status} />
                                )}
                            </div>
                        </div>
                    )}

                    {reactions.length > 0 && (
                        <div className={`absolute -bottom-3 flex items-center gap-0.5 ${isSentByCurrentUser ? 'right-2' : 'left-2'}`}>
                            {reactions.map(([senderId, emoji]) => (
                                <div key={senderId} className="bg-gray-600 text-sm px-1.5 py-0.5 rounded-full border-2 border-gray-900 shadow-md">
                                    {emoji}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
        {(isHovered || showPicker) && hasContent && (
            <div className={`relative self-center flex-shrink-0 flex gap-1 ${isSentByCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                 <button
                    onClick={() => onSetReplyTo(message)}
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors"
                    aria-label="Reply to message"
                >
                    <ReplyIcon />
                </button>
                <div className="relative">
                    <button
                        onClick={() => setShowPicker(p => !p)}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors"
                        aria-label="React to message"
                    >
                        <SmileIcon />
                    </button>
                    {showPicker && <EmojiPicker onSelect={handleEmojiSelect} align={isSentByCurrentUser ? 'right' : 'left'} />}
                </div>
            </div>
        )}
    </div>
  );
};

export default Message;
