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

const getHeadingId = (text: string, index: number): string => {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `heading-${slug || 'section'}-${index}`;
};

export const PreviewPane: React.FC<PreviewPaneProps> = ({ previewRef }) => {
  const markdown = useEditorStore((state) => state.markdown);
  const debouncedMarkdown = useDebounce(markdown, 150);
  const { fontSize, fontFamily } = useThemeStore();
  const headingIndex = useRef(0);

  const customRemarkPlugins = PluginManager.getRemarkPlugins();
  const customRehypePlugins = PluginManager.getRehypePlugins();
  const remarkPlugins = useMemo(
    () => [remarkGfm, remarkMath, ...customRemarkPlugins],
    [customRemarkPlugins],
  );
  const rehypePlugins = useMemo(
    () => [rehypeKatex, rehypePrism, ...customRehypePlugins],
    [customRehypePlugins],
  );

  headingIndex.current = 0;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <DocumentCloseButton />
      <div
        ref={previewRef}
        className="h-full w-full overflow-y-auto bg-bg p-6 custom-scrollbar prose dark:prose-invert max-w-none"
        style={{ fontSize: `${fontSize}px`, fontFamily }}
      >
        <ReactMarkdown
          remarkPlugins={remarkPlugins as PluggableList}
          rehypePlugins={rehypePlugins as PluggableList}
          components={{
            p({ children }) {
              return (
                <p dir="auto" className="my-2 leading-relaxed" style={{ unicodeBidi: 'plaintext' }}>
                  {children}
                </p>
              );
            },
            h1({ children }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return (
                <h1 id={getHeadingId(text, index)} data-preview-heading="true" dir="auto" className="my-4 text-2xl font-bold">
                  {children}
                </h1>
              );
            },
            h2({ children }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return (
                <h2 id={getHeadingId(text, index)} data-preview-heading="true" dir="auto" className="my-3 text-xl font-bold">
                  {children}
                </h2>
              );
            },
            h3({ children }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return (
                <h3 id={getHeadingId(text, index)} data-preview-heading="true" dir="auto" className="my-2 text-lg font-bold">
                  {children}
                </h3>
              );
            },
            h4({ children }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return (
                <h4 id={getHeadingId(text, index)} data-preview-heading="true" dir="auto" className="my-2 font-bold">
                  {children}
                </h4>
              );
            },
            h5({ children }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return (
                <h5 id={getHeadingId(text, index)} data-preview-heading="true" dir="auto" className="my-2 font-bold">
                  {children}
                </h5>
              );
            },
            h6({ children }) {
              const index = headingIndex.current++;
              const text = React.Children.toArray(children).join('');
              return (
                <h6 id={getHeadingId(text, index)} data-preview-heading="true" dir="auto" className="my-2 font-bold">
                  {children}
                </h6>
              );
            },
            ul({ children, className, ...props }) {
              const isTaskList = className?.split(/\s+/).includes('contains-task-list');
              return (
                <ul
                  dir="auto"
                  className={`${isTaskList ? 'list-none' : 'list-disc'} my-2 space-y-1 pr-6 pl-0`}
                  {...props}
                >
                  {children}
                </ul>
              );
            },
            ol({ children, ...props }) {
              return (
                <ol dir="auto" className="my-2 list-decimal space-y-1 pr-6 pl-0" {...props}>
                  {children}
                </ol>
              );
            },
            li({ children, className, ...props }) {
              const isTaskItem = className?.split(/\s+/).includes('task-list-item');
              return (
                <li dir="auto" className={`${isTaskItem ? 'list-none' : ''} my-1`} {...props}>
                  {children}
                </li>
              );
            },
            blockquote({ children }) {
              return (
                <blockquote dir="auto" className="my-2 border-r-4 border-primary pr-4 italic">
                  {children}
                </blockquote>
              );
            },
            code({ inline, className, children, ...props }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
              const match = /language-(\w+)/.exec(className || '');
              if (!inline && match?.[1] === 'mermaid') {
                return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
              }
              if (inline) {
                return (
                  <code
                    className="dir-ltr inline-block rounded bg-surface px-1.5 py-0.5 font-mono text-xs"
                    dir="ltr"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <pre
                  className="dir-ltr overflow-x-auto rounded border border-border bg-surface p-4 text-left font-mono text-sm"
                  dir="ltr"
                >
                  <code className={className} dir="ltr" {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
          }}
        >
          {debouncedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
};
