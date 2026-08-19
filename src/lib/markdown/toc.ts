export interface MarkdownHeading {
  level: number;
  text: string;
  slug: string;
}

const removeMarkdownLinks = (text: string): string => {
  let result = text;
  let start = result.indexOf('[');

  while (start >= 0) {
    const endLabel = result.indexOf(']', start + 1);
    const openUrl = endLabel >= 0 ? result.indexOf('(', endLabel + 1) : -1;
    const endUrl = openUrl >= 0 ? result.indexOf(')', openUrl + 1) : -1;

    if (endLabel < 0 || openUrl !== endLabel + 1 || endUrl < 0) break;

    const label = result.slice(start + 1, endLabel);
    result = result.slice(0, start) + label + result.slice(endUrl + 1);
    start = result.indexOf('[', start + label.length);
  }

  return result;
};

const removeHtmlTags = (text: string): string => {
  let result = text;
  let start = result.indexOf('<');

  while (start >= 0) {
    const end = result.indexOf('>', start + 1);
    result = end >= 0 ? result.slice(0, start) + result.slice(end + 1) : result.slice(0, start);
    start = result.indexOf('<', start);
  }

  return result;
};

export const stripMarkdownForSlug = (text: string): string =>
  removeHtmlTags(removeMarkdownLinks(text))
    .replace(/[`*_~]/g, '')
    .replace(/\\(.)/g, '$1')
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
