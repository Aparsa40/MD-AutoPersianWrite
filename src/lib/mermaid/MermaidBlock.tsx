import React, { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../../store/useThemeStore';

interface MermaidBlockProps {
  chart: string;
  sourceLine?: number;
}

const createMermaidId = (): string => {
  const random = Math.random().toString(36).slice(2, 10);
  return `mermaid-${Date.now()}-${random}`;
};

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart, sourceLine }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    const renderDiagram = async (): Promise<void> => {
      if (!container || !chart.trim()) {
        setIsLoading(false);
        return;
      }

      try {
        setError(false);
        setIsLoading(true);
        container.replaceChildren();

        const { default: mermaid } = await import('mermaid');
        if (cancelled) return;

        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: 'Vazirmatn, sans-serif',
        });

        if (cancelled) return;

        const { svg, bindFunctions } = await mermaid.render(createMermaidId(), chart);
        if (cancelled) return;

        container.innerHTML = svg;

        if (bindFunctions) {
          try {
            bindFunctions(container);
          } catch (bindError) {
            console.warn('Mermaid bindFunctions warning:', bindError);
          }
        }

        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error('Mermaid render error:', err);
          container.replaceChildren();
          setError(true);
          setIsLoading(false);
        }
      }
    };

    void renderDiagram();

    return () => {
      cancelled = true;
      container?.replaceChildren();
    };
  }, [chart, theme]);

  return (
    <div
      data-source-line={sourceLine}
      className="my-4 rounded-lg border border-border/50 bg-surface/30"
      dir="ltr"
    >
      {error ? (
        <div
          className="px-4 py-3 text-sm text-red-700 dark:text-red-400"
          dir="rtl"
          role="alert"
        >
          <strong>⚠️ خطا در رندر نمودار:</strong>
          <p className="mt-1">نحو نمودار Mermaid را بررسی کنید.</p>
          <small className="mt-2 block opacity-70">
            اطلاعات: {chart.substring(0, 50)}...
          </small>
        </div>
      ) : (
        <>
          {isLoading && chart.trim() && (
            <div className="flex h-32 items-center justify-center" aria-live="polite">
              <div className="animate-pulse text-text-muted">نمودار در حال بارگذاری...</div>
            </div>
          )}
          <div
            ref={containerRef}
            className="flex justify-center overflow-x-auto p-4"
            aria-label="نمودار Mermaid"
            role="img"
          />
        </>
      )}
    </div>
  );
};