import { useRef, useEffect } from 'react';

/**
 * هوک همگام‌سازی اسکرول بین پنل ویرایشگر و پیش‌نمایش زنده
 */
export function useScrollSync() {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editorEl = editorRef.current;
    const previewEl = previewRef.current;

    if (!editorEl || !previewEl) return;

    let isSyncingEditor = false;
    let isSyncingPreview = false;

    const handleEditorScroll = () => {
      if (isSyncingEditor) {
        isSyncingEditor = false;
        return;
      }
      isSyncingPreview = true;
      const percentage = editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight || 1);
      previewEl.scrollTop = percentage * (previewEl.scrollHeight - previewEl.clientHeight);
    };

    const handlePreviewScroll = () => {
      if (isSyncingPreview) {
        isSyncingPreview = false;
        return;
      }
      isSyncingEditor = true;
      const percentage =
        previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight || 1);
      editorEl.scrollTop = percentage * (editorEl.scrollHeight - editorEl.clientHeight);
    };

    editorEl.addEventListener('scroll', handleEditorScroll);
    previewEl.addEventListener('scroll', handlePreviewScroll);

    return () => {
      editorEl.removeEventListener('scroll', handleEditorScroll);
      previewEl.removeEventListener('scroll', handlePreviewScroll);
    };
  }, []);

  return { editorRef, previewRef };
}
