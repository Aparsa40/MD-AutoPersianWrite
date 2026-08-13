import { create } from 'zustand';

interface EditorState {
  markdown: string;
  fileName: string;
  isDirty: boolean;
  setMarkdown: (content: string) => void;
  setFileName: (name: string) => void;
  resetEditor: () => void;
  insertTextAtCursor: (prefix: string, suffix?: string, defaultText?: string) => void;
  setTextareaRef: (ref: HTMLTextAreaElement | null) => void;
  textareaRef: HTMLTextAreaElement | null;
}

const DEFAULT_MARKDOWN = `# به MD-AutoPersianWrite V2 خوش آمدید!

ویرایشگر پیشرفته Markdown با پشتیبانی از **ریاضیات KaTeX** و **دایاگرام‌های Mermaid**.

## ۱. فرمول‌های ریاضی (KaTeX / MathJax)
فرمول درون‌خطی: $E = mc^2$

فرمول بلوکی (مستقل):
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## ۲. دایاگرام Mermaid
\`\`\`mermaid
graph TD
    A[شروع پروژه] --> B(تعریف میلستون‌ها)
    B --> C{بررسی کدها}
    C -->|تایید| D[انتشار نسخه نهایی]
    C -->|رد| B
\`\`\`
`;

export const useEditorStore = create<EditorState>((set, get) => ({
  markdown: DEFAULT_MARKDOWN,
  fileName: 'document.md',
  isDirty: false,
  textareaRef: null,

  setMarkdown: (content: string) =>
    set({
      markdown: content,
      isDirty: true,
    }),

  setFileName: (name: string) =>
    set({
      fileName: name,
    }),

  resetEditor: () =>
    set({
      markdown: '',
      fileName: 'untitled.md',
      isDirty: false,
    }),

  /**
   * تغییر: ثبت textarea در Store از callback ref جدا شده است.
   *
   * دلیل:
   * callback ref در React می‌تواند هنگام mount، unmount و تغییرات داخلی
   * چندین بار اجرا شود. انجام setState مستقیم داخل callback ref می‌تواند
   * باعث چرخه زیر شود:
   *
   * ref → Zustand update → render → ref → Zustand update → ...
   *
   * بنابراین EditorPane اکنون این action را فقط از useLayoutEffect
   * و خارج از چرخه commit مربوط به ref فراخوانی می‌کند.
   */
  setTextareaRef: (ref) => {
    const currentRef = get().textareaRef;

    // تغییر: اگر ref واقعاً تغییر نکرده باشد، هیچ Store update انجام نمی‌شود.
    if (currentRef === ref) {
      return;
    }

    set({
      textareaRef: ref,
    });
  },

  // ابزار کمکی برای درج فرمت‌ها در موقعیت نشانگر موس
  insertTextAtCursor: (prefix: string, suffix: string = '', defaultText: string = '') => {
    const { textareaRef, markdown, setMarkdown } = get();

    if (!textareaRef) {
      return;
    }

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;

    const selectedText = markdown.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;

    const newMarkdown = markdown.substring(0, start) + replacement + markdown.substring(end);

    setMarkdown(newMarkdown);

    // تنظیم مجدد فوکوس و موقعیت نشانگر
    setTimeout(() => {
      textareaRef.focus();

      textareaRef.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length,
      );
    }, 0);
  },
}));
