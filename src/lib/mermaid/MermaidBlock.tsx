import React, { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../../store/useThemeStore';

interface MermaidBlockProps {
  chart: string;
}

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
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

        const { default: mermaid } = await import('mermaid');

        if (cancelled) {
          return;
        }

        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: 'Vazirmatn, sans-serif',
        });

        await mermaid.parse(chart);

        if (cancelled) {
          return;
        }

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const { svg, bindFunctions } = await mermaid.render(id, chart);

        if (cancelled || !container) {
          return;
        }

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
        className="my-4 rounded border border-border bg-surface px-4 py-3 text-sm text-text-muted"
        dir="rtl"
      >
        در حال ویرایش دایاگرام Mermaid...
      </div>
    );
  }

  return <div ref={containerRef} className="my-4 flex justify-center overflow-x-auto" dir="ltr" />;
};
