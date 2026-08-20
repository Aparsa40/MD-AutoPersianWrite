# تاریخچه تغییرات (Changelog)

تمامی تغییرات قابل توجه پروژه در این فایل مستند می‌شوند.

این پروژه از الگوی Semantic Versioning استفاده می‌کند.

## Versioning Policy

### MAJOR.MINOR.PATCH

- **MAJOR:** تغییرات اساسی و ناسازگار در API، معماری یا قراردادهای اصلی پروژه.
- **MINOR:** اضافه شدن قابلیت‌های جدید بدون شکستن قابلیت‌های قبلی.
- **PATCH:** رفع Bug، اصلاحات کوچک و تغییرات سازگاری بدون اضافه شدن قابلیت اصلی جدید.

---

## [2.5.0] - 2026-08-20

نسخه `2.5.0` مجموعه قابلیت‌های جدید مربوط به Theme، Markdown Rendering، مدیریت سند و محافظت از تغییرات ذخیره‌نشده را تکمیل می‌کند.

### Added

#### Application Themes

- اضافه شدن **Black & White** برای نمایش رابط برنامه با زمینه مشکی و نوشته/خطوط سفید.
- اضافه شدن **Navy & White** برای نمایش رابط برنامه با زمینه سرمه‌ای و نوشته/خطوط سفید.

#### Document Themes

- اضافه شدن سیستم Document Theme مستقل از Application Theme.
- اضافه شدن سبک‌های Classic، GitHub، Academic و Modern.
- بهبود کنتراست Document Themeها هنگام استفاده از Application Themeهای تیره.
- تنظیم رنگ متن، Heading، Code Block، Border و عناصر سند برای جلوگیری از متن تیره روی زمینه تیره.

#### Markdown Rendering Plugins

- اضافه شدن Callout Renderer برای `[!NOTE]`، `[!TIP]`، `[!IMPORTANT]`، `[!WARNING]` و `[!CAUTION]`.
- اضافه شدن پردازش کنترل‌شده HTML در Markdown.
- جداسازی قابلیت‌های Rendering از هسته Editor در ساختار Plugin.

#### Markdown Editing Tools

- اضافه شدن گزینه **Hyperlink** به منوی ویرایش.
- امکان انتخاب یک کلمه/عبارت و تبدیل آن به Markdown Link به‌جای وارد کردن URL به‌صورت متن خام.
- اضافه شدن گزینه **Table of Contents / فهرست مطالب** به منوی ویرایش.
- تولید TOC به‌صورت Markdown با لینک‌های داخلی به Headingهای سند.
- تولید slug برای Headingهای فارسی و انگلیسی.
- مدیریت Headingهای تکراری با slug یکتا.
- جلوگیری از وارد شدن خود Heading «فهرست مطالب» به TOC تولیدشده.

#### Document Sessions / Unsaved Changes

- محافظت از سندهای دارای تغییرات ذخیره‌نشده هنگام خروج از برنامه.
- استفاده از `beforeunload` برای جلوگیری از خروج بی‌هشدار در Browserهای سازگار.
- نمایش وضعیت Dirty در عنوان برنامه.
- حفظ سند هنگام Cancel کردن فرآیند Save در زمان بستن Tab سند.
- جلوگیری از بسته‌شدن ناخواسته سند در صورت لغو Save.

#### Local Workspace

- مدیریت Workspace محلی با File System Access API.
- نمایش فایل‌ها و پوشه‌های Workspace.
- ساخت File و Folder.
- باز کردن فایل‌های Markdown/TXT در Editor.
- ذخیره فایل Workspace.
- Copy، Cut، Paste، Rename و Delete.
- مدیریت Sessionهای متعدد برای اسناد باز.

### Improved

- بهبود معماری Plugin برای قابلیت‌های Markdown و Rendering.
- بهبود ارتباط بین Headingهای Markdown و Anchorهای Preview.
- بهبود نمایش Code Blockها، Borderها و Typography در Document Themeها.
- بهبود تجربه مدیریت چند سند با Document Session Tabs.
- اصلاح UX مربوط به هشدار فایل ذخیره‌نشده؛ هشدار نباید به‌صورت Banner سرتاسری رابط برنامه را مسدود کند.

### Fixed

- رفع خطای import بلااستفاده در `PreviewPane` که باعث شکست ESLint/Build می‌شد.
- اصلاح خطاهای lint مربوط به Regexهای `toc.ts`.
- اصلاح Sanitization مربوط به Heading slug برای جلوگیری از باقی‌ماندن fragmentهای HTML مانند `<script`.
- اصلاح خطای Syntax در Regexهای `toc.ts` که باعث شکست CI می‌شد.
- جلوگیری از قفل شدن UI توسط هشدار ذخیره‌نشده.

### Security

- CodeQL برای مسیر تولید slug بررسی شد.
- Sanitization ورودی Headingها طوری اصلاح شد که HTML ناقص نیز در مسیر تولید slug باقی نماند.
- HTML Rendering به‌صورت کنترل‌شده طراحی شد و نباید به‌عنوان اجرای آزاد HTML خام در نظر گرفته شود.

### Documentation

- به‌روزرسانی README برای قابلیت‌های Theme، Rendering، Hyperlink، TOC و Workspace.
- به‌روزرسانی CONTRIBUTING برای روند توسعه Featureهای جدید و Validation.
- هماهنگ‌سازی مستندات نسخه با خط توسعه `v2.5.0`.

### Validation

برای انتشار این نسخه باید آخرین commit روی Branch/PR مربوطه با موارد زیر اعتبارسنجی شود:

- `npm run format`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- GitHub Actions CI با Node.js 20 و 22
- CodeQL
- Deployment در Vercel

> **توجه درباره Version Lock:** در بررسی `main`، مقدار `package.json` روی `2.5.0` است اما Root version در `package-lock.json` هنوز `2.3.0` گزارش می‌شود. این عدم هماهنگی باید پیش از Tag/Release نهایی با اجرای `npm install --package-lock-only` یا فرآیند معادل آن در محیط پروژه اصلاح و سپس Validation شود.

---

## [2.4.0] - 2026-08-19

نسخه `2.4.0` مرحله توسعه Workspace و بهبودهای Editor/Preview را پوشش می‌دهد.

### Added

- توسعه زیرساخت Workspace محلی و Explorer.
- مدیریت Sessionهای چند سندی و Tabهای Editor.
- بهبود File Management برای فایل‌ها و پوشه‌های Workspace.
- افزودن عملیات ایجاد، باز کردن، ذخیره، کپی، Cut/Paste، Rename و Delete در Workspace محلی.
- افزودن منوها و نقاط توسعه برای قابلیت‌های آینده، از جمله مسیر توسعه ابزارهای Agent/AI.

### Improved

- بهبود Scroll Synchronization و ارتباط Editor/Preview.
- بهبود Layout و Splitter بین Editor و Preview.
- بهبود تجربه کار با Workspace و اسناد باز.
- بهبود ساختار Plugin Manager برای توسعه قابلیت‌های آینده.

### Fixed

- رفع خطاهای مرتبط با Scroll Sync و جلوگیری از Update Loop.
- رفع مشکلات مربوط به Mount/Reference در Editor.
- بهبود پایداری Preview و Mermaid Rendering.

---

## [2.3.0] - 2026-08-17

### Added

- تکمیل قابلیت‌های PWA و تجربه اجرای برنامه به‌صورت Web App.
- تکمیل زیرساخت اولیه Workspace و File Management برای توسعه قابلیت‌های بعدی.
- بهبود منوها و ساختار Toolbar برای آماده‌سازی قابلیت‌های جدید Editor.

### Improved

- بهبود ساختار پروژه برای توسعه قابلیت‌های Workspace و Document Session.
- بهبود پایداری Build و CI/CD.

---

## [2.2.2] - 2026-08-16

### Added

#### Markdown Starter Document

- جایگزینی محتوای اولیه Editor با یک سند جامع Markdown برای معرفی و آزمایش قابلیت‌های اصلی برنامه.
- اضافه شدن نمونه‌های Heading، قالب‌بندی متن، لیست‌های نامرتب و مرتب، Task List، لینک، تصویر، جدول، Code Block، Math، Mermaid و Footnote به سند پیش‌فرض.

#### Application Guide

- تبدیل بخش «درباره برنامه» به «راهنمای برنامه».
- اضافه شدن راهنمای کاربردی قابلیت‌های Editor و Preview.

### Improved

- بهبود Help/Guide.
- بهبود تجربه اولیه کاربر با نمایش سند نمونه.
- اصلاح رندر Live Preview برای نمایش صحیح لیست‌های unordered و ordered.
- پشتیبانی بهتر از Task List در Preview.

### Fixed

- رفع مشکل ناپدید شدن markerهای لیست Markdown در Preview.
- رفع مشکلات CSS ناشی از Tailwind Preflight برای `ul` و `ol`.

---

## [2.2.0] - 2026-08-15

### Added

- قابلیت Progressive Web App.
- Manifest، Service Worker، Cache lifecycle و standalone mode.
- آیکون‌های PWA در اندازه‌های `192x192` و `512x512` و maskable.

### Improved

- بهبود نصب و اجرای برنامه به‌صورت PWA.
- به‌روزرسانی dependencyهای امنیتی.
- رفع آسیب‌پذیری High Severity مربوط به `nanoid` و رسیدن `npm audit` به `0 vulnerabilities` در اعتبارسنجی آن نسخه.

---

## [2.1.0] - 2026-08-13

### Added

- Scroll Sync دوطرفه Editor/Preview.
- Cursor navigation بین Editor و Preview.
- Splitter قابل Drag.
- View Modes شامل Split، Editor Only و Preview Only.
- Orientation افقی و عمودی.
- Outline / Headings.
- Insert File.
- Paste HTML/Rich Text به Markdown.

### Fixed

- رفع `Maximum update depth exceeded` در Editor.
- جلوگیری از Loop در Scroll Sync.

---

## [2.0.0] - Final Specification Release

### Added

- معماری React + Vite و سیستم Markdown Editor.
- Live Preview با Debounce.
- KaTeX، Mermaid و Syntax Highlighting.
- سیستم Theme پایه.
- Plugin Manager پایه.
- Docker و CI/CD.
- زیرساخت اولیه PWA.
