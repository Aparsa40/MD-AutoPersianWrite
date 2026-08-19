import { useEffect, useRef } from 'react';

type ScrollElement = Pick<HTMLElement, 'scrollTop' | 'scrollHeight' | 'clientHeight'>;

export const getScrollRatio = (element: ScrollElement): number =>
  element.scrollTop / Math.max(element.scrollHeight - element.clientHeight, 1);

export const getScrollTopForRatio = (element: ScrollElement, ratio: number): number =>
  ratio * Math.max(element.scrollHeight - element.clientHeight, 0);

const getLineHeight = (editor: HTMLTextAreaElement): number => {
  const computed = window.getComputedStyle(editor);
  const lineHeight = Number.parseFloat(computed.lineHeight);
  if (Number.isFinite(lineHeight) && lineHeight > 0) return lineHeight;

  const fontSize = Number.parseFloat(computed.fontSize);
  return Number.isFinite(fontSize) && fontSize > 0 ? fontSize * 1.5 : 24;
};

const getEditorLine = (editor: HTMLTextAreaElement): number =>
  editor.value.slice(0, editor.selectionStart).split('\n').length;

const getPreviewLineElements = (preview: HTMLDivElement): Array<{ line: number; top: number }> => {
  const previewRect = preview.getBoundingClientRect();

  return Array.from(preview.querySelectorAll<HTMLElement>('[data-source-line]'))
    .map((element) => ({
      line: Number(element.dataset.sourceLine),
      top: element.getBoundingClientRect().top - previewRect.top + preview.scrollTop,
    }))
    .filter(({ line }) => Number.isFinite(line) && line > 0)
    .sort((a, b) => a.line - b.line);
};

const getPreviewTopForLine = (preview: HTMLDivElement, line: number): number => {
  const elements = getPreviewLineElements(preview);
  if (elements.length === 0) {
    return getScrollTopForRatio(preview, Math.min(Math.max((line - 1) / Math.max(line, 1), 0), 1));
  }

  let candidate = elements[0];
  for (const element of elements) {
    if (element.line > line) break;
    candidate = element;
  }

  return Math.max(candidate.top - preview.clientHeight * 0.18, 0);
};

const getEditorTopForLine = (editor: HTMLTextAreaElement, line: number): number => {
  const lineHeight = getLineHeight(editor);
  return Math.max((line - 1) * lineHeight - editor.clientHeight * 0.18, 0);
};

export function useScrollSync(activeSessionId: string | null) {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview || activeSessionId === null) return;

    let source: 'editor' | 'preview' | null = null;
    let resetTimer: number | undefined;
    let rafId: number | undefined;

    const releaseSource = () => {
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        source = null;
      }, 80);
    };

    const syncEditorToPreview = () => {
      if (source === 'preview') return;
      window.cancelAnimationFrame(rafId ?? 0);
      rafId = window.requestAnimationFrame(() => {
        source = 'editor';
        preview.scrollTop = getPreviewTopForLine(preview, getEditorLine(editor));
        releaseSource();
      });
    };

    const syncPreviewToEditor = () => {
      if (source === 'editor') return;
      window.cancelAnimationFrame(rafId ?? 0);
      rafId = window.requestAnimationFrame(() => {
        source = 'preview';
        const elements = getPreviewLineElements(preview);
        if (elements.length > 0) {
          const targetTop = preview.scrollTop + preview.clientHeight * 0.2;
          let candidate = elements[0];
          for (const element of elements) {
            if (element.top > targetTop) break;
            candidate = element;
          }
          editor.scrollTop = getEditorTopForLine(editor, candidate.line);
        } else {
          editor.scrollTop = getScrollTopForRatio(editor, getScrollRatio(preview));
        }
        releaseSource();
      });
    };

    const syncCursorToPreview = () => {
      if (source === 'preview') return;
      source = 'editor';
      preview.scrollTop = getPreviewTopForLine(preview, getEditorLine(editor));
      releaseSource();
    };

    editor.addEventListener('scroll', syncEditorToPreview, { passive: true });
    preview.addEventListener('scroll', syncPreviewToEditor, { passive: true });
    editor.addEventListener('click', syncCursorToPreview);
    editor.addEventListener('keyup', syncCursorToPreview);
    editor.addEventListener('select', syncCursorToPreview);
    editor.addEventListener('mouseup', syncCursorToPreview);

    const resizeObserver = new ResizeObserver(() => {
      if (source === null) syncCursorToPreview();
    });
    resizeObserver.observe(editor);
    resizeObserver.observe(preview);

    return () => {
      editor.removeEventListener('scroll', syncEditorToPreview);
      preview.removeEventListener('scroll', syncPreviewToEditor);
      editor.removeEventListener('click', syncCursorToPreview);
      editor.removeEventListener('keyup', syncCursorToPreview);
      editor.removeEventListener('select', syncCursorToPreview);
      editor.removeEventListener('mouseup', syncCursorToPreview);
      resizeObserver.disconnect();
      window.clearTimeout(resetTimer);
      window.cancelAnimationFrame(rafId ?? 0);
    };
  }, [activeSessionId]);

  return { editorRef, previewRef };
}
