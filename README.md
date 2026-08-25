# MD-AutoPersianWrite V2.6.0

ویرایشگر مدرن، ماژولار و راست‌چین (RTL) Markdown با پشتیبانی از متن ترکیبی فارسی/انگلیسی، KaTeX، Mermaid، Syntax Highlighting، Live Preview، PWA و Workspace محلی/ابری.

## 🚀 ویژگی‌های اصلی

### ✍️ Editor و Markdown

- **ویرایشگر Markdown با RTL/LTR هوشمند:** متن فارسی به شکل طبیعی RTL و متن انگلیسی LTR نمایش داده می‌شود و ساختار متن ترکیبی حفظ می‌شود.
- **Live Preview:** نمایش همزمان خروجی رندرشده Markdown.
- **همگام‌سازی Editor و Preview:** پیمایش دوطرفه و انتقال Preview به بخش متناظر هنگام حرکت Cursor یا انتخاب بخش‌های سند.
- **حالت‌های نمایش:** Editor، Preview و Split.
- **چیدمان قابل تنظیم:** حالت افقی/عمودی و پنل‌های قابل تغییر اندازه.
- **Outline / Headings:** ناوبری سریع در Headingهای سند.
- **Paste هوشمند:** تبدیل HTML و Rich Text موجود در Clipboard به Markdown در صورت امکان.
- **Insert File:** وارد کردن فایل‌های متنی مانند `.md`، `.markdown` و `.txt`.

### 🧮 Rendering

- **KaTeX:** رندر فرمول‌های LaTeX درون‌خطی و بلوکی.
- **Mermaid:** رندر زنده Flowchart، Gantt، Class Diagram و سایر نمودارهای Mermaid.
- **Syntax Highlighting:** نمایش مناسب Code Blockها با حفظ منبع خام Mermaid.
- **Markdown extensions:** پشتیبانی از GFM، Table، Task List و قابلیت‌های مرتبط.

### 📁 Workspace

نسخه 2.6.0 یک معماری Workspace مبتنی بر Provider دارد که UI را از Storage جدا می‌کند.

- **Workspace Manager:** پنل سمت راست با قابلیت باز/بسته شدن و Resize.
- **Workspace Explorer:** نمایش مرتب درخت فایل‌ها و پوشه‌ها.
- **Local Workspace:** اتصال به یک پوشه محلی از طریق File System Access API.
- **Cloud Workspace:** زیرساخت Provider برای Google Drive و توسعه Providerهای Cloud آینده.
- **File operations:** ایجاد فایل و پوشه، Rename، Delete، Copy، Move و Refresh.
- **Contextual actions:** عملیات Workspace از طریق Toolbar و Hover actions.
- **Session synchronization:** هماهنگ‌سازی sessionهای باز Editor با عملیات فایل‌ها.
- **Permission handling:** درخواست دسترسی Local فقط در مسیرهای کاربری لازم و مدیریت بهتر خطاهای Permission.
- **Provider abstraction:** Workspace UI به API یا روش ذخیره‌سازی خاص وابسته نیست.

جزئیات معماری Workspace در [`docs/WORKSPACE_ARCHITECTURE.md`](docs/WORKSPACE_ARCHITECTURE.md) مستند شده است.

### 🎨 رابط کاربری و Theme

- **تم‌های برنامه:** Light، Dark، Sepia، Black & White، Navy & White و Graphite.
- **ذخیره تم:** انتخاب Theme در LocalStorage نگهداری می‌شود.
- **تنظیمات Typography:** تغییر Font Family، اندازه فونت و رنگ متن.
- **رابط RTL:** چیدمان برنامه و Toolbar متناسب با ساختار RTL برنامه تنظیم شده‌اند، بدون تغییر در منطق تشخیص RTL/LTR متن.

### ⚙️ قابلیت‌های برنامه

- **Refresh:** تازه‌سازی برنامه و محتوای اسناد Workspace باز از منوی File.
- **PWA:** نصب و اجرای برنامه به صورت Web App روی سیستم‌های سازگار.
- **Service Worker:** مدیریت Cache و lifecycle نسخه‌های PWA.
- **Plugin Manager:** زیرساخت توسعه قابلیت‌های افزونه‌ای در آینده.
- **Help / Guide:** راهنمای داخلی قابلیت‌های Editor و Preview.

## 🆕 نسخه 2.6.0

نسخه 2.6.0 نسخه تثبیت Workspace و تجربه کاربری برنامه است.

### Workspace و File Management

- اضافه شدن معماری `WorkspaceProvider` برای جداسازی UI از Storage.
- تکمیل Workspace Manager و Workspace Explorer.
- پشتیبانی از Workspace محلی و Provider مربوط به Google Drive.
- اضافه شدن عملیات Create File / Folder، Rename، Delete، Copy، Move و Refresh.
- بهبود Drag/Drop، Multi-selection، Keyboard shortcuts و Contextual actions.
- بهبود همگام‌سازی Workspace file operations با Editor sessions.
- مدیریت بهتر Permission و خطاهای عملیات Local.
- بهبود Pagination، Cache، Retry و Authentication در مسیر Google Drive.

### Layout و RTL

- تثبیت جایگاه Workspace در سمت راست رابط RTL.
- اصلاح ترتیب Editor و Preview در Split View.
- اصلاح ترتیب بصری Toolbar و منوها متناسب با چیدمان برنامه.
- حفظ منطق مستقل تشخیص جهت متن فارسی و انگلیسی.

### Reliability و Deployment

- بهبود نصب dependencyهای optional برای محیط Linux/Vercel.
- اعتبارسنجی CI با Node.js 20 و Node.js 22.
- اعتبارسنجی TypeScript، ESLint، Vitest و Production Build.
- هماهنگی نسخه `package.json` و `package-lock.json` روی `2.6.0`.

## 🛠️ تکنولوژی‌ها

- **Core:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS + CSS Variables
- **State Management:** Zustand
- **Markdown Engine:** React-Markdown
- **Markdown Plugins:** Remark-GFM + Remark-Math
- **HTML Processing:** Rehype-KaTeX + Rehype-Prism-Plus
- **Diagrams:** Mermaid.js
- **Testing:** Vitest
- **Linting:** ESLint
- **Formatting:** Prettier
- **Deployment:** Vercel

## 📁 ساختار کلی پروژه

```text
src/
├── components/
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
│   ├── export/
│   ├── workspace/
│   └── cloud/
├── plugins/
├── store/
├── styles/
└── types/
```

## 📦 نصب و اجرا

### نصب وابستگی‌ها

```bash
npm install
```

### اجرای Development Server

```bash
npm run dev
```

### بررسی TypeScript

```bash
npm run typecheck
```

### اجرای Lint

```bash
npm run lint
```

### اجرای Test

```bash
npm run test
```

### ساخت Production

```bash
npm run build
```

### قالب‌بندی

```bash
npm run format
```

## 🐳 اجرا با Docker

```bash
docker-compose up -d --build
```

## 🔐 امنیت

برای سیاست امنیتی و نحوه گزارش آسیب‌پذیری‌ها به `SECURITY.md` مراجعه کنید.

## 🤝 مشارکت

پیش از ارسال Pull Request اجرای موارد زیر توصیه می‌شود:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

تمام تغییرات باید در Branch مستقل انجام و از طریق Pull Request بررسی شوند؛ تغییرات بدون بررسی نباید مستقیماً روی `main` اعمال شوند.

## 📋 مستندات و تاریخچه

- `CHANGELOG.md` — تاریخچه نسخه‌ها و تغییرات
- `docs/RELEASE_NOTES_v2.6.0.md` — خلاصه Release نسخه 2.6.0
- `docs/WORKSPACE_ARCHITECTURE.md` — معماری Workspace و Providerها
- `SECURITY.md` — سیاست امنیتی
- `CONTRIBUTING.md` — راهنمای مشارکت

## 📄 لایسنس

این پروژه تحت **لایسنس اختصاصی پروژه** مندرج در فایل `LICENSE` منتشر می‌شود. این متن با MIT License یکسان نیست؛ برای شرایط دقیق استفاده، بازتولید، ایجاد تغییر و بازنشر، متن کامل `LICENSE` را مطالعه کنید.
