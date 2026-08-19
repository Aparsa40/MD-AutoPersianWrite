type RawNode = {
  type?: string;
  value?: string;
  children?: RawNode[];
};

type HastNode = RawNode & {
  type: 'root' | 'text' | 'comment' | 'raw' | 'element';
  tagName?: string;
  properties?: Record<string, unknown>;
};

const SAFE_TAGS = new Set([
  'a', 'abbr', 'article', 'aside', 'b', 'bdi', 'bdo', 'blockquote', 'br', 'caption', 'cite', 'code',
  'col', 'colgroup', 'data', 'del', 'details', 'div', 'em', 'figcaption', 'figure', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'mark', 'ol', 'p', 'pre', 'q', 's', 'samp',
  'section', 'small', 'span', 'strong', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th',
  'thead', 'time', 'tr', 'u', 'ul', 'var', 'video', 'audio', 'source',
]);

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

const isSafeUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) return true;
  try {
    return SAFE_URL_PROTOCOLS.has(new URL(trimmed, window.location.href).protocol);
  } catch {
    return false;
  }
};

const toPropertyName = (name: string): string => {
  if (name === 'class') return 'className';
  if (name === 'for') return 'htmlFor';
  return name.replace(/[-:]([a-z])/g, (_, letter: string) => letter.toUpperCase());
};

const convertDomNode = (domNode: Node): HastNode | null => {
  if (domNode.nodeType === Node.TEXT_NODE) return { type: 'text', value: domNode.textContent ?? '' };
  if (domNode.nodeType === Node.COMMENT_NODE) return null;
  if (domNode.nodeType !== Node.ELEMENT_NODE) return null;

  const element = domNode as HTMLElement;
  const tagName = element.tagName.toLowerCase();
  if (!SAFE_TAGS.has(tagName)) return null;

  const properties: Record<string, unknown> = {};
  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;
    if (name.startsWith('on') || name === 'style') continue;
    if ((name === 'href' || name === 'src' || name === 'poster') && !isSafeUrl(value)) continue;
    properties[toPropertyName(name)] = value;
  }

  return {
    type: 'element',
    tagName,
    properties,
    children: Array.from(element.childNodes).map(convertDomNode).filter((node): node is HastNode => node !== null),
  };
};

export const rehypeHtml = () => (tree: HastNode) => {
  if (typeof DOMParser === 'undefined') return;

  const walk = (parent: HastNode) => {
    if (!parent.children) return;
    const nextChildren: HastNode[] = [];

    for (const child of parent.children as HastNode[]) {
      if (child.type === 'raw') {
        const template = document.createElement('template');
        template.innerHTML = child.value ?? '';
        nextChildren.push(...Array.from(template.content.childNodes).map(convertDomNode).filter((node): node is HastNode => node !== null));
      } else {
        walk(child);
        nextChildren.push(child);
      }
    }

    parent.children = nextChildren;
  };

  walk(tree);
};
