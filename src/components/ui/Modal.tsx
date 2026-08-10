import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
          <h3 className="text-lg font-bold text-text-main">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main text-xl font-bold p-1 rounded"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
