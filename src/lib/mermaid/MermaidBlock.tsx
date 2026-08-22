import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
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

        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: 'Vazirmatn, sans-serif',
        });

        if (cancelled) return;

        // mermaid.render() performs the parsing and rendering in one operation.
        // Running parse() first was unnecessary and could leave Mermaid's global
        // parser/render state out of sync when React re-rendered the block.
        const { svg, bindFunctions } = await mermaid.render(createMermaidId(), chart);

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
