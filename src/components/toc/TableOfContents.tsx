import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useLayoutStore } from '../../store/useLayoutStore';

interface Heading {
  level: number;
  text: string;
  lineIndex: number;
}

const getHeadingId = (text: string, index: number): string => {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `heading-${slug || 'section'}-${index}`;
};

export const TableOfContents: React.FC = () => {
  const markdown = useEditorStore((state) => state.markdown);
  const { isTocOpen, toggleToc } = useLayoutStore();

  if (!isTocOpen) return null;

  const lines = markdown.split('\n');
  const headings: Heading[] = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({ level: match[1].length, text: match[2].trim(), lineIndex: index });
    }
  });

  const jumpToHeading = (heading: Heading, index: number) => {
    const textarea = document.querySelector<HTMLTextAreaElement>(
      'textarea[data-editor="markdown"]',
    );
    if (!textarea) return;

    const targetPosition = lines.slice(0, heading.lineIndex).join('\n').length;
    const ratio = heading.lineIndex / Math.max(lines.length - 1, 1);
    textarea.focus();
    textarea.setSelectionRange(targetPosition, targetPosition);
    textarea.scrollTop = ratio * Math.max(textarea.scrollHeight - textarea.clientHeight, 0);

    const previewHeading = document.getElementById(getHeadingId(heading.text, index));
    previewHeading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <aside className="w-64 h-full shrink-0 overflow-y-auto border-l border-border bg-surface p-4 custom-scrollbar">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-sm font-bold text-text-main">فهرست مطالب</h3>
        <button
          type="button"
          onClick={toggleToc}
          className="rounded px-2 py-1 text-xs text-text-muted hover:bg-bg hover:text-text-main"
          aria-label="بستن فهرست مطالب"
        >
          ✕
        </button>
      </div>

      {headings.length === 0 ? (
        <p className="text-xs text-text-muted">هیچ سربرگی در سند یافت نشد.</p>
      ) : (
        <nav className="space-y-1" aria-label="فهرست مطالب">
          {headings.map((heading, index) => (
            <button
              type="button"
              key={`${heading.lineIndex}-${index}`}
              onClick={() => jumpToHeading(heading, index)}
              style={{ paddingRight: `${(heading.level - 1) * 12 + 8}px` }}
              className="block w-full truncate rounded px-2 py-1.5 text-right text-xs text-text-main transition-colors hover:bg-bg"
            >
              {heading.text}
            </button>
          ))}
        </nav>
      )}
    </aside>
  );
};
