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
    const totalLines = Math.max(line, 1);
    const ratio = Math.min((line - 1) / totalLines, 1);
    return getScrollTopForRatio(preview, ratio);
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

export function useScrollSync() {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    let source: 'editor' | 'preview' | null = null;
    let resetTimer: number | undefined;

    const releaseSource = () => {
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        source = null;
      }, 100);
    };

    const syncEditorToPreview = () => {
      if (source === 'preview') return;
      source = 'editor';
      const line = getEditorLine(editor);
      preview.scrollTop = getPreviewTopForLine(preview, line);
      releaseSource();
    };

    const syncPreviewToEditor = () => {
      if (source === 'editor') return;
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
        const ratio = getScrollRatio(preview);
        editor.scrollTop = getScrollTopForRatio(editor, ratio);
      }

      releaseSource();
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

    return () => {
      editor.removeEventListener('scroll', syncEditorToPreview);
      preview.removeEventListener('scroll', syncPreviewToEditor);
      editor.removeEventListener('click', syncCursorToPreview);
      editor.removeEventListener('keyup', syncCursorToPreview);
      editor.removeEventListener('select', syncCursorToPreview);
      window.clearTimeout(resetTimer);
    };
  }, []);

  return { editorRef, previewRef };
}
