export function convertHtmlToMarkdown(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();
    const children = Array.from(element.childNodes).map(walk).join('');

    switch (tag) {
      case 'h1':
        return `\n# ${children.trim()}\n\n`;
      case 'h2':
        return `\n## ${children.trim()}\n\n`;
      case 'h3':
        return `\n### ${children.trim()}\n\n`;
      case 'h4':
        return `\n#### ${children.trim()}\n\n`;
      case 'h5':
        return `\n##### ${children.trim()}\n\n`;
      case 'h6':
        return `\n###### ${children.trim()}\n\n`;
      case 'strong':
      case 'b':
        return `**${children.trim()}**`;
      case 'em':
      case 'i':
        return `*${children.trim()}*`;
      case 'del':
      case 's':
        return `~~${children.trim()}~~`;
      case 'code':
        return element.parentElement?.tagName.toLowerCase() === 'pre'
          ? children
          : `\`${children}\``;
      case 'pre':
        return `\n\`\`\`\n${children.trim()}\n\`\`\`\n\n`;
      case 'a': {
        const href = element.getAttribute('href');
        return href ? `[${children.trim()}](${href})` : children;
      }
      case 'img': {
        const src = element.getAttribute('src');
        const alt = element.getAttribute('alt') ?? '';
        return src ? `![${alt}](${src})` : '';
      }
      case 'br':
        return '\n';
      case 'li':
        return `- ${children.trim()}\n`;
      case 'ul':
      case 'ol':
        return `\n${children}\n`;
      case 'blockquote':
        return `\n> ${children.trim().replace(/\n/g, '\n> ')}\n\n`;
      case 'hr':
        return '\n---\n\n';
      case 'p':
        return `\n${children.trim()}\n\n`;
      default:
        return children;
    }
  };

  return walk(doc.body)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
