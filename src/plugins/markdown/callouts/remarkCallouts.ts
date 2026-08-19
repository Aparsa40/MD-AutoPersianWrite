import type { Pluggable } from 'unified';

type MdastNode = {
  type?: string;
  children?: MdastNode[];
  value?: string;
  data?: { hProperties?: Record<string, unknown> };
};

const CALLOUT_TYPES = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'] as const;
type CalloutType = (typeof CALLOUT_TYPES)[number];

const getText = (node: MdastNode): string => {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(getText).join('');
};

export const remarkCallouts = (): Pluggable => {
  return (tree: MdastNode) => {
    const walk = (node: MdastNode) => {
      if (node.type === 'blockquote' && node.children?.length) {
        const first = node.children[0];
        const firstText = getText(first).trim();
        const match = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i.exec(firstText);

        if (match) {
          const type = match[1].toUpperCase() as CalloutType;
          const marker = match[0];
          const firstParagraph = first;
          if (firstParagraph.type === 'paragraph' && firstParagraph.children) {
            const markerNode = firstParagraph.children.find(
              (child) => child.type === 'text' && (child.value ?? '').includes(marker),
            );
            if (markerNode?.value) markerNode.value = markerNode.value.replace(marker, '').trimStart();
            if (!getText(firstParagraph).trim()) node.children = node.children.slice(1);
          }

          node.data ??= {};
          node.data.hProperties ??= {};
          node.data.hProperties.className = ['markdown-callout', `markdown-callout-${type.toLowerCase()}`];
          node.data.hProperties['data-callout-type'] = type.toLowerCase();
        }
      }

      node.children?.forEach(walk);
    };

    walk(tree);
  };
};
