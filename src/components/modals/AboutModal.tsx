import React from 'react';
import { Modal } from '../ui/Modal';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="درباره MD-AutoPersianWrite">
      <div className="space-y-4 text-sm text-text-main leading-relaxed">
        <p className="font-bold text-base text-primary">نسخه: V.2.0.0 (Final Specification)</p>
        <p>
          این اپلیکیشن یک ویرایشگر پیشرفته مارک‌داون (Markdown Editor) با پشتیبانی کامل از فرمول‌های
          ریاضی KaTeX، دایاگرام‌های Mermaid، سینتکس هایلایت کدهای برنامه‌نویسی و سیستم تم‌دهی پویا
          می‌باشد.
        </p>
        <p className="text-text-muted text-xs">
          طراحی‌شده به صورت کاملاً ماژولار و مبتنی بر معماری توسعه‌پذیر.
        </p>
        <div className="pt-2 border-t border-border flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 bg-primary text-white rounded text-xs">
            بستن
          </button>
        </div>
      </div>
    </Modal>
  );
};
