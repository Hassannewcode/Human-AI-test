import React from 'react';

const EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  align: 'left' | 'right';
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, align }) => {
  const alignmentClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div 
        className={`absolute bottom-full mb-2 flex items-center gap-1 bg-gray-800/90 backdrop-blur-sm p-1.5 rounded-full shadow-lg border border-gray-700/50 z-10 ${alignmentClass}`}
    >
      {EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="text-2xl p-1 rounded-full hover:bg-gray-700 transition-transform transform hover:scale-110"
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
