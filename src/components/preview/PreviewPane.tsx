import React, { useMemo } from 'react';
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

import 'katex/dist/katex.min.css';

interface PreviewPaneProps {
  previewRef?: React.RefObject<HTMLDivElement>;
}

interface MarkdownNode {
  position?: {
    start?: {
      line?: number;
    };
  };
}

interface MarkdownComponentProps {
  node?: MarkdownNode;
}

const sourceLineProps = (node?: MarkdownNode) => {
  const line = node?.position?.start?.line;

  return line
    ? {
        'data-source-line': String(line),
      }
    : {};
};

export const PreviewPane: React.FC<PreviewPaneProps> = ({ previewRef }) => {
  const markdown = useEditorStore((state) => state.markdown);
  const debouncedMarkdown = useDebounce(markdown, 150);
  const { fontSize, fontFamily } = useThemeStore();

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

  return (
    <div
      ref={previewRef}
      className="w-full h-full bg-bg p-6 overflow-y-auto custom-scrollbar prose dark:prose-invert max-w-none"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily,
      }}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins as PluggableList}
        rehypePlugins={rehypePlugins as PluggableList}
        components={{
          /**
           * تغییر: شماره خط Markdown روی عناصر Preview ذخیره می‌شود.
           *
           * دلیل:
           * ScrollSync باید بتواند ارتباط بین خط Editor و عنصر متناظر
           * در Preview را پیدا کند. بدون این metadata فقط می‌توانستیم
           * از نسبت ارتفاع دو پنل استفاده کنیم.
           */
          p({ children, node }: ComponentPropsWithoutRef<'p'> & MarkdownComponentProps) {
            return (
              <p
                {...sourceLineProps(node)}
                dir="auto"
                className="my-2 leading-relaxed"
                style={{ unicodeBidi: 'plaintext' }}
              >
                {children}
              </p>
            );
          },

          h1({ children, node }: ComponentPropsWithoutRef<'h1'> & MarkdownComponentProps) {
            return (
              <h1 {...sourceLineProps(node)} dir="auto" className="text-2xl font-bold my-4">
                {children}
              </h1>
            );
          },

          h2({ children, node }: ComponentPropsWithoutRef<'h2'> & MarkdownComponentProps) {
            return (
              <h2 {...sourceLineProps(node)} dir="auto" className="text-xl font-bold my-3">
                {children}
              </h2>
            );
          },

          h3({ children, node }: ComponentPropsWithoutRef<'h3'> & MarkdownComponentProps) {
            return (
              <h3 {...sourceLineProps(node)} dir="auto" className="text-lg font-bold my-2">
                {children}
              </h3>
            );
          },

          h4({ children, node }: ComponentPropsWithoutRef<'h4'> & MarkdownComponentProps) {
            return (
              <h4 {...sourceLineProps(node)} dir="auto" className="font-bold my-2">
                {children}
              </h4>
            );
          },

          h5({ children, node }: ComponentPropsWithoutRef<'h5'> & MarkdownComponentProps) {
            return (
              <h5 {...sourceLineProps(node)} dir="auto" className="font-bold my-2">
                {children}
              </h5>
            );
          },

          h6({ children, node }: ComponentPropsWithoutRef<'h6'> & MarkdownComponentProps) {
            return (
              <h6 {...sourceLineProps(node)} dir="auto" className="font-bold my-2">
                {children}
              </h6>
            );
          },

          li({ children, node }: ComponentPropsWithoutRef<'li'> & MarkdownComponentProps) {
            return (
              <li {...sourceLineProps(node)} dir="auto" className="my-1">
                {children}
              </li>
            );
          },

          blockquote({
            children,
            node,
          }: ComponentPropsWithoutRef<'blockquote'> & MarkdownComponentProps) {
            return (
              <blockquote
                {...sourceLineProps(node)}
                dir="auto"
                className="border-r-4 border-primary pr-4 my-2 italic"
              >
                {children}
              </blockquote>
            );
          },

          code({
            inline,
            className,
            children,
            node,
            ...props
          }: ComponentPropsWithoutRef<'code'> & MarkdownComponentProps & { inline?: boolean }) {
            const match = /language-(\w+)/.exec(className || '');

            if (!inline && match?.[1] === 'mermaid') {
              return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
            }

            if (inline) {
              return (
                <code
                  {...sourceLineProps(node)}
                  className="bg-surface px-1.5 py-0.5 rounded text-xs font-mono dir-ltr inline-block"
                  dir="ltr"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <pre
                {...sourceLineProps(node)}
                className="bg-surface p-4 rounded border border-border overflow-x-auto dir-ltr text-left font-mono text-sm"
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
  );
};
