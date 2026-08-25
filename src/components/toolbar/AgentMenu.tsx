import React, { useState } from 'react';

interface AgentMenuProps { onOpen?: () => void; }

export const AgentMenu: React.FC<AgentMenuProps> = ({ onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { onOpen?.(); setIsOpen((open) => !open); }}
        className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg"
        aria-expanded={isOpen}
      >
        Agent
      </button>
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-52 rounded border border-border bg-surface py-1 shadow-lg">
          <div className="px-4 py-2 text-right text-xs text-text-muted">
            قابلیت‌های Agent در نسخه‌های بعدی اضافه می‌شوند.
          </div>
        </div>
      )}
    </div>
  );
};
