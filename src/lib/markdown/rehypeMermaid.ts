type RehypeNode = {
  type?: string;
  tagName?: string;
  properties?: {
    className?: unknown;
  };
  children?: RehypeNode[];
};

/**
 * Protect Mermaid code blocks from rehype-prism-plus.
 * Prism transforms code text into React elements, which would make
 * MermaidBlock receive values such as "[object Object]" instead of source text.
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
        node.properties = {
          ...node.properties,
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
