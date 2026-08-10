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
      className="w-1/2 h-full bg-bg p-6 overflow-y-auto custom-scrollbar prose dark:prose-invert max-w-none"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
      }}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins as PluggableList}
        rehypePlugins={rehypePlugins as PluggableList}
        components={{
          // تنظیم جهت اتوماتیک برای پاراگراف‌ها
          p({ children }) {
            return (
              <p dir="auto" className="my-2 leading-relaxed" style={{ unicodeBidi: 'plaintext' }}>
                {children}
              </p>
            );
          },
          // تنظیم جهت اتوماتیک برای تیترها
          h1({ children }) {
            return (
              <h1 dir="auto" className="text-2xl font-bold my-4">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 dir="auto" className="text-xl font-bold my-3">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 dir="auto" className="text-lg font-bold my-2">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 dir="auto" className="font-bold my-2">
                {children}
              </h4>
            );
          },
          // آیتم‌های لیست
          li({ children }) {
            return (
              <li dir="auto" className="my-1">
                {children}
              </li>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote dir="auto" className="border-r-4 border-primary pr-4 my-2 italic">
                {children}
              </blockquote>
            );
          },
          // اجبار بلوک‌های کد به چپ‌چین ماندن (LTR)
          code({
            inline,
            className,
            children,
            ...props
          }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match && match[1] === 'mermaid') {
              return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
            }
            if (inline) {
              return (
                <code
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
