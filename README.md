# MD-AutoPersianWrite V2.5.0

ویرایشگر مدرن، ماژولار و راست‌چین (RTL) Markdown با پشتیبانی از فرمول‌های ریاضی KaTeX، دایاگرام‌های Mermaid، Syntax Highlighting، Live Preview و PWA.

> **وضعیت نسخه:** `2.5.0` — این نسخه مجموعه‌ای از قابلیت‌های مدیریت سند، Workspace، تم‌ها و Markdown Rendering را تکمیل می‌کند. قابلیت‌های Cloud Workspace و Google Drive هنوز در برنامه توسعه آینده هستند و جزو این نسخه نیستند.

## 🚀 قابلیت‌های اصلی

### Editor / Preview

- ویرایش مستقیم Markdown با پشتیبانی از متن‌های فارسی و ترکیبی RTL/LTR.
- Live Preview با React-Markdown.
- همگام‌سازی Editor و Preview هنگام Scroll و Cursor navigation.
- انتقال Preview به بخش متناظر هنگام کلیک یا جابه‌جایی Cursor.
- Splitter قابل Drag برای تغییر اندازه Editor و Preview.
- حالت‌های Editor Only، Preview Only و Split.
- چیدمان افقی و عمودی.
- Outline / Headings برای ناوبری سریع در سند.
- حفظ sessionهای باز و مدیریت چند سند در Tabهای Editor.

### Markdown Rendering

- GitHub Flavored Markdown از طریق `remark-gfm`.
- فرمول‌های inline و block با `remark-math` و KaTeX.
- Syntax Highlighting برای code blockها با Prism.
- Mermaid برای Flowchart، Gantt، Class Diagram و سایر نمودارهای پشتیبانی‌شده.
- Calloutهای Markdown با الگوی `[!NOTE]`، `[!TIP]`، `[!IMPORTANT]`، `[!WARNING]` و `[!CAUTION]`.
- پردازش کنترل‌شده HTML در Markdown با رعایت ملاحظات امنیتی.
- تولید Table of Contents به‌صورت Markdown واقعی با لینک به Headingها.
- تولید slug برای Headingهای فارسی و انگلیسی و مدیریت Headingهای تکراری.
- پشتیبانی از لینک‌های داخلی Heading و لینک‌های خارجی.
- تبدیل HTML/Rich Text موجود در Clipboard به Markdown در صورت امکان.

### ویرایش و ابزارهای Markdown

- **Hyperlink:** انتخاب متن و درج لینک Markdown از طریق منوی ویرایش.
- **Table of Contents:** درج فهرست مطالب لینک‌دار در محل Cursor بر اساس Headingهای سند.
- پشتیبانی از Footnote و قابلیت‌های استاندارد GFM موجود در renderer.
- Insert File برای وارد کردن فایل‌های Markdown و Text.
- Save As و مدیریت فایل‌های متنی از طریق File System Access API در مرورگرهای سازگار.

### Document Sessions / Workspace

- مدیریت چند سند باز در Tabهای Editor.
- نگهداری draft و وضعیت `isDirty` برای sessionها.
- Workspace محلی مبتنی بر File System Access API.
- نمایش ساختار فایل‌ها و پوشه‌های Workspace.
- ساخت File و Folder.
- باز کردن فایل‌های Markdown/TXT در Editor.
- Save فایل‌های Workspace.
- Copy، Cut، Paste، Rename و Delete برای فایل‌ها و پوشه‌های Workspace.
- جلوگیری از بسته‌شدن سند دارای تغییرات ذخیره‌نشده هنگام Cancel کردن فرآیند Save.
- تشخیص تغییرات ذخیره‌نشده هنگام خروج از صفحه/برنامه از طریق `beforeunload`.
- نمایش وضعیت Dirty در عنوان برنامه.

> **نکته:** نگهداری دائمی Workspaceهای اخیر، بازیابی sessionهای باز و Recovery نسخه موقت فایل‌ها در زمان اجرای مجدد برنامه، هنوز باید در لایه Persistence/Cache پیاده‌سازی شود و در این نسخه به‌عنوان قابلیت تکمیل‌شده ادعا نمی‌شود.

### 🎨 Theme System

**Application Theme:**

- Light
- Dark
- Sepia
- Black & White — زمینه مشکی با نوشته و خطوط سفید.
- Navy & White — زمینه سرمه‌ای با نوشته و خطوط سفید، با حال‌وهوای محیط‌های توسعه مانند VS Code.

**Document Theme:**

- Classic
- GitHub
- Academic
- Modern

Document Theme هنگام استفاده از Application Themeهای تیره باید کنتراست مناسب متن، Heading، Code Block، Border و سایر اجزای سند را حفظ کند.

### 📱 PWA

- نصب به‌عنوان Progressive Web App.
- Manifest با تنظیمات فارسی، RTL و standalone.
- آیکون‌های PWA در اندازه‌های استاندارد و maskable.
- Service Worker و Cache lifecycle.
- حذف Cacheهای قدیمی هنگام فعال شدن نسخه جدید.

### 🧩 Plugin Architecture

- معماری مبتنی بر `PluginManager` برای توسعه قابلیت‌های Markdown و Rendering.
- جداسازی قابلیت‌های Rendering مانند Callout و HTML از هسته Editor.
- زیرساخت توسعه قابلیت‌های آینده مانند ابزارهای AI/Agent و Cloud Workspace.

## 🛡️ امنیت و بازیابی سند

برنامه باید بین «ویرایش عادی» و «خروج از برنامه با سند ذخیره‌نشده» تفاوت بگذارد. هشدار خروج نباید به‌صورت Banner سرتاسری رابط کاربری را قفل کند. محافظ خروج از برنامه از `beforeunload` استفاده می‌کند و Browser پیام استاندارد تأیید خروج را نمایش می‌دهد.

برای **Recovery پس از Crash/Close ناخواسته**، نسخه‌های موقت سند باید در یک Persistence/Cache سبک ذخیره شوند؛ این قابلیت در نقشه راه بعدی قرار دارد و نباید با `beforeunload` اشتباه گرفته شود.

## 🛠️ تکنولوژی‌ها

- **Core:** React + TypeScript + Vite
- **Styling:** TailwindCSS + CSS Variables
- **State Management:** Zustand
- **Markdown Engine:** React-Markdown
- **Markdown Plugins:** Remark-GFM + Remark-Math + custom callout/TOC processing
- **HTML/Math/Code Rendering:** Rehype-KaTeX + Rehype-Prism-Plus + controlled HTML processing
- **Diagrams:** Mermaid.js
- **Local Workspace:** File System Access API
- **PWA:** Web App Manifest + Service Worker
- **Testing:** Vitest
- **Linting:** ESLint
- **Formatting:** Prettier

## 📁 ساختار کلی پروژه

```text
src/
├── components/
│   ├── document/
│   ├── editor/
│   ├── preview/
│   ├── toolbar/
│   ├── layout/
│   ├── settings/
│   ├── toc/
│   ├── workspace/
│   └── ui/
├── hooks/
├── lib/
│   ├── markdown/
│   ├── mermaid/
│   ├── workspace/
│   └── export/
├── plugins/
├── store/
├── styles/
└── types/
```

## 📦 نصب و اجرا

```bash
npm install
npm run dev
```

### Validation

```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run build
```

## 🐳 Docker

```bash
docker-compose up -d --build
```

## 🔐 امنیت

برای نحوه گزارش آسیب‌پذیری‌ها به `SECURITY.md` مراجعه کنید.

## 🤝 مشارکت

راهنمای کامل مشارکت در `CONTRIBUTING.md` قرار دارد. هر تغییر رفتاری یا قابلیت جدید باید مستندات مرتبط و در صورت نیاز `CHANGELOG.md` را نیز به‌روزرسانی کند.

## 📋 تاریخچه نسخه‌ها

تاریخچه تغییرات و سیاست Semantic Versioning در `CHANGELOG.md` نگهداری می‌شود.

## 📄 لایسنس

این پروژه تحت لایسنس اختصاصی مندرج در `LICENSE` منتشر می‌شود. متن کامل `LICENSE` ملاک شرایط استفاده، تغییر و بازنشر است.
