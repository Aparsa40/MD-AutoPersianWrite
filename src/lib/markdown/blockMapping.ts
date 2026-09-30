export interface MarkdownBlockMapping {
  sourceLine: number;
  element?: HTMLElement | null;
}

export function findPreviewBlockByLine(
  container: HTMLElement | null,
  line: number
): HTMLElement | null {
  if (!container) return null;

  return container.querySelector(
    `[data-source-line="${line}"]`
  ) as HTMLElement | null;
}


export function scrollPreviewToLine(
  container: HTMLElement | null,
  line: number
): boolean {
  const target = findPreviewBlockByLine(container, line);

  if (!target) {
    return false;
  }

  target.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  return true;
}