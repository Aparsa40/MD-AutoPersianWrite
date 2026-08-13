import React, { useCallback, useLayoutEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useThemeStore } from '../../store/useThemeStore';
import { htmlToMarkdown } from '../../lib/markdown/htmlToMarkdown';

interface EditorPaneProps {
  editorRef?: React.RefObject<HTMLTextAreaElement>;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ editorRef }) => {
  const { markdown, setMarkdown, setTextareaRef } = useEditorStore();
  const { fontSize, fontFamily } = useThemeStore();

  /**
   * تغییر: callback مربوط به ref فقط DOM reference را مدیریت می‌کند.
   *
   * دلیل:
   * قبلاً setTextareaRef داخل callback ref اجرا می‌شد.
   * React هنگام commit می‌تواند callback ref را برای detach/attach
   * چندین بار اجرا کند و هر بار Zustand را update کند.
   *
   * این موضوع باعث Maximum update depth exceeded می‌شد.
   *
   * اکنون callback ref هیچ State Update انجام نمی‌دهد.
   */
  const handleEditorRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      if (editorRef) {
        (editorRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
    },
    [editorRef],
  );

  /**
   * تغییر: textarea بعد از تکمیل commit در Store ثبت می‌شود.
   *
   * دلیل:
   * useLayoutEffect بعد از اینکه React مقدار ref را روی DOM قرار داد
   * اجرا می‌شود؛ بنابراین می‌توان textarea واقعی را بدون ایجاد
   * update داخل callback ref در اختیار Toolbar و سایر ابزارها قرار داد.
   *
   * این روش چرخه:
   *
   * ref → setState → render → ref → setState
   *
   * را حذف می‌کند.
   */
  useLayoutEffect(() => {
    const textarea = editorRef?.current ?? null;

    setTextareaRef(textarea);

    return () => {
      /**
       * تغییر: هنگام unmount شدن Editor، reference موجود در Store
       * پاک می‌شود.
       *
       * دلیل:
       * جلوگیری از نگه داشتن reference به یک DOM element که دیگر
       * در صفحه وجود ندارد.
       */
      setTextareaRef(null);
    };
  }, [editorRef, setTextareaRef]);

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = event.clipboardData.getData('text/html');

    /**
     * تغییر: Paste کردن Rich Text/HTML به Markdown تبدیل می‌شود.
     *
     * دلیل:
     * وقتی کاربر از محیط‌هایی مثل Chat یا صفحات وب Paste می‌کند،
     * Clipboard ممکن است HTML تحویل دهد. تبدیل آن باعث می‌شود
     * Editor همچنان Markdown واقعی نگهداری کند.
     */
    if (html.trim()) {
      const convertedMarkdown = htmlToMarkdown(html);

      if (convertedMarkdown.trim()) {
        event.preventDefault();

        const textarea = event.currentTarget;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const nextMarkdown = markdown.slice(0, start) + convertedMarkdown + markdown.slice(end);

        setMarkdown(nextMarkdown);

        requestAnimationFrame(() => {
          textarea.focus();

          const cursorPosition = start + convertedMarkdown.length;

          textarea.setSelectionRange(cursorPosition, cursorPosition);
        });
      }
    }
  };

  return (
    <textarea
      /**
       * تغییر مهم:
       *
       * callback ref دیگر setTextareaRef را مستقیماً صدا نمی‌زند.
       *
       * دلیل:
       * انجام Zustand state update داخل callback ref باعث
       * Maximum update depth exceeded می‌شد.
       *
       * ثبت textarea در Store اکنون توسط useLayoutEffect انجام می‌شود.
       */
      ref={handleEditorRef}
      value={markdown}
      onChange={(event) => setMarkdown(event.target.value)}
      onPaste={handlePaste}
      dir="auto"
      placeholder="متن مارک‌داون خود را اینجا بنویسید (فارسی راست‌چین / English Left-to-Right)..."
      className="w-full h-full p-6 bg-transparent text-text-main resize-none outline-none leading-relaxed overflow-y-auto custom-scrollbar"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily,
        unicodeBidi: 'plaintext',
        textAlign: 'initial',
      }}
    />
  );
};
