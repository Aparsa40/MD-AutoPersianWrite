import React, { useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { ComponentPropsWithoutRef } from 'react';
import type { PluggableList } from 'unified';
import rehypePrism from 'rehype-prism-plus';
import { useEditorStore } from '../../store/useEditorStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useDebounce } from '../../hooks/useDebounce';
import { slugifyHeading } from '../../lib/markdown/toc';
import { MermaidBlock } from '../../lib/mermaid/MermaidBlock';
import { isMermaidDiagram } from '../../lib/mermaid/mermaid';
import { rehypeProtectMermaid } from '../../lib/markdown/rehypeMermaid';
import { PluginManager } from '../../plugins/PluginManager';
import { remarkCallouts } from '../../plugins/markdown/callouts/remarkCallouts';
import { rehypeHtml } from '../../plugins/markdown/html/rehypeHtml';
import { DocumentCloseButton } from '../document/DocumentCloseButton';

import 'katex/dist/katex.min.css';

interface PreviewPaneProps { previewRef?: React.RefObject<HTMLDivElement>; }

type MarkdownNode = { position?: { start?: { line?: number } }; properties?: Record<string, unknown> };
type TextColorSpanProps = ComponentPropsWithoutRef<'span'> & { 'data-text-color'?: string };

const getSourceLine = (node?: MarkdownNode): number | undefined => {
  const line = node?.position?.start?.line;
  return typeof line === 'number' && line > 0 ? line : undefined;
};

const isSafeTextColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);

export const PreviewPane: React.FC<PreviewPaneProps> = ({ previewRef }) => {
  const markdown = useEditorStore((state) => state.markdown);
  const debouncedMarkdown = useDebounce(markdown, 150);
  const { fontSize, fontFamily } = useThemeStore();
  const headingSlugCounts = useRef(new Map<string, number>());
  const customRemarkPlugins = PluginManager.getRemarkPlugins();
  const customRehypePlugins = PluginManager.getRehypePlugins();
  const remarkPlugins = useMemo(() => [remarkGfm, remarkMath, remarkCallouts, ...customRemarkPlugins], [customRemarkPlugins]);
  const rehypePlugins = useMemo(() => [rehypeHtml, rehypeKatex, rehypeProtectMermaid, [rehypePrism, { ignoreMissing: true }], ...customRehypePlugins], [customRehypePlugins]);

  headingSlugCounts.current.clear();
  const getHeadingId = (text: string): string => {
    const baseSlug = slugifyHeading(text) || `section-${headingSlugCounts.current.size + 1}`;
    const count = headingSlugCounts.current.get(baseSlug) ?? 0;
    headingSlugCounts.current.set(baseSlug, count + 1);
    return count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <DocumentCloseButton />
      <div ref={previewRef} className="h-full w-full overflow-y-auto bg-bg p-6 custom-scrollbar prose dark:prose-invert max-w-none preview-markdown" style={{ fontSize: `${fontSize}px`, fontFamily }}>
        <ReactMarkdown remarkPlugins={remarkPlugins as PluggableList} rehypePlugins={rehypePlugins as PluggableList} components={{
          a({ children, href, ...props }) { const external = Boolean(href && /^(?:https?:)?\/\//i.test(href)); return <a href={href} {...props} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="text-primary underline underline-offset-2 hover:opacity-80">{children}</a>; },
          span({ children, node, ...props }: TextColorSpanProps & { node?: MarkdownNode }) {
            const color = props['data-text-color'];
            if (isSafeTextColor(color)) {
              return <span {...props} data-text-color={color} style={{ color }} data-source-line={getSourceLine(node)}>{children}</span>;
            }
            return <span {...props}>{children}</span>;
          },
          p({ children, node }) { return <p dir="auto" data-source-line={getSourceLine(node as MarkdownNode)} className="my-2 leading-relaxed" style={{ unicodeBidi: 'plaintext' }}>{children}</p>; },
          h1({ children, node }) { const text = React.Children.toArray(children).join(''); return <h1 id={getHeadingId(text)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-5 text-3xl font-extrabold tracking-tight">{children}</h1>; },
          h2({ children, node }) { const text = React.Children.toArray(children).join(''); return <h2 id={getHeadingId(text)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-4 text-2xl font-bold tracking-tight">{children}</h2>; },
          h3({ children, node }) { const text = React.Children.toArray(children).join(''); return <h3 id={getHeadingId(text)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-3 text-xl font-bold">{children}</h3>; },
          h4({ children, node }) { const text = React.Children.toArray(children).join(''); return <h4 id={getHeadingId(text)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-3 text-lg font-semibold">{children}</h4>; },
          h5({ children, node }) { const text = React.Children.toArray(children).join(''); return <h5 id={getHeadingId(text)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-2 text-base font-semibold">{children}</h5>; },
          h6({ children, node }) { const text = React.Children.toArray(children).join(''); return <h6 id={getHeadingId(text)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-2 text-sm font-semibold uppercase tracking-wide">{children}</h6>; },
          hr({ node }) { return <hr data-source-line={getSourceLine(node as MarkdownNode)} className="my-6 border-0 border-t-2 border-border opacity-90" />; },
          ul({ children, className, node, ...props }) { const isTaskList = className?.split(/\s+/).includes('contains-task-list'); return <ul dir="auto" data-source-line={getSourceLine(node as MarkdownNode)} className={`${isTaskList ? 'list-none' : 'list-disc'} my-2 space-y-1 ps-6 pe-0`} {...props}>{children}</ul>; },
          ol({ children, node, ...props }) { return <ol dir="auto" data-source-line={getSourceLine(node as MarkdownNode)} className="my-2 list-decimal space-y-1 ps-6 pe-0" {...props}>{children}</ol>; },
          li({ children, className, node, ...props }) { const isTaskItem = className?.split(/\s+/).includes('task-list-item'); return <li dir="auto" data-source-line={getSourceLine(node as MarkdownNode)} className={`${isTaskItem ? 'list-none' : ''} my-1`} {...props}>{children}</li>; },
          blockquote({ children, node }) { const calloutType = String((node as MarkdownNode).properties?.['data-callout-type'] ?? ''); if (calloutType) return <blockquote dir="auto" data-source-line={getSourceLine(node as MarkdownNode)} data-callout-type={calloutType} className={`markdown-callout markdown-callout-${calloutType}`}>{children}</blockquote>; return <blockquote dir="auto" data-source-line={getSourceLine(node as MarkdownNode)} className="my-3 border-s-4 border-primary bg-surface/60 py-2 pe-4 italic shadow-sm">{children}</blockquote>; },
          table({ children, node }) { return <div className="my-5 overflow-x-auto rounded-lg border border-border shadow-sm"><table data-source-line={getSourceLine(node as MarkdownNode)} className="w-full min-w-[520px] border-collapse">{children}</table></div>; },
          thead({ children }) { return <thead className="bg-surface font-bold">{children}</thead>; },
          tbody({ children }) { return <tbody className="divide-y divide-border">{children}</tbody>; },
          tr({ children }) { return <tr className="border-b border-border last:border-b-0">{children}</tr>; },
          th({ children }) { return <th dir="auto" className="border border-border px-4 py-2.5 text-start font-bold">{children}</th>; },
          td({ children }) { return <td dir="auto" className="border border-border px-4 py-2.5 align-top">{children}</td>; },
          pre({ children, node }) { const childElements = React.Children.toArray(children); const containsMermaid = childElements.some((child) => React.isValidElement(child) && child.type === MermaidBlock); if (containsMermaid) return <>{children}</>; return <pre data-source-line={getSourceLine(node as MarkdownNode)} className="dir-ltr my-4 overflow-x-auto rounded-lg border border-border bg-surface p-4 text-left font-mono text-sm shadow-md" dir="ltr">{children}</pre>; },
          code({ className, children, node, ...props }: ComponentPropsWithoutRef<'code'> & { node?: MarkdownNode }) {
            const match = /language-([\w-]+)/.exec(className || '');
            const language = match?.[1]?.toLowerCase();
            const rawSource = node?.properties?.['data-mermaid-source'];
            const chart = typeof rawSource === 'string' ? rawSource.replace(/\n$/, '') : String(children).replace(/\n$/, '');
            const sourceLine = getSourceLine(node);
            if (language === 'mermaid' || language === 'mermaid-raw' || isMermaidDiagram(chart)) return <MermaidBlock chart={chart} sourceLine={sourceLine} />;
            return <code className={className} dir="ltr" {...props}>{children}</code>;
          },
        }}>
          {debouncedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};
