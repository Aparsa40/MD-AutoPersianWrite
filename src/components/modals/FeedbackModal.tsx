import React, { useState } from 'react';
import { Modal } from '../ui/Modal';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    stepsToReproduce: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ارسال نظر / گزارش باگ">
      {submitted ? (
        <div className="text-center py-6 text-green-600 font-medium">
          ✅ با تشکر! بازخورد شما با موفقیت ثبت شد.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block text-text-muted mb-1">نام (اختیاری):</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-bg border border-border rounded p-2 text-text-main outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-text-muted mb-1">ایمیل (اختیاری):</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-bg border border-border rounded p-2 text-text-main outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-text-muted mb-1">توضیحات باگ/پیشنهاد:*</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-bg border border-border rounded p-2 text-text-main outline-none focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-text-muted mb-1">
              مراحل بازتولید (Steps to reproduce):
            </label>
            <textarea
              rows={2}
              value={formData.stepsToReproduce}
              onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
              className="w-full bg-bg border border-border rounded p-2 text-text-main outline-none focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-text-muted mb-1">پیوست فایل (اختیاری):</label>
            <input type="file" className="w-full text-xs text-text-muted" />
          </div>
          <div className="flex justify-end space-x-2 space-x-reverse pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded text-text-muted hover:bg-bg"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
            >
              ارسال
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
