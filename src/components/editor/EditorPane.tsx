import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useThemeStore } from '../../store/useThemeStore';

interface EditorPaneProps {
  editorRef?: React.RefObject<HTMLTextAreaElement>;
}

export const EditorPane: React.FC<EditorPaneProps> = ({ editorRef }) => {
  const { markdown, setMarkdown } = useEditorStore();
  const { fontSize, fontFamily } = useThemeStore();

  return (
    <textarea
      ref={editorRef}
      value={markdown}
      onChange={(e) => setMarkdown(e.target.value)}
      dir="auto"
      placeholder="متن مارک‌داون خود را اینجا بنویسید (فارسی راست‌چین / English Left-to-Right)..."
      className="w-full h-full p-6 bg-transparent text-text-main resize-none outline-none leading-relaxed overflow-y-auto custom-scrollbar"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        unicodeBidi: 'plaintext', // تشخیص جهت متن خط به خط / پاراگراف به پاراگراف
        textAlign: 'initial',
      }}
    />
  );
};
