import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../useEditorStore';

describe('useEditorStore Unit Tests', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor();
  });

  it('باید مقدار اولیه مارک‌داون را درست بازنشانی کند', () => {
    const { markdown } = useEditorStore.getState();
    expect(markdown).toBe('');
  });

  it('باید تغییر نام فایل را به درستی اعمال کند', () => {
    useEditorStore.getState().setFileName('test-doc.md');
    expect(useEditorStore.getState().fileName).toBe('test-doc.md');
  });
});
