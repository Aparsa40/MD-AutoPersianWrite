export interface MarkdownBlockMapping {
  sourceLine: number;
  element?: HTMLElement | null;
}

export function findPreviewBlockByLine(
  container: HTMLElement | null,
  line: number,
): HTMLElement | null {
  if (!container) return null;

  return container.querySelector(`[data-source-line="${line}"]`) as HTMLElement | null;
}

export function scrollPreviewToLine(container: HTMLElement | null, line: number): boolean {
  if (!container) {
    return false;
  }

  const target = findPreviewBlockByLine(container, line);

  if (!target) {
    return false;
  }

  const top = target.offsetTop - container.clientHeight * 0.18;

  container.scrollTop = Math.max(top, 0);

  return true;
}
