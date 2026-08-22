# تاریخچه تغییرات (Changelog)

تمامی تغییرات قابل توجه پروژه در این فایل مستند می‌شوند.

این پروژه از الگوی Semantic Versioning استفاده می‌کند.

## Versioning Policy

نسخه‌ها بر اساس الگوی زیر شماره‌گذاری می‌شوند:

### MAJOR.MINOR.PATCH

- **MAJOR:** تغییرات اساسی و ناسازگار در API، معماری یا قراردادهای اصلی پروژه.
- **MINOR:** اضافه شدن قابلیت‌های جدید بدون شکستن قابلیت‌های قبلی.
- **PATCH:** رفع Bug، اصلاحات کوچک و تغییرات سازگاری بدون اضافه شدن قابلیت اصلی جدید.

---

## [2.5.1] - 2026-08-23

### Fixed

- تثبیت مسیر رندر Mermaid و جلوگیری از تبدیل منبع خام Mermaid توسط `rehype-prism-plus`.
- حفظ `data-mermaid-source` روی code node و استفاده از منبع اصلی در `PreviewPane` برای جلوگیری از خطاهایی مانند `Syntax error in text` و `[object Object]`.
- اصلاح زنجیره Mermaid/Prism بدون غیرفعال کردن Syntax Highlighting برای زبان‌های معمولی.

### Added

- اضافه شدن قابلیت **تازه‌سازی برنامه و اسناد** از طریق منوی File.
- امکان بازخوانی محتوای فایل‌های Workspace باز از طریق `FileSystemFileHandle` و همگام‌سازی session و editor state.

### Validation

- CI با Node.js 20 و 22 برای lint، typecheck، test و build اجرا می‌شود.
- Vercel deployment نیز باید برای Pull Request نسخه 2.5.1 موفق باشد.

---

## [2.2.2] - 2026-08-16

### Added

#### Markdown Starter Document

- جایگزینی محتوای اولیه Editor با یک سند جامع Markdown برای معرفی و آزمایش قابلیت‌های اصلی برنامه.
- اضافه شدن نمونه‌های Heading، قالب‌بندی متن، لیست‌های نامرتب و مرتب، Task List، لینک، تصویر، جدول، Code Block، Math، Mermaid و Footnote به سند پیش‌فرض.

#### Application Guide

- تبدیل بخش «درباره برنامه» به «راهنمای برنامه».
- اضافه شدن راهنمای کاربردی قابلیت‌های Editor و Preview.
- اضافه شدن نمونه‌های قابل مشاهده برای لیست‌ها، جدول، کد، Markdown و قابلیت‌های مرتبط.

### Improved

- بهبود متن و گزینه‌های منوی Help برای دسترسی مستقیم به راهنمای برنامه.
- بهبود تجربه اولیه کاربر با نمایش یک سند نمونه کامل هنگام اجرای برنامه.
- اصلاح رندر Live Preview برای نمایش صحیح لیست‌های unordered و ordered.
- پشتیبانی بهتر از Task List در Preview با حفظ ساختار ویژه آن.

### Fixed

- رفع مشکل ناپدید شدن markerهای لیست Markdown در Preview.
- علت اصلی: Tailwind CSS Preflight استایل پیش‌فرض `ul` و `ol` را reset می‌کند و پروژه نیز از `@tailwindcss/typography` استفاده نمی‌کند؛ بنابراین markerهای لیست در DOM وجود داشتند اما قابل مشاهده نبودند.
- برای جلوگیری از وابستگی به رفتار CSS خارجی، `ul` و `ol` در `PreviewPane` با استایل‌های صریح Markdown render می‌شوند.

### Documentation

- ثبت تغییرات نسخه `2.2.2` در `CHANGELOG.md`.

### Validation

- GitHub Actions CI با Node.js 20 و 22: موفق.
- `npm run lint`: موفق.
- `npm run typecheck`: موفق.
- `npm run test`: موفق.
- `npm run build`: موفق.
- CodeQL برای commit نهایی release در زمان merge در حال اجرا بود و باید نتیجه نهایی آن نیز بررسی شود.

---

## [2.2.0] - 2026-08-15

### Added

#### Progressive Web App (PWA)

- اضافه شدن پشتیبانی کامل از نصب برنامه به عنوان Progressive Web App.
- اضافه شدن `manifest.json` شامل نام، نام کوتاه، توضیحات، رنگ پوسته و تنظیمات نمایش برنامه.
- اضافه شدن پشتیبانی از حالت `standalone` برای اجرای برنامه مشابه یک نرم‌افزار مستقل.
- اضافه شدن تنظیمات `RTL` و زبان فارسی در PWA Manifest.
- اضافه شدن آیکون‌های PWA در اندازه‌های `192x192` و `512x512`.
- اضافه شدن `maskable` icon support برای سازگاری بهتر آیکون برنامه با سیستم‌عامل‌ها و Launcherهای مختلف.
- اضافه شدن Service Worker برای مدیریت Cache و lifecycle برنامه.
- اضافه شدن ثبت خودکار Service Worker هنگام بارگذاری برنامه.
- اضافه شدن مدیریت نسخه Cache با شناسه نسخه برنامه.
- اضافه شدن حذف Cacheهای قدیمی هنگام فعال شدن نسخه جدید Service Worker.
- اضافه شدن `skipWaiting()` و `clients.claim()` برای فعال‌سازی سریع‌تر نسخه جدید Service Worker.
- اضافه شدن fallback اولیه از Cache برای منابع استاتیک PWA.

### Improved

#### Application Installation

- بهبود قابلیت نصب برنامه روی سیستم‌عامل‌ها و مرورگرهای سازگار با PWA.
- بهبود اطلاعات نمایش داده‌شده هنگام نصب برنامه از طریق Manifest.
- هماهنگ‌سازی `theme-color` بین HTML و PWA Manifest.
- بهبود تجربه اجرای برنامه در حالت standalone.

#### Dependency Security

- به‌روزرسانی `postcss` به نسخه `8.5.26`.
- به‌روزرسانی dependency غیرمستقیم `nanoid` به نسخه `3.3.18`.
- رفع آسیب‌پذیری امنیتی گزارش‌شده برای نسخه‌های قدیمی `nanoid`.
- وضعیت `npm audit` به `0 vulnerabilities` رسید.

### Fixed

- رفع آسیب‌پذیری High Severity مربوط به `nanoid` که از طریق dependency chain مربوط به `postcss` در پروژه وجود داشت.
- حذف dependency vulnerability باقی‌مانده پس از نصب و بررسی dependencyهای پروژه.

### Documentation

- به‌روزرسانی مستندات پروژه برای قابلیت PWA.
- ثبت تغییرات نسخه `2.2.0` در `CHANGELOG.md`.

### Validation

نسخه `2.2.0` با بررسی‌های زیر اعتبارسنجی شده است:

- `npm run format`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm audit`

نتایج فعلی:

- TypeScript typecheck: موفق
- Tests: `11 passed`
- Production build: موفق
- Security audit: `0 vulnerabilities`
- ESLint: موفق، با یک warning مربوط به ناسازگاری نسخه TypeScript با `@typescript-eslint`
- Vite build: موفق، با warning مربوط به بزرگ بودن برخی JavaScript chunks

---

## [2.1.0] - 2026-08-13

### Added

#### Editor / Preview Synchronization

- اضافه شدن سیستم همگام‌سازی دوطرفه Scroll بین Editor و Preview.
- اضافه شدن انتقال Preview به بخش متناظر هنگام کلیک یا جابه‌جایی Cursor در Editor.
- اضافه شدن انتقال تقریبی Editor به بخش متناظر هنگام پیمایش Preview.
- اضافه شدن metadata مربوط به شماره خطوط Markdown به عناصر قابل پیمایش Preview.

#### Resizable Layout

- اضافه شدن Splitter قابل Drag بین Editor و Preview.
- امکان تغییر نسبت اندازه Editor و Preview.
- پشتیبانی از تغییر اندازه پنل‌ها در حالت افقی و عمودی.

#### View Modes

- اضافه شدن حالت نمایش همزمان Editor و Preview.
- اضافه شدن حالت Editor Only.
- اضافه شدن حالت Preview Only.
- اضافه شدن انتخاب Orientation افقی.
- اضافه شدن انتخاب Orientation عمودی.

#### Outline / Headings

- اضافه شدن ابزار Outline برای نمایش Headingهای سند.
- اضافه شدن امکان ناوبری سریع‌تر در اسناد Markdown طولانی.

#### File Management

- اضافه شدن گزینه Insert File به منوی File.
- امکان انتخاب فایل متنی از سیستم کاربر و وارد کردن محتوای آن در Editor.
- پشتیبانی اولیه از فایل‌های متنی زیر:
  - `.md`
  - `.markdown`
  - `.txt`
  - `.text`

#### Paste Processing

- اضافه شدن پردازش HTML موجود در Clipboard.
- اضافه شدن تبدیل Rich Text و HTML به Markdown هنگام Paste در صورت امکان.
- حفظ Markdown به عنوان فرمت اصلی محتوای Editor.

### Improved

- بهبود تجربه کار با Editor و Live Preview.
- بهبود ارتباط ساختاری بین خطوط Markdown و عناصر Preview.
- بهبود ناوبری در اسناد طولانی.
- بهبود انعطاف‌پذیری Layout.
- بهبود قابلیت استفاده از Editor برای محتوای فارسی و ترکیبی RTL/LTR.

### Fixed

- اصلاح حلقه به‌روزرسانی مربوط به ثبت `textareaRef` در Editor.
- جلوگیری از خطای `Maximum update depth exceeded` هنگام Mount شدن Editor.
- اصلاح مدیریت Reference مربوط به `textarea`.
- جلوگیری از ایجاد Loop در همگام‌سازی Scroll بین Editor و Preview.

### Documentation

- به‌روزرسانی `README.md` برای معرفی قابلیت‌های نسخه `2.1.0`.
- ثبت تغییرات نسخه `2.1.0` در `CHANGELOG.md`.

---

## [2.0.0] - Final Specification Release

### Added

- معماری ماژولار با React و Vite.
- پیش‌نمایش زنده Markdown با پشتیبانی از سیستم Debounce جهت بهبود Performance.
- رندرینگ فرمول‌های ریاضی پیچیده از طریق KaTeX.
- پشتیبانی بومی از دایاگرام‌های Mermaid با تطابق رنگ و تم برنامه.
- سیستم هوشمند Syntax Highlighting برای بلاک‌های کد.
- پنل‌های تنظیمات پیشرفته شامل فونت، رنگ و تم نوری.
- پشتیبانی از تم‌های Light, Dark و Sepia.
- سیستم Plugin Manager پایه برای قابلیت توسعه در نسخه‌های آتی.
- مستندات Docker و CI/CD.
- پشتیبانی اولیه از اجرای پروژه به صورت PWA.
