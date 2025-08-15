
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons/XIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newInstruction: string) => void;
  currentInstruction: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentInstruction }) => {
  const [instruction, setInstruction] = useState(currentInstruction);

  useEffect(() => {
    setInstruction(currentInstruction);
  }, [currentInstruction, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(instruction);
    onClose();
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">Edit AI Persona</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 text-gray-400">
            <XIcon />
          </button>
        </header>
        <main className="p-6 flex-1">
          <label htmlFor="persona-textarea" className="block text-sm font-medium text-gray-300 mb-2">
            System Instruction
          </label>
          <p className="text-xs text-gray-400 mb-3">
            This instruction guides the AI's personality and behavior. Be descriptive!
          </p>
          <textarea
            id="persona-textarea"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="w-full h-64 bg-gray-900 border border-gray-600 rounded-md p-3 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
            placeholder="e.g., You are a helpful assistant that speaks like a pirate."
          />
        </main>
        <footer className="flex justify-end gap-3 p-4 bg-gray-800 border-t border-gray-700">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;
