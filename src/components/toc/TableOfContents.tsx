import React, { useMemo } from 'react';
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

  const lines = useMemo(() => markdown.split('\n'), [markdown]);

  const headings = useMemo<Heading[]>(() => {
    const result: Heading[] = [];

    lines.forEach((line, index) => {
      /**
       * تغییر: استخراج Headingها به صورت Memoized انجام می‌شود.
       *
       * دلیل:
       * Outline با هر Render غیرضروری دوباره کل سند را Parse نکند.
       */
      const match = line.match(/^(#{1,6})\s+(.+)$/);

      if (match) {
        result.push({
          level: match[1].length,
          text: match[2].trim(),
          lineIndex: index,
        });
      }
    });

    return result;
  }, [lines]);

  if (!isTocOpen) {
    return null;
  }

  const navigateToHeading = (heading: Heading) => {
    const textarea = useEditorStore.getState().textareaRef;

    if (!textarea) {
      return;
    }

    /**
     * تغییر: ناوبری Heading اکنون دقیقاً بر اساس شماره خط انجام می‌شود.
     */
    const targetPosition = lines.slice(0, heading.lineIndex).join('\n').length;

    const cursorPosition = heading.lineIndex > 0 ? targetPosition + 1 : targetPosition;

    textarea.focus();
    textarea.setSelectionRange(cursorPosition, cursorPosition);

    const lineRatio = lines.length > 1 ? heading.lineIndex / (lines.length - 1) : 0;

    const maxScroll = textarea.scrollHeight - textarea.clientHeight;

    textarea.scrollTop = lineRatio * maxScroll;

    /**
     * Preview با useScrollSync از تغییر Cursor متوجه Heading می‌شود
     * و به همان بخش منتقل خواهد شد.
     */
    requestAnimationFrame(() => {
      textarea.dispatchEvent(
        new KeyboardEvent('keyup', {
          bubbles: true,
          key: 'ArrowDown',
        }),
      );
    });
  };

  return (
    <aside className="w-64 h-full bg-surface border-l border-border flex flex-col p-4 shrink-0 overflow-y-auto custom-scrollbar select-none z-10">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-border">
        <h3 className="font-bold text-sm text-text-main">فهرست سربرگ‌ها</h3>

        <button
          onClick={toggleToc}
          className="text-text-muted hover:text-text-main text-xs px-1"
          aria-label="بستن فهرست سربرگ‌ها"
        >
          ✕
        </button>
      </div>

      {headings.length === 0 ? (
        <p className="text-xs text-text-muted">هیچ تیتری (#) در سند یافت نشد.</p>
      ) : (
        <nav className="space-y-1">
          {headings.map((heading) => (
            <button
              key={`${heading.lineIndex}-${heading.text}`}
              onClick={() => navigateToHeading(heading)}
              style={{
                paddingRight: `${(heading.level - 1) * 12}px`,
              }}
              className="w-full text-right text-xs py-1.5 px-2 rounded hover:bg-bg text-text-main truncate block transition-colors"
              title={heading.text}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      )}
    </aside>
  );
};
