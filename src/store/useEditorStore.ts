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

const DEFAULT_MARKDOWN = `# به MD-AutoPersianWrite خوش آمدید! 🚀

> **یک نمونه کامل Markdown**
>
> این سند برای این است که هنگام اجرای اولیه برنامه، قابلیت‌های اصلی ویرایشگر و Preview را یکجا ببینید.

---

## فهرست مطالب

- [متن و قالب‌بندی](#متن-و-قالببندی)
- [لیست‌ها](#لیستها)
- [لینک و تصویر](#لینک-و-تصویر)
- [جدول](#جدول)
- [کد](#کد)
- [فرمول‌های ریاضی](#فرمولهای-ریاضی)
- [Callout](#callout)
- [دایاگرام Mermaid](#دایاگرام-mermaid)
- [Footnote](#footnote)
- [جمع‌بندی](#جمعبندی)

---

## متن و قالب‌بندی

این یک متن معمولی فارسی است که برای نمایش صحیح **راست‌به‌چپ (RTL)** نوشته شده است.

می‌توان بخشی از متن را **Bold**، بخشی را *Italic*، و بخشی را ***Bold + Italic*** کرد.

همچنین می‌توان از ~~خط‌خورده~~، \`inline code\` و [لینک](https://github.com/Aparsa40/MD-AutoPersianWrite) استفاده کرد.

---

### عنوان سطح سوم

#### عنوان سطح چهارم

##### عنوان سطح پنجم

###### عنوان سطح ششم

---

## لیست‌ها

### لیست نامرتب

- Markdown
- React
- TypeScript
- Vite
  - Frontend
  - Build System
  - Development Server

### لیست مرتب

1. ایده
2. طراحی
3. پیاده‌سازی
4. تست
5. انتشار

### Task List

- [x] ایجاد ساختار پروژه
- [x] پیاده‌سازی Markdown Editor
- [x] اضافه کردن Preview
- [x] اضافه کردن KaTeX
- [x] اضافه کردن Mermaid
- [ ] توسعه قابلیت‌های آینده

---

## لینک و تصویر

لینک نمونه:

[GitHub Repository](https://github.com/Aparsa40/MD-AutoPersianWrite)

تصویر نمونه:

![Markdown](https://upload.wikimedia.org/wikipedia/commons/4/48/Markdown-mark.svg)

---

## نقل‌قول

> Markdown یک زبان نشانه‌گذاری ساده و خوانا است.
>
> هدف آن این است که متن خام، حتی قبل از Render شدن، همچنان قابل خواندن باشد.

---

## جدول

| قابلیت | وضعیت | توضیح |
|---|:---:|---|
| Markdown | ✅ | پشتیبانی از Syntax اصلی |
| GFM | ✅ | GitHub Flavored Markdown |
| KaTeX | ✅ | نمایش فرمول‌های ریاضی |
| Mermaid | ✅ | نمایش دایاگرام |
| Syntax Highlighting | ✅ | نمایش کد |
| RTL | ✅ | مناسب برای زبان فارسی |

---

## کد

### JavaScript

\`\`\`javascript
function greet(name) {
  return \`سلام، \${name}! 👋\`;
}

console.log(greet("MD-AutoPersianWrite"));
\`\`\`

### TypeScript

\`\`\`typescript
interface User {
  id: number;
  name: string;
}

const user: User = {
  id: 1,
  name: "Amir",
};
\`\`\`

### Python

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))
\`\`\`

### JSON

\`\`\`json
{
  "name": "MD-AutoPersianWrite",
  "version": "2.2.2",
  "format": "Markdown",
  "rtl": true
}
\`\`\`

---

## فرمول‌های ریاضی

### فرمول درون‌خطی

رابطه معروف اینشتین به صورت $E = mc^2$ نوشته می‌شود.

### فرمول مستقل

$$
E = mc^2
$$

### انتگرال

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}
$$

### معادله درجه دوم

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

### ماتریس

$$
A =
\\begin{bmatrix}
1 & 2 & 3 \\\\
4 & 5 & 6 \\\\
7 & 8 & 9
\\end{bmatrix}
$$

### جمع سری

$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2}
= \\frac{\\pi^2}{6}
$$

---

## Callout

> [!NOTE]
> این یک یادداشت نمونه است.

> [!TIP]
> می‌توانید متن Markdown را در پنل ویرایش کنید و نتیجه را هم‌زمان در Preview ببینید.

> [!IMPORTANT]
> تغییرات مهم سند خود را قبل از خروج از برنامه ذخیره کنید.

> [!WARNING]
> برخی قابلیت‌ها ممکن است به Syntax پشتیبانی‌شده توسط Markdown parser وابسته باشند.

> [!CAUTION]
> قبل از حذف یا بازنویسی محتوای مهم، نسخه‌ای از سند خود را ذخیره کنید.

---

## دایاگرام Mermaid

\`\`\`mermaid
graph TD
    A[شروع] --> B[نوشتن Markdown]
    B --> C{نیاز به Preview؟}
    C -->|بله| D[Render Markdown]
    C -->|خیر| B
    D --> E[نمایش نتیجه]
    E --> F[ذخیره سند]
    F --> G[پایان]
\`\`\`

### دایاگرام جریان توسعه

\`\`\`mermaid
flowchart LR
    Idea[ایده] --> Design[طراحی]
    Design --> Code[پیاده‌سازی]
    Code --> Test[تست]
    Test --> Review[بازبینی]
    Review --> Release[انتشار]
\`\`\`

---

## Footnote

Markdown برای نوشتن مستندات، یادداشت‌ها و محتوای فنی بسیار کاربردی است.[^markdown]

همچنین می‌توان منابع یا توضیحات تکمیلی را در انتهای سند قرار داد.[^editor]

[^markdown]: Markdown یک زبان نشانه‌گذاری سبک و قابل خواندن است.

[^editor]: این متن نمونه برای نمایش قابلیت‌های MD-AutoPersianWrite ایجاد شده است.

---

## ترکیب قابلیت‌ها

می‌توان **متن فارسی** را با \`code\`، فرمول $a^2 + b^2 = c^2$ و لینک [GitHub](https://github.com/Aparsa40/MD-AutoPersianWrite) در یک پاراگراف ترکیب کرد.

> **نکته:** هدف این سند نمایش قابلیت‌های مختلف ویرایشگر است؛ می‌توانید تمام این محتوا را پاک کرده و سند خودتان را از صفر بنویسید.

---

## جمع‌بندی

MD-AutoPersianWrite یک محیط برای نوشتن و مشاهده Markdown است.

**امتحانش کنید:**

1. متن این سند را تغییر دهید.
2. Syntaxهای مختلف Markdown را امتحان کنید.
3. یک فرمول جدید بنویسید.
4. یک دایاگرام Mermaid ایجاد کنید.
5. نتیجه را در Preview مشاهده کنید.

---

### شروع کنید! ✨

**این سند متعلق به شماست؛ ویرایشش کنید و Markdown را تجربه کنید.**
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
