import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { useThemeStore } from '../../store/useThemeStore';

interface MermaidBlockProps {
  chart: string;
  sourceLine?: number;
}

/**
 * Creates a unique ID for each Mermaid diagram to prevent render conflicts.
 * Uses timestamp and random string for guaranteed uniqueness.
 */
const createMermaidId = (): string => {
  const random = Math.random().toString(36).slice(2, 10);
  return `mermaid-${Date.now()}-${random}`;
};

/**
 * MermaidBlock Component
 *
 * Renders Mermaid diagrams with:
 * - Error boundary with user-friendly Persian messages
 * - Theme synchronization (Light/Dark/Sepia)
 * - Proper cleanup on unmount
 * - Security level: strict (XSS prevention)
 * - Fallback error display
 *
 * @param chart - Mermaid diagram code
 * @param sourceLine - Source line number for scroll sync
 */
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

        /**
         * Initialize Mermaid with security and theme settings
         * - startOnLoad: false (manual rendering)
         * - securityLevel: strict (XSS prevention)
         * - theme: synchronized with app theme
         * - fontFamily: Persian-compatible font (Vazirmatn)
         */
        mermaid.initialize({
          startOnLoad: false,
          theme: theme === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: 'Vazirmatn, sans-serif',
        });

        if (cancelled) return;

        /**
         * mermaid.render() combines parsing and rendering in one operation.
         * This ensures Mermaid's internal state stays synchronized and prevents
         * rendering conflicts when React re-renders the component.
         *
         * Returns both SVG and optional bind functions for interactive elements.
         */
        const { svg, bindFunctions } = await mermaid.render(createMermaidId(), chart);

        if (cancelled || !container) return;

        // Insert rendered SVG into container
        container.innerHTML = svg;

        // Bind interactive functions if any exist
        if (bindFunctions) {
          try {
            bindFunctions(container);
          } catch (bindError) {
            console.warn('Mermaid bindFunctions warning:', bindError);
            // Non-fatal: diagram still renders even if binding fails
          }
        }

        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error('Mermaid render error:', err);
          setError(true);
          setIsLoading(false);
        }
      }
    };

    // Start async rendering
    void renderDiagram();

    // Cleanup function to prevent memory leaks and stale renders
    return () => {
      cancelled = true;
      container?.replaceChildren();
    };
  }, [chart, theme]);

  // Error state: display user-friendly Persian message
  if (error) {
    return (
      <div
        data-source-line={sourceLine}
        className="my-4 rounded border border-red-500/30 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 px-4 py-3 text-sm text-red-700 dark:text-red-400"
        dir="rtl"
        role="alert"
      >
        <strong>⚠️ خطا در رندر نمودار:</strong>
        <p className="mt-1">نحو نمودار Mermaid را بررسی کنید.</p>
        <small className="block mt-2 opacity-70">اطلاعات: {chart.substring(0, 50)}...</small>
      </div>
    );
  }

  // Loading state: show placeholder
  if (isLoading && chart.trim()) {
    return (
      <div
        data-source-line={sourceLine}
        className="my-4 flex justify-center items-center h-32 bg-surface rounded border border-border"
        dir="ltr"
      >
        <div className="animate-pulse text-text-muted">نمودار در حال بارگذاری...</div>
      </div>
    );
  }

  // Render container for Mermaid SVG
  return (
    <div
      ref={containerRef}
      data-source-line={sourceLine}
      className="my-4 flex justify-center overflow-x-auto rounded-lg bg-surface/30 p-4 border border-border/50"
      dir="ltr"
      aria-label="نمودار Mermaid"
      role="img"
    />
  );
};
