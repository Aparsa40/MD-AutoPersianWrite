import { beforeEach, describe, expect, it } from 'vitest';
import { useLayoutStore } from './useLayoutStore';

describe('useLayoutStore', () => {
  beforeEach(() => {
    useLayoutStore.setState({
      viewMode: 'split',
      orientation: 'horizontal',
      splitRatio: 50,
      isTocOpen: false,
    });
  });

  it('clamps split ratio to safe bounds', () => {
    useLayoutStore.getState().setSplitRatio(2);
    expect(useLayoutStore.getState().splitRatio).toBe(15);

    useLayoutStore.getState().setSplitRatio(98);
    expect(useLayoutStore.getState().splitRatio).toBe(85);
  });

  it('toggles the table of contents', () => {
    useLayoutStore.getState().toggleToc();
    expect(useLayoutStore.getState().isTocOpen).toBe(true);
    useLayoutStore.getState().toggleToc();
    expect(useLayoutStore.getState().isTocOpen).toBe(false);
  });

  it('switches view mode and orientation', () => {
    useLayoutStore.getState().setViewMode('preview-only');
    useLayoutStore.getState().setOrientation('vertical');
    expect(useLayoutStore.getState().viewMode).toBe('preview-only');
    expect(useLayoutStore.getState().orientation).toBe('vertical');
  });
});
