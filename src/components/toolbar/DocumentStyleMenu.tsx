import React, { useState } from 'react';

export const DocumentStyleMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg"
      >
        سبک سند
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded border border-border bg-surface py-1 shadow-lg">
          <div className="px-4 py-2 text-right text-xs text-text-muted">
            سبک‌های Rendering سند در نسخه‌های بعدی اضافه می‌شوند.
          </div>
        </div>
      )}
    </div>
  );
};
