/**
 * Mermaid Utility Module
 *
 * Provides utilities for working with Mermaid diagrams.
 * This file ensures proper initialization and configuration.
 */

import mermaid from 'mermaid';

/**
 * Initialize Mermaid with secure and optimized settings.
 * This should be called once when the app starts.
 */
export const initializeMermaid = (): void => {
  try {
    mermaid.initialize({
      startOnLoad: false, // Manual rendering to prevent conflicts
      securityLevel: 'strict', // XSS prevention
      fontFamily: 'Vazirmatn, sans-serif', // Persian support
      suppressErrorRendering: false, // Show errors
    });
  } catch (error) {
    console.warn('Mermaid initialization warning:', error);
  }
};

/**
 * Check if a code block is likely a Mermaid diagram.
 * Supports all Mermaid diagram types.
 */
export const isMermaidDiagram = (text: string): boolean => {
  const normalized = text.trim();
  if (!normalized) return false;

  const firstMeaningfulLine = normalized
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('%%'))
    ?.replace(/^%%\{.*?\}%%\s*/, '')
    .trim();

  if (!firstMeaningfulLine) return false;

  // Comprehensive Mermaid diagram type detection
  const mermaidKeywords = /^(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|quadrantChart|xychart(?:-beta)?|block-beta|sankey(?:-beta)?|packet|requirement|c4Diagram)/;

  return mermaidKeywords.test(firstMeaningfulLine);
};

/**
 * Get theme-appropriate Mermaid configuration.
 */
export const getMermaidTheme = (appTheme: 'light' | 'dark' | 'sepia'): string => {
  switch (appTheme) {
    case 'dark':
      return 'dark';
    case 'sepia':
      return 'default'; // Sepia uses default theme with custom CSS
    case 'light':
    default:
      return 'default';
  }
};
