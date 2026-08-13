import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEditorStore } from './useEditorStore';

describe('useEditorStore', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor();
    useEditorStore.getState().setTextareaRef(null);
  });

  it('updates markdown and marks the document dirty', () => {
    useEditorStore.getState().setMarkdown('# Test');
    expect(useEditorStore.getState().markdown).toBe('# Test');
    expect(useEditorStore.getState().isDirty).toBe(true);
  });

  it('resets the editor to an empty untitled document', () => {
    useEditorStore.getState().setMarkdown('content');
    useEditorStore.getState().setFileName('notes.md');
    useEditorStore.getState().resetEditor();
    expect(useEditorStore.getState().markdown).toBe('');
    expect(useEditorStore.getState().fileName).toBe('untitled.md');
    expect(useEditorStore.getState().isDirty).toBe(false);
  });

  it('inserts formatted text at the current cursor position', () => {
    vi.useFakeTimers();
    const textarea = {
      selectionStart: 6,
      selectionEnd: 11,
      focus: vi.fn(),
      setSelectionRange: vi.fn(),
    } as unknown as HTMLTextAreaElement;

    useEditorStore.getState().setMarkdown('Hello world');
    useEditorStore.getState().setTextareaRef(textarea);
    useEditorStore.getState().insertTextAtCursor('**', '**');

    expect(useEditorStore.getState().markdown).toBe('Hello **world**');
    vi.runAllTimers();
    expect(textarea.focus).toHaveBeenCalledOnce();
    expect(textarea.setSelectionRange).toHaveBeenCalledWith(8, 13);
    vi.useRealTimers();
  });
});
