import React from 'react';
import type { MessageStatus } from '../../types';

interface CheckIconProps {
  status: MessageStatus;
}

export const CheckIcon: React.FC<CheckIconProps> = ({ status }) => {
  const color = status === 'read' ? '#60a5fa' : 'currentColor'; // blue-400 for read
  const showSecondCheck = status === 'delivered' || status === 'read';

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
      {showSecondCheck && <path d="M15 6l-5.5 5.5" />}
    </svg>
  );
};