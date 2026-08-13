import React, { useEffect, useRef } from 'react';
import { TopToolbar } from '../toolbar/TopToolbar';
import { EditorPane } from '../editor/EditorPane';
import { PreviewPane } from '../preview/PreviewPane';
import { TableOfContents } from '../toc/TableOfContents';
import { useScrollSync } from '../../hooks/useScrollSync';
import { useLayoutStore } from '../../store/useLayoutStore';

export const MainLayout: React.FC = () => {
  const { editorRef, previewRef } = useScrollSync();

  const { viewMode, orientation, splitRatio, isTocOpen, setSplitRatio } = useLayoutStore();

  const isDragging = useRef(false);

  /**
   * تغییر: امکان تغییر اندازه پنل‌ها با Drag کردن جداکننده.
   *
   * دلیل:
   * کاربر باید بتواند نسبت Editor و Preview را متناسب با نوع کار خود
   * تنظیم کند.
   */
  const handlePointerMove = (event: PointerEvent) => {
    if (!isDragging.current || viewMode !== 'split') {
      return;
    }

    const main = document.getElementById('editor-main-layout');

    if (!main) {
      return;
    }

    const rect = main.getBoundingClientRect();

    if (orientation === 'horizontal') {
      const ratio = ((event.clientX - rect.left) / rect.width) * 100;

      setSplitRatio(ratio);
    } else {
      const ratio = ((event.clientY - rect.top) / rect.height) * 100;

      setSplitRatio(ratio);
    }
  };

  const stopDragging = () => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopDragging);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopDragging);
    };
  });

  const startDragging = () => {
    /**
     * تغییر: هنگام Drag کردن Splitter انتخاب متن غیرفعال می‌شود
     * تا تجربه تغییر اندازه پنل‌ها روان باشد.
     */
    isDragging.current = true;
    document.body.style.cursor = orientation === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const editorStyle: React.CSSProperties =
    viewMode === 'split'
      ? orientation === 'horizontal'
        ? { width: `${splitRatio}%` }
        : { height: `${splitRatio}%` }
      : { flex: 1 };

  const previewStyle: React.CSSProperties =
    viewMode === 'split'
      ? orientation === 'horizontal'
        ? { width: `${100 - splitRatio}%` }
        : { height: `${100 - splitRatio}%` }
      : { flex: 1 };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg text-text-main">
      <TopToolbar />

      <main
        id="editor-main-layout"
        className={`flex flex-1 min-h-0 min-w-0 overflow-hidden ${
          orientation === 'horizontal' ? 'flex-row' : 'flex-col'
        }`}
      >
        {isTocOpen && <TableOfContents />}

        {viewMode !== 'preview-only' && (
          <section style={editorStyle} className="min-w-0 min-h-0 overflow-hidden bg-bg">
            <EditorPane editorRef={editorRef} />
          </section>
        )}

        {viewMode === 'split' && (
          <div
            role="separator"
            aria-label="تغییر اندازه پنل‌های ویرایشگر و پیش‌نمایش"
            aria-orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
            onPointerDown={startDragging}
            className={`shrink-0 bg-border hover:bg-primary transition-colors ${
              orientation === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
            }`}
          />
        )}

        {viewMode !== 'editor-only' && (
          <section style={previewStyle} className="min-w-0 min-h-0 overflow-hidden">
            <PreviewPane previewRef={previewRef} />
          </section>
        )}
      </main>
    </div>
  );
};
