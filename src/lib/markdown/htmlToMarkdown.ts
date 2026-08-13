/**
 * تبدیل HTML/Rich Text به Markdown
 *
 * دلیل ایجاد:
 * مرورگر هنگام Paste کردن محتوای Rich Text از Chat، Word، مرورگر و
 * ابزارهای مشابه معمولاً HTML را در Clipboard قرار می‌دهد.
 *
 * این تابع HTML را به Markdown تبدیل می‌کند تا:
 * 1. محتوای Paste شده مستقیماً وارد Editor شود.
 * 2. Markdown تولیدشده دوباره توسط Preview فعلی پروژه رندر شود.
 * 3. برای این قابلیت dependency جدیدی به پروژه اضافه نشود.
 */

const escapeMarkdownText = (text: string): string => {
  return text.replace(/\\/g, '\\\\').replace(/([`*_[\]{}])/g, '\\$1');
};

const normalizeWhitespace = (text: string): string => {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
};

const convertChildren = (element: Node): string => {
  return Array.from(element.childNodes)
    .map((child) => convertNode(child))
    .join('');
};

const convertList = (element: HTMLElement, ordered: boolean): string => {
  const items = Array.from(element.children).filter(
    (child): child is HTMLElement => child.tagName.toLowerCase() === 'li',
  );

  return (
    items
      .map((item, index) => {
        const prefix = ordered ? `${index + 1}. ` : '- ';
        const content = normalizeWhitespace(convertChildren(item));
        return `${prefix}${content}`;
      })
      .join('\n') + '\n\n'
  );
};

const convertNode = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMarkdownText(node.textContent ?? '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();
  const content = convertChildren(element);

  switch (tag) {
    case 'h1':
      return `# ${normalizeWhitespace(content)}\n\n`;

    case 'h2':
      return `## ${normalizeWhitespace(content)}\n\n`;

    case 'h3':
      return `### ${normalizeWhitespace(content)}\n\n`;

    case 'h4':
      return `#### ${normalizeWhitespace(content)}\n\n`;

    case 'h5':
      return `##### ${normalizeWhitespace(content)}\n\n`;

    case 'h6':
      return `###### ${normalizeWhitespace(content)}\n\n`;

    case 'p':
      return `${normalizeWhitespace(content)}\n\n`;

    case 'strong':
    case 'b':
      return `**${normalizeWhitespace(content)}**`;

    case 'em':
    case 'i':
      return `*${normalizeWhitespace(content)}*`;

    case 'del':
    case 's':
      return `~~${normalizeWhitespace(content)}~~`;

    case 'code':
      if (element.parentElement?.tagName.toLowerCase() === 'pre') {
        return content;
      }

      return `\`${element.textContent ?? ''}\``;

    case 'pre':
      return `\`\`\`\n${element.textContent?.trim() ?? ''}\n\`\`\`\n\n`;

    case 'blockquote': {
      const lines = normalizeWhitespace(content)
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');

      return `${lines}\n\n`;
    }

    case 'ul':
      return convertList(element, false);

    case 'ol':
      return convertList(element, true);

    case 'li':
      return `${normalizeWhitespace(content)}\n`;

    case 'a': {
      const href = element.getAttribute('href');

      if (!href) {
        return content;
      }

      return `[${normalizeWhitespace(content)}](${href})`;
    }

    case 'br':
      return '\n';

    case 'hr':
      return '\n---\n\n';

    case 'img': {
      const src = element.getAttribute('src');
      const alt = element.getAttribute('alt') ?? '';

      if (!src) {
        return '';
      }

      return `![${alt}](${src})`;
    }

    case 'table': {
      /**
       * تغییر: جدول‌های HTML به جدول Markdown ساده تبدیل می‌شوند.
       * دلیل: محتوای Paste شده از ابزارهای وب نباید به صورت HTML خام
       * وارد Editor شود.
       */
      const rows = Array.from(element.querySelectorAll('tr'));

      if (rows.length === 0) {
        return '';
      }

      const markdownRows = rows.map((row) => {
        const cells = Array.from(row.querySelectorAll('th, td'));

        return `| ${cells.map((cell) => normalizeWhitespace(convertChildren(cell))).join(' | ')} |`;
      });

      if (markdownRows.length === 1) {
        const firstRow = rows[0];
        const cellCount = firstRow.querySelectorAll('th, td').length;

        markdownRows.splice(
          1,
          0,
          `| ${Array.from({ length: cellCount }, () => '---').join(' | ')} |`,
        );
      } else {
        const firstRow = rows[0];
        const cellCount = firstRow.querySelectorAll('th, td').length;

        markdownRows.splice(
          1,
          0,
          `| ${Array.from({ length: cellCount }, () => '---').join(' | ')} |`,
        );
      }

      return `${markdownRows.join('\n')}\n\n`;
    }

    default:
      return content;
  }
};

export const htmlToMarkdown = (html: string): string => {
  if (!html.trim()) {
    return '';
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');

  const markdown = convertChildren(document.body);

  return normalizeWhitespace(markdown)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};
