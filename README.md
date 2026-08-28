# MD-AutoPersianWrite V2.6.0

ویرایشگر مدرن، ماژولار و راست‌چین (RTL) Markdown با پشتیبانی از متن ترکیبی فارسی/انگلیسی، KaTeX، Mermaid، Syntax Highlighting، Live Preview، PWA و Workspace محلی/ابری.

## 🚀 ویژگی‌های اصلی

### ✍️ Editor و Markdown
- **ویرایشگر Markdown با RTL/LTR هوشمند:** متن فارسی RTL و متن انگلیسی LTR نمایش داده می‌شود و ساختار متن ترکیبی حفظ می‌شود.
- **Live Preview:** نمایش همزمان خروجی رندرشده Markdown.
- **همگام‌سازی Editor و Preview:** پیمایش دوطرفه و انتقال Preview به بخش متناظر هنگام حرکت Cursor یا انتخاب بخش‌های سند.
- **حالت‌های نمایش:** Editor، Preview و Split.
- **چیدمان قابل تنظیم:** افقی/عمودی و پنل‌های قابل تغییر اندازه.
- **Outline / Headings:** ناوبری سریع در Headingهای سند.
- **Paste هوشمند:** تبدیل HTML و Rich Text موجود در Clipboard به Markdown در صورت امکان.
- **Insert File:** وارد کردن فایل‌های متنی مانند `.md`، `.markdown` و `.txt`.
- **Text Color:** اعمال رنگ روی بخش انتخاب‌شده متن Markdown بدون تغییر رنگ کل سند.

### 🧮 Rendering
- **KaTeX:** رندر فرمول‌های LaTeX درون‌خطی و بلوکی.
- **Mermaid:** رندر زنده Flowchart، Gantt، Class Diagram و سایر نمودارهای Mermaid.
- **Syntax Highlighting:** نمایش Code Blockها با حفظ منبع خام Mermaid.
- **Markdown extensions:** پشتیبانی از GFM، Table، Task List و قابلیت‌های مرتبط.
- **HTML safety:** پردازش HTML با allowlist برای tagها و attributeها و کنترل protocolهای URL.

### 📁 Workspace
نسخه 2.6.0 معماری Workspace مبتنی بر Provider دارد که UI را از Storage جدا می‌کند.

- **Workspace Manager:** پنل سمت راست با قابلیت باز/بسته شدن و Resize.
- **Workspace Explorer:** نمایش مرتب درخت فایل‌ها و پوشه‌ها.
- **Local Workspace:** اتصال به پوشه محلی از طریق File System Access API.
- **Cloud Workspace:** Provider مربوط به Google Drive و زیرساخت توسعه Providerهای آینده.
- **File operations:** ایجاد فایل و پوشه، Rename، Delete، Copy، Move و Refresh.
- **Contextual actions:** عملیات Workspace از طریق Toolbar و Hover actions.
- **Session synchronization:** هماهنگ‌سازی sessionهای باز Editor با عملیات فایل‌ها.
- **Permission handling:** مدیریت دسترسی و خطاهای Permission.
- **Provider abstraction:** Workspace UI به روش ذخیره‌سازی خاص وابسته نیست.

جزئیات معماری Workspace در [`docs/WORKSPACE_ARCHITECTURE.md`](docs/WORKSPACE_ARCHITECTURE.md) مستند شده است.

### 🎨 رابط کاربری و Theme
- **تم‌های برنامه:** Light، Dark، Sepia، Black & White، Navy & White و Graphite.
- **ذخیره تم:** انتخاب Theme در LocalStorage نگهداری می‌شود.
- **تنظیمات Typography:** تغییر Font Family، اندازه فونت و رنگ متن.
- **رابط RTL:** چیدمان برنامه و Toolbar متناسب با ساختار RTL برنامه تنظیم شده‌اند.

### ⚙️ قابلیت‌های برنامه
- **Refresh:** تازه‌سازی برنامه و محتوای اسناد Workspace باز از منوی File.
- **PWA:** نصب و اجرای برنامه به صورت Web App روی سیستم‌های سازگار.
- **Service Worker:** مدیریت Cache و lifecycle نسخه‌های PWA.
- **Plugin Manager:** زیرساخت توسعه قابلیت‌های افزونه‌ای.
- **Help / Guide:** راهنمای داخلی قابلیت‌های Editor و Preview.

## 🔒 Reliability & Security

در فرآیند پایدارسازی نسخه 2.6.0 چند مورد واقعی امنیتی و پایداری بررسی و اصلاح شده‌اند:

- اصلاح URL sanitizer برای جلوگیری از عبور URLهای protocol-relative مانند `//example.com` از allowlist.
- حذف artifact داخلی و غیرضروری مربوط به access-check از repository.
- بهبود رفتار احراز هویت Google Drive در برابر پاسخ `401` با refresh/retry محدود و جلوگیری از retry بی‌نهایت.
- بهبود cleanup منابع در مسیرهای Editor/Preview برای کاهش ریسک listener، timer و observerهای باقی‌مانده.
- هماهنگ‌سازی نسخه Service Worker با نسخه برنامه و بهبود به‌روزرسانی منابع cache شده.
- اصلاح جهت‌دهی RTL/LTR در بخش‌هایی از Preview با استفاده از logical layout properties.
- اصلاح insertion در Editor برای جلوگیری از اختلاف بین مقدار واقعی textarea و Editor store.
- محافظت از سند دارای تغییرات ذخیره‌نشده هنگام New File و Close.
- اصلاح ذخیره سند Workspace/Cloud هنگام بستن سند dirty تا در صورت وجود مقصد ذخیره، به‌جای Save As غیرضروری از provider یا file handle استفاده شود.

> برخی موارد معماری و optimization مانند conflict resolution مبتنی بر ETag برای Google Drive، refactor بزرگ WorkspaceExplorer و بهینه‌سازی‌های پیشرفته rendering به‌عنوان Technical Debt/Backlog نگهداری می‌شوند و برای این Release blocker محسوب نمی‌شوند.

## 🆕 نسخه 2.6.0

نسخه 2.6.0 نسخه تثبیت Workspace و تجربه کاربری برنامه است.

### Workspace و File Management
- معماری `WorkspaceProvider` برای جداسازی UI از Storage.
- Workspace Manager و Workspace Explorer.
- Workspace محلی و Google Drive.
- Create File / Folder، Rename، Delete، Copy، Move و Refresh.
- Drag/Drop، Multi-selection، Keyboard shortcuts و Contextual actions.
- همگام‌سازی Workspace file operations با Editor sessions.
- مدیریت Permission و خطاهای Local File System.
- Pagination، Cache، Retry و Authentication در مسیر Google Drive.

### Layout و RTL
- تثبیت جایگاه Workspace در سمت راست رابط RTL.
- اصلاح ترتیب Editor و Preview در Split View.
- اصلاح ترتیب بصری Toolbar و منوها.
- حفظ منطق مستقل تشخیص جهت متن فارسی و انگلیسی.

### Reliability و Deployment
- بهبود نصب dependencyهای optional برای محیط Linux/Vercel.
- اعتبارسنجی CI با Node.js 20 و Node.js 22.
- اعتبارسنجی TypeScript، ESLint، Vitest و Production Build.
- هماهنگی نسخه `package.json` و `package-lock.json` روی `2.6.0`.
- بهبود Service Worker update strategy و هماهنگی نسخه cache.

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

## 📦 نصب و اجرا

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
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

## 📋 مستندات
- `CHANGELOG.md` — تاریخچه نسخه‌ها و تغییرات
- `docs/RELEASE_NOTES_v2.6.0.md` — خلاصه Release نسخه 2.6.0
- `docs/WORKSPACE_ARCHITECTURE.md` — معماری Workspace و Providerها
- `SECURITY.md` — سیاست امنیتی
- `CONTRIBUTING.md` — راهنمای مشارکت

## 📄 لایسنس

این پروژه تحت **MIT License** منتشر می‌شود. برای شرایط کامل استفاده، کپی، تغییر و توزیع مجدد به فایل `LICENSE` مراجعه کنید.
