# راهنمای مشارکت در پروژه MD-AutoPersianWrite

از اینکه قصد مشارکت در MD-AutoPersianWrite را دارید، سپاسگزاریم. این سند روند پیشنهادی توسعه، تست، مستندسازی و ارسال Pull Request را توضیح می‌دهد.

## قوانین کلی

- مستقیماً روی `main` توسعه ندهید.
- برای هر Feature، Fix یا Documentation change یک Branch مستقل بسازید.
- تغییرات را کوچک، قابل بررسی و با Commitهای هدفمند نگه دارید.
- کد باید با TypeScript Strict Mode، Clean Code و اصول SOLID سازگار باشد.
- از `any` فقط در موارد واقعاً ضروری و با توضیح روشن استفاده کنید.
- فایل‌ها و مسیرهای موجود را پیش از ایجاد مسیر جدید بررسی کنید تا ساختار پروژه بی‌دلیل تکثیر نشود.

## ساختار و معماری

پروژه از React + TypeScript + Vite و Zustand استفاده می‌کند و قابلیت‌های Markdown از طریق React-Markdown و Plugin/Processorهای Remark/Rehype توسعه داده می‌شوند.

برای قابلیت‌هایی که ماهیت Plugin یا Markdown Processing دارند، ترجیح داده می‌شود منطق در `src/plugins` یا `src/lib/markdown` قرار بگیرد و هسته Editor فقط در حد اتصال و orchestration تغییر کند.

قابلیت‌های Workspace محلی در مسیرهای مربوط به `src/components/workspace` و `src/lib/workspace` قرار دارند و باید دسترسی به File System API را از UI جدا نگه دارند.

## نام‌گذاری Branch

از نام‌گذاری واضح استفاده کنید، برای مثال:

```text
feature/hyperlink-editor
feature/google-drive-workspace
feature/agent-menu
fix/unsaved-close-notification
fix/markdown-toc
chore/release-v2.5.0

docs/release-v2.5.0-documentation
```

در Featureهای بزرگ، شماره نسخه هدف را در نام Branch فقط زمانی اضافه کنید که واقعاً بخشی از Release Plan باشد.

## تغییر قابلیت‌های کاربر

هر تغییر رفتاری باید این موارد را بررسی کند:

1. UI و UX موجود بی‌دلیل شکسته نشود.
2. وضعیت‌های Loading، Empty، Error و Cancel بررسی شوند.
3. قابلیت‌های Save/Close با سندهای `isDirty` تست شوند.
4. اگر تغییر به Markdown Rendering مربوط است، هم Editor source و هم Preview output بررسی شوند.
5. اگر قابلیت جدید منوی خالی یا Placeholder است، آن را در Documentation به‌عنوان **زیرساخت/Placeholder** معرفی کنید، نه قابلیت تکمیل‌شده.

## Markdown و Rendering

برای تغییرات Markdown موارد زیر را بررسی کنید:

- Headingهای `#` تا `######`.
- لینک خارجی و لینک داخلی Heading.
- TOC و slugهای فارسی/انگلیسی.
- Code Block و Syntax Highlighting.
- Table، Task List و Footnoteهای GFM.
- Math inline و block با KaTeX.
- Mermaid.
- Calloutهای `[!NOTE]`، `[!TIP]`، `[!IMPORTANT]`، `[!WARNING]` و `[!CAUTION]`.
- HTML کنترل‌شده و ورودی‌های مشکوک مانند tagهای ناقص.

هر sanitizer یا تبدیل متن باید در برابر HTML Injection و XSS احتمالی بررسی شود و CodeQL را جدی بگیرد.

## Workspace و File Management

تغییرات Workspace باید تفاوت بین این موارد را رعایت کنند:

- فایل عادی انتخاب‌شده با File Picker.
- فایل داخل Local Workspace.
- Session باز در Editor.
- Session دارای تغییرات ذخیره‌نشده.
- Cancel شدن Save.
- Delete/Rename فایل یا پوشه‌ای که Session فعال دارد.

دسترسی به فایل سیستم فقط از مسیر APIهای مجاز مرورگر و با مدیریت صحیح Permission/Handle انجام شود.

## Unsaved Changes

هشدار ذخیره‌نشده نباید رابط کاربری را با یک Banner سرتاسری مسدود کند.

رفتار مورد انتظار:

- در زمان ویرایش عادی، Editor و Workspace باید کاملاً قابل استفاده باشند.
- بستن Tab سند دارای تغییرات باید Save flow داشته باشد.
- Cancel کردن Save نباید سند را ببندد.
- خروج از صفحه/برنامه در صورت وجود سند Dirty باید از `beforeunload` استفاده کند.
- متن Native خروج توسط Browser کنترل می‌شود و نباید روی متن سفارشی Browser حساب شود.

## تست و Validation

پیش از Pull Request حداقل دستورات زیر اجرا شوند:

```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run build
```

در صورت تغییر dependency:

```bash
npm install
npm audit
```

و `package.json` و `package-lock.json` باید با یکدیگر هماهنگ باشند.

در CI پروژه، هر دو Node.js `20.x` و `22.x` باید موفق باشند. CodeQL و Deployment مربوط به Pull Request نیز باید بررسی شوند.

## مستندسازی و Versioning

اگر تغییر رفتار یا قابلیت جدیدی ایجاد می‌کنید:

- `README.md` را در صورت نیاز به‌روزرسانی کنید.
- `CHANGELOG.md` را برای Release مربوطه به‌روزرسانی کنید.
- در CHANGELOG بین `Added`، `Improved`، `Fixed`، `Security` و `Documentation` تفکیک قائل شوید.
- Featureهای ناتمام یا Placeholderها را به‌عنوان قابلیت کامل معرفی نکنید.

پروژه از Semantic Versioning استفاده می‌کند:

```text
MAJOR.MINOR.PATCH
```

- `MAJOR`: تغییر ناسازگار.
- `MINOR`: قابلیت جدید سازگار با نسخه قبلی.
- `PATCH`: Bug fix یا اصلاح کوچک بدون Feature اصلی.

پیش از Release باید نسخه در فایل‌های پروژه، مخصوصاً `package.json` و `package-lock.json`، یکسان باشد.

## Pull Request

1. Branch مستقل بسازید.
2. تغییرات را پیاده‌سازی کنید.
3. تست‌های محلی را اجرا کنید.
4. مستندات مرتبط را به‌روزرسانی کنید.
5. تغییرات را Commit کنید.
6. Pull Request را به `main` ارسال کنید.
7. صبر کنید تمام Checkهای مربوط به **آخرین commit** سبز شوند.
8. CodeQL و Vercel را نیز بررسی کنید.
9. فقط پس از بررسی Maintainer و موفقیت Checkها Merge انجام شود.

### نکته مهم درباره Checkها

سبز بودن Check مربوط به یک commit قدیمی کافی نیست. همیشه باید وضعیت Checkهای آخرین SHA مربوط به Head Branch بررسی شود. اگر Branch بعد از اجرای CI تغییر کرده باشد، باید اجرای جدید همان commit مبنا قرار گیرد.

## Release

پیش از Tag و Release:

```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run build
npm audit
```

سپس نسخه، CHANGELOG، Tag و Release باید با یکدیگر هماهنگ باشند.

## امنیت

آسیب‌پذیری‌های امنیتی را در Issue عمومی با جزئیات سوءاستفاده منتشر نکنید. برای گزارش امنیتی از فرآیند تعریف‌شده در `SECURITY.md` استفاده کنید.

## License

فایل `LICENSE` لایسنس معتبر پروژه است. برای شرایط استفاده، تغییر و بازنشر، متن کامل همان فایل ملاک است.
