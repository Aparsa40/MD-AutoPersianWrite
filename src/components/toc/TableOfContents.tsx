import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useLayoutStore } from '../../store/useLayoutStore';

interface Heading {
  level: number;
  text: string;
  lineIndex: number;
}

export const TableOfContents: React.FC = () => {
  const { markdown } = useEditorStore();
  const { isTocOpen, toggleToc } = useLayoutStore();

  if (!isTocOpen) return null;

  // استخراج تیترها از متن مارک‌داون
  const lines = markdown.split('\n');
  const headings: Heading[] = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        lineIndex: index,
      });
    }
  });

  return (
    <aside className="w-64 h-full bg-surface border-l border-border flex flex-col p-4 shrink-0 overflow-y-auto custom-scrollbar select-none z-10">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
        <h3 className="font-bold text-sm text-text-main">فهرست مطالب</h3>
        <button onClick={toggleToc} className="text-text-muted hover:text-text-main text-xs px-1">
          ✕
        </button>
      </div>

      {headings.length === 0 ? (
        <p className="text-xs text-text-muted">هیچ تیتری (#) در سند یافت نشد.</p>
      ) : (
        <nav className="space-y-1">
          {headings.map((h, i) => (
            <button
              key={i}
              onClick={() => {
                const textarea = document.querySelector('textarea');
                if (textarea) {
                  const targetLine = lines.slice(0, h.lineIndex).join('\n').length;
                  textarea.focus();
                  textarea.setSelectionRange(targetLine, targetLine);
                  const percentage = h.lineIndex / (lines.length || 1);
                  textarea.scrollTop = percentage * textarea.scrollHeight;
                }
              }}
              style={{ paddingRight: `${(h.level - 1) * 12}px` }}
              className="w-full text-right text-xs py-1.5 px-2 rounded hover:bg-bg text-text-main truncate block transition-colors"
            >
              {h.text}
            </button>
          ))}
        </nav>
      )}
    </aside>
  );
};
