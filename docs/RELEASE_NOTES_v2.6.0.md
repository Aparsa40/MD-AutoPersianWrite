# Release Notes — v2.6.0

تاریخ انتشار: 2026-08-25

## خلاصه

نسخه 2.6.0 روی تثبیت Workspace، جداسازی Storage از UI، بهبود تجربه کار با فایل‌ها، اصلاح چیدمان RTL و افزایش قابلیت اطمینان Build و Deployment تمرکز دارد.

## قابلیت‌های اصلی

### Workspace

- Workspace Manager در سمت راست رابط RTL.
- Workspace Explorer با نمایش ساختاری فایل‌ها و پوشه‌ها.
- Local Workspace بر پایه File System Access API.
- Cloud Workspace با معماری Provider و Google Drive adapter.
- ایجاد فایل و پوشه، Rename، Delete، Copy، Move و Refresh.
- Contextual Toolbar و Hover actions برای عملیات فایل.
- Multi-selection، Keyboard shortcuts و Drag/Drop.
- همگام‌سازی Workspace operations با Editor sessions.
- مدیریت بهتر Permission و خطاهای Local File System.

### Cloud architecture

- `WorkspaceProvider` به عنوان قرارداد رفتاری مشترک.
- `LocalWorkspaceProvider` برای Local Storage.
- `GoogleDriveProvider` برای Google Drive.
- `providerRegistry` برای مدیریت Cloud Providerها.
- جداسازی کامل Workspace UI از جزئیات Storage.

> مسیر Google Drive در این Release از نظر معماری و Build یکپارچه شده است؛ اعتبارسنجی عملیاتی حساب Google Drive به تنظیمات و دسترسی کاربر وابسته است و جزو تست Release محلی این نسخه محسوب نمی‌شود.

### Layout و RTL

- اصلاح جایگاه Workspace، Editor و Preview در Split View.
- اصلاح ترتیب بصری Toolbar برای چیدمان RTL.
- حفظ مستقل بودن `direction` و `text-align` متن از جهت چیدمان پنل‌ها.
- قابلیت تشخیص و نمایش متن فارسی و انگلیسی بدون تغییر در منطق RTL/LTR.

### Reliability

- بهبود نصب optional dependencies در محیط Linux/Vercel.
- CI با Node.js 20 و 22.
- Production build و Vercel Preview validation.
- هماهنگی نسخه `2.6.0` در `package.json` و `package-lock.json`.

## Rendering و Editor

- Markdown با GFM و Math.
- KaTeX برای فرمول‌های LaTeX.
- Mermaid برای نمودارها.
- Syntax Highlighting با Prism.
- Live Preview و Scroll/Cursor synchronization.
- Outline / Headings.
- Paste هوشمند HTML/Rich Text به Markdown.
- Insert File برای فایل‌های متنی.

## PWA و Theme

- نصب‌پذیری به عنوان PWA.
- Service Worker و مدیریت Cache نسخه‌ها.
- Themeهای Light، Dark، Sepia، Black & White، Navy & White و Graphite.
- Typography settings و ذخیره Theme در LocalStorage.

## Validation

این Release پس از Merge شدن تغییرات Workspace و RTL layout آماده شده است. بررسی‌های CI و Vercel مربوط به تغییرات اخیر موفق بوده‌اند.

## مستندات مرتبط

- `README.md`
- `CHANGELOG.md`
- `docs/WORKSPACE_ARCHITECTURE.md`
