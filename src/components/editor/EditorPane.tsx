import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useThemeStore } from '../../store/useThemeStore';
import { htmlToMarkdown } from '../../lib/markdown/htmlToMarkdown';

interface EditorPaneProps {
  editorRef?: React.RefObject<HTMLTextAreaElement>;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ editorRef }) => {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = editorRef ?? localRef;
  const { markdown, setMarkdown, setTextareaRef } = useEditorStore();
  const { fontSize, fontFamily } = useThemeStore();

  useEffect(() => {
    setTextareaRef(textareaRef.current);
    return () => setTextareaRef(null);
  }, [setTextareaRef, textareaRef]);

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = event.clipboardData.getData('text/html');
    if (!html?.trim()) return;

    const convertedMarkdown = htmlToMarkdown(html);
    if (!convertedMarkdown.trim()) return;

    event.preventDefault();
    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextMarkdown = `${markdown.slice(0, start)}${convertedMarkdown}${markdown.slice(end)}`;
    setMarkdown(nextMarkdown);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPosition = start + convertedMarkdown.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  return (
    <textarea
      ref={textareaRef}
      data-editor="markdown"
      value={markdown}
      onChange={(event) => setMarkdown(event.target.value)}
      onPaste={handlePaste}
      dir="auto"
      placeholder="متن مارک‌داون خود را اینجا بنویسید..."
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
