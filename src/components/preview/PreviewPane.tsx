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
import { MermaidBlock } from '../../lib/mermaid/MermaidBlock';
import { PluginManager } from '../../plugins/PluginManager';
import { DocumentCloseButton } from '../document/DocumentCloseButton';

import 'katex/dist/katex.min.css';

interface PreviewPaneProps {
  previewRef?: React.RefObject<HTMLDivElement>;
}

type MarkdownNode = {
  position?: { start?: { line?: number } };
};

const getSourceLine = (node?: MarkdownNode): number | undefined => {
  const line = node?.position?.start?.line;
  return typeof line === 'number' && line > 0 ? line : undefined;
};

const getHeadingId = (text: string, index: number): string => {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `heading-${slug || 'section'}-${index}`;
};

const isMermaidDiagram = (text: string): boolean => {
  const normalized = text.trim();
  if (!normalized) return false;
  const firstMeaningfulLine = normalized
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('%%'))
    ?.replace(/^%%\{.*?\}%%\s*/, '')
    .trim();
  if (!firstMeaningfulLine) return false;
  return /^(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|quadrantChart|xychart(?:-beta)?|block-beta|sankey(?:-beta)?|packet-beta|architecture-beta)\b/.test(firstMeaningfulLine);
};

export const PreviewPane: React.FC<PreviewPaneProps> = ({ previewRef }) => {
  const markdown = useEditorStore((state) => state.markdown);
  const debouncedMarkdown = useDebounce(markdown, 150);
  const { fontSize, fontFamily } = useThemeStore();
  const headingIndex = useRef(0);

  const customRemarkPlugins = PluginManager.getRemarkPlugins();
  const customRehypePlugins = PluginManager.getRehypePlugins();
  const remarkPlugins = useMemo(() => [remarkGfm, remarkMath, ...customRemarkPlugins], [customRemarkPlugins]);
  const rehypePlugins = useMemo(() => [rehypeKatex, rehypePrism, ...customRehypePlugins], [customRehypePlugins]);

  headingIndex.current = 0;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <DocumentCloseButton />
      <div
        ref={previewRef}
        className="h-full w-full overflow-y-auto bg-bg p-6 custom-scrollbar prose dark:prose-invert max-w-none preview-markdown"
        style={{ fontSize: `${fontSize}px`, fontFamily }}
      >
        <ReactMarkdown
          remarkPlugins={remarkPlugins as PluggableList}
          rehypePlugins={rehypePlugins as PluggableList}
          components={{
            p({ children, node }) {
              return <p dir="auto" data-source-line={getSourceLine(node as MarkdownNode)} className="my-2 leading-relaxed" style={{ unicodeBidi: 'plaintext' }}>{children}</p>;
            },
            h1({ children, node }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return <h1 id={getHeadingId(text, index)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-5 text-3xl font-extrabold tracking-tight">{children}</h1>;
            },
            h2({ children, node }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return <h2 id={getHeadingId(text, index)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-4 text-2xl font-bold tracking-tight">{children}</h2>;
            },
            h3({ children, node }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return <h3 id={getHeadingId(text, index)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-3 text-xl font-bold">{children}</h3>;
            },
            h4({ children, node }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return <h4 id={getHeadingId(text, index)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-3 text-lg font-semibold">{children}</h4>;
            },
            h5({ children, node }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return <h5 id={getHeadingId(text, index)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-2 text-base font-semibold">{children}</h5>;
            },
            h6({ children, node }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return <h6 id={getHeadingId(text, index)} data-preview-heading="true" data-source-line={getSourceLine(node as MarkdownNode)} dir="auto" className="my-2 text-sm font-semibold uppercase tracking-wide">{children}</h6>;
            },
            hr({ node }) {
              return <hr data-source-line={getSourceLine(node as MarkdownNode)} className="my-6 border-0 border-t-2 border-border opacity-90" />;
            },
            ul({ children, className, node, ...props }) {
              const isTaskList = className?.split(/\s+/).includes('contains-task-list');
              return <ul dir="auto" data-source-line={getSourceLine(node as MarkdownNode)} className={`${isTaskList ? 'list-none' : 'list-disc'} my-2 space-y-1 pr-6 pl-0`} {...props}>{children}</ul>;
            },
            ol({ children, node, ...props }) {
              return <ol dir="auto" data-source-line={getSourceLine(node as MarkdownNode)} className="my-2 list-decimal space-y-1 pr-6 pl-0" {...props}>{children}</ol>;
            },
            li({ children, className, node, ...props }) {
              const isTaskItem = className?.split(/\s+/).includes('task-list-item');
              return <li dir="auto" data-source-line={getSourceLine(node as MarkdownNode)} className={`${isTaskItem ? 'list-none' : ''} my-1`} {...props}>{children}</li>;
            },
            blockquote({ children, node }) {
              return <blockquote dir="auto" data-source-line={getSourceLine(node as MarkdownNode)} className="my-3 border-r-4 border-primary bg-surface/60 py-2 pr-4 italic shadow-sm">{children}</blockquote>;
            },
            table({ children, node }) {
              return <div className="my-5 overflow-x-auto rounded-lg border border-border shadow-sm"><table data-source-line={getSourceLine(node as MarkdownNode)} className="w-full min-w-[520px] border-collapse text-sm">{children}</table></div>;
            },
            thead({ children }) {
              return <thead className="bg-surface font-bold">{children}</thead>;
            },
            tbody({ children }) {
              return <tbody className="divide-y divide-border">{children}</tbody>;
            },
            tr({ children }) {
              return <tr className="border-b border-border last:border-b-0">{children}</tr>;
            },
            th({ children }) {
              return <th dir="auto" className="border border-border px-4 py-2.5 text-right font-bold">{children}</th>;
            },
            td({ children }) {
              return <td dir="auto" className="border border-border px-4 py-2.5 align-top">{children}</td>;
            },
            code({ inline, className, children, node, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean; node?: MarkdownNode }) {
              const match = /language-([\w-]+)/.exec(className || '');
              const chart = String(children).replace(/\n$/, '');
              const sourceLine = getSourceLine(node);
              if (!inline && (match?.[1] === 'mermaid' || isMermaidDiagram(chart))) return <MermaidBlock chart={chart} sourceLine={sourceLine} />;
              if (inline) return <code className="dir-ltr inline-block rounded bg-surface px-1.5 py-0.5 font-mono text-xs shadow-sm" dir="ltr" {...props}>{children}</code>;
              return <pre data-source-line={sourceLine} className="dir-ltr my-4 overflow-x-auto rounded-lg border border-border bg-surface p-4 text-left font-mono text-sm shadow-md" dir="ltr"><code className={className} dir="ltr" {...props}>{children}</code></pre>;
            },
          }}
        >
          {debouncedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};
