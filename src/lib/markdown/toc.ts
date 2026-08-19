export interface MarkdownHeading {
  level: number;
  text: string;
  slug: string;
}

export const stripMarkdownForSlug = (text: string): string =>
  text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\\([\\`*_{}\[\]()#+.!\-])/g, '$1')
    .trim();

export const slugifyHeading = (text: string): string =>
  stripMarkdownForSlug(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const extractMarkdownHeadings = (markdown: string): MarkdownHeading[] => {
  const headings: MarkdownHeading[] = [];
  const usedSlugs = new Map<string, number>();
  let inFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].trim();
    if (text === 'فهرست مطالب') continue;

    const baseSlug = slugifyHeading(text) || `section-${headings.length + 1}`;
    const count = usedSlugs.get(baseSlug) ?? 0;
    usedSlugs.set(baseSlug, count + 1);
    const slug = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
    headings.push({ level, text, slug });
  }

  return headings;
};

export const buildTableOfContents = (markdown: string): string => {
  const headings = extractMarkdownHeadings(markdown);
  if (!headings.length) return '';

  const minLevel = Math.min(...headings.map((heading) => heading.level));
  const items = headings.map((heading) => {
    const indent = '  '.repeat(Math.max(heading.level - minLevel, 0));
    return `${indent}- [${heading.text}](#${heading.slug})`;
  });

  return `## فهرست مطالب\n\n${items.join('\n')}\n\n`;
};
