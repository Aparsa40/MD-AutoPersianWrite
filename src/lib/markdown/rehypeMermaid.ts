type RehypeNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: {
    className?: unknown;
    [key: string]: unknown;
  };
  children?: RehypeNode[];
};

const getTextContent = (node: RehypeNode): string => {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(getTextContent).join('');
};

/**
 * Preserve Mermaid source before rehype-prism-plus can transform code children.
 * The original source is stored on the HAST node so the ReactMarkdown renderer
 * can use it even if a syntax-highlighting plugin changes the child structure.
 */
export const rehypeProtectMermaid = () => (tree: RehypeNode): void => {
  const visit = (node: RehypeNode): void => {
    if (node.type === 'element' && node.tagName === 'code') {
      const className = node.properties?.className;
      const classes = Array.isArray(className)
        ? className.map(String)
        : typeof className === 'string'
          ? className.split(/\s+/)
          : [];

      if (classes.some((className) => className.toLowerCase() === 'language-mermaid')) {
        const rawSource = getTextContent(node);
        node.properties = {
          ...node.properties,
          'data-mermaid-source': rawSource,
          className: classes.map((className) =>
            className.toLowerCase() === 'language-mermaid'
              ? 'language-mermaid-raw'
              : className
          ),
        };
      }
    }

    node.children?.forEach(visit);
  };

  visit(tree);
};
