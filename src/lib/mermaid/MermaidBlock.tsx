import React, { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../../store/useThemeStore';

interface MermaidBlockProps {
  chart: string;
  sourceLine?: number;
}

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart, sourceLine }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    const renderDiagram = async (): Promise<void> => {
      if (!container || !chart.trim()) {
        return;
      }

      try {
        setError(false);
        container.replaceChildren();

        const { default: mermaid } = await import('mermaid');

        if (cancelled) return;

        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: 'Vazirmatn, sans-serif',
        });

        await mermaid.parse(chart);
        if (cancelled) return;

        const id = `mermaid-${crypto.randomUUID()}`;
        const { svg, bindFunctions } = await mermaid.render(id, chart);

        if (cancelled || !container) return;

        container.innerHTML = svg;
        bindFunctions?.(container);
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    };

    void renderDiagram();

    return () => {
      cancelled = true;
      container?.replaceChildren();
    };
  }, [chart, theme]);

  if (error) {
    return (
      <div
        data-source-line={sourceLine}
        className="my-4 rounded border border-border bg-surface px-4 py-3 text-sm text-text-muted"
        dir="rtl"
      >
        نمودار Mermaid قابل رندر نیست. نحو نمودار را بررسی کنید.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-source-line={sourceLine}
      className="my-4 flex justify-center overflow-x-auto"
      dir="ltr"
      aria-label="Mermaid diagram"
    />
  );
};
