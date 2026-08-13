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
- پشتیبانی از تم‌های Light، Dark و Sepia.
- سیستم Plugin Manager پایه برای قابلیت توسعه در نسخه‌های آتی.
- مستندات Docker و CI/CD.
- پشتیبانی از اجرای پروژه به صورت PWA.