import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';

interface HyperlinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const isAllowedUrl = (value: string): boolean => {
  const url = value.trim();
  if (!url) return false;
  if (url.startsWith('#') || url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) return true;
  try {
    const protocol = new URL(url).protocol;
    return protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:';
  } catch {
    return false;
  }
};

export const HyperlinkModal: React.FC<HyperlinkModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setUrl('');
    setError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInsert = () => {
    const normalizedUrl = url.trim();
    if (!isAllowedUrl(normalizedUrl)) {
      setError('نشانی واردشده معتبر نیست. از http://، https://، mailto: یا یک لینک داخلی استفاده کنید.');
      return;
    }

    useEditorStore.getState().insertTextAtCursor('[', `](${normalizedUrl})`, 'متن لینک');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="hyperlink-title">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-2xl" dir="rtl">
        <h2 id="hyperlink-title" className="text-lg font-bold text-text">درج Hyperlink</h2>
        <p className="mt-1 text-sm text-text-muted">متن انتخاب‌شده به لینک تبدیل می‌شود.</p>
        <label className="mt-4 block text-sm font-medium text-text">
          نشانی لینک
          <input
            autoFocus
            value={url}
            onChange={(event) => { setUrl(event.target.value); setError(''); }}
            onKeyDown={(event) => { if (event.key === 'Enter') handleInsert(); if (event.key === 'Escape') onClose(); }}
            placeholder="https://example.com"
            dir="ltr"
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-left outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex items-center justify-start gap-2">
          <button type="button" onClick={handleInsert} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">درج لینک</button>
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-bg">انصراف</button>
        </div>
      </div>
    </div>
  );
};
