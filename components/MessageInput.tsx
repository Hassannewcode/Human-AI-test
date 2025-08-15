
import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { SmileIcon } from './icons/SmileIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { SendIcon } from './icons/SendIcon';
import { XIcon } from './icons/XIcon';
import { currentUser } from '../constants';
import { aiUser } from '../constants';


interface MessageInputProps {
  onSendMessage: (text: string, imageBase64: string | null) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
  onUserTyping: (isTyping: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, replyingTo, onCancelReply, onUserTyping }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ B64: string | null, file: File | null }>({ B64: null, file: null });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (replyingTo) {
      textInputRef.current?.focus();
    }
  }, [replyingTo]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    
    if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    } else {
        onUserTyping(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
        onUserTyping(false);
        typingTimeoutRef.current = null;
    }, 1500); // User is considered "stopped typing" after 1.5s of inactivity
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = (e.target?.result as string).split(',')[1];
        setImage({ B64: base64String, file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() || image.B64) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        onUserTyping(false);
      }
      onSendMessage(text.trim(), image.B64);
      setText('');
      setImage({ B64: null, file: null });
       if(fileInputRef.current) {
          fileInputRef.current.value = "";
       }
    }
  };

  return (
    <div className="p-3 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50">
       {replyingTo && (
        <div className="relative flex items-center justify-between p-2 bg-gray-700/50 rounded-lg mb-2 text-sm">
          <div className="border-l-2 border-blue-400 pl-3">
            <p className="font-bold text-blue-400 text-xs">Replying to {replyingTo.senderId === currentUser.id ? currentUser.name : aiUser.name}</p>
            <p className="text-gray-300 line-clamp-1">{replyingTo.text || 'Image'}</p>
          </div>
          <button onClick={onCancelReply} className="p-1 rounded-full hover:bg-gray-600">
            <XIcon />
          </button>
        </div>
      )}
       {image.file && (
        <div className="relative inline-block p-2 bg-gray-700/50 rounded-lg mb-2">
          <img src={URL.createObjectURL(image.file)} alt="Preview" className="h-20 w-auto rounded" />
          <button
            onClick={() => {
                setImage({ B64: null, file: null });
                if(fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="absolute -top-2 -right-2 bg-gray-600 rounded-full p-1 text-white hover:bg-gray-500"
          >
            <XIcon />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <button type="button" className="p-2 rounded-full hover:bg-gray-700 text-gray-400">
          <SmileIcon />
        </button>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
        />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-700 text-gray-400">
          <PaperclipIcon />
        </button>
        <input
          ref={textInputRef}
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type a message..."
          className="flex-1 bg-gray-700 rounded-full py-2 px-4 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors disabled:bg-gray-600"
          disabled={!text.trim() && !image.B64}
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
