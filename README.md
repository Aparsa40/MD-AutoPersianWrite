# MD-AutoPersianWrite V.2.2.0

ویرایشگر مدرن، ماژولار و راست‌چین (RTL) Markdown با پشتیبانی از فرمول‌های ریاضی KaTeX، دایاگرام‌های Mermaid، Syntax Highlighting، پیش‌نمایش زنده و قابلیت اجرا به صورت PWA (وب‌اپلیکیشن).

## 🚀 ویژگی‌های اصلی

- **رابط کاربری فارسی (RTL):** طراحی شده برای استفاده راحت از متن‌های فارسی و ترکیبی فارسی/انگلیسی.
- **ویرایشگر Markdown:** ویرایش مستقیم اسناد Markdown با پشتیبانی از متن‌های RTL و LTR.
- **پیش‌نمایش زنده (Live Preview):** نمایش همزمان خروجی رندرشده Markdown در کنار ویرایشگر.
- **همگام‌سازی Editor و Preview:** پیمایش Editor و Preview به صورت دوطرفه با تلاش برای حفظ موقعیت متناظر در سند.
- **ناوبری با Cursor:** با کلیک یا جابه‌جایی Cursor در Editor، Preview به بخش متناظر سند منتقل می‌شود.
- **پنل‌های قابل تغییر اندازه:** امکان تغییر نسبت Editor و Preview با Drag کردن جداکننده بین دو پنل.
- **حالت‌های مختلف نمایش:** پشتیبانی از حالت‌های Editor، Preview و Split.
- **چیدمان افقی و عمودی:** امکان نمایش Editor و Preview به صورت کنار هم یا روی هم.
- **Outline / فهرست سربرگ‌ها:** نمایش Headingهای سند برای ناوبری سریع در اسناد طولانی.
- **Paste هوشمند Markdown/HTML:** تبدیل محتوای HTML و Rich Text موجود در Clipboard به Markdown در هنگام Paste در صورت امکان.
- **درج فایل (Insert File):** امکان انتخاب و وارد کردن فایل‌های متنی قابل ویرایش مانند Markdown و TXT.
- **فرمول‌نویسی ریاضی:** رندر سریع فرمول‌های LaTeX درون‌خطی `$ ... $` و بلوکی `$$ ... $$` با KaTeX.
- **رسم دایاگرام (Mermaid):** رندر زنده نمودارهای Mermaid از جمله Flowchart، Gantt و Class Diagram.
- **Syntax Highlighting:** نمایش مناسب بلوک‌های کد با Syntax Highlighting.
- **سیستم تم پویا:** پشتیبانی از تم‌های روشن (Light)، تاریک (Dark) و Sepia با ذخیره‌سازی در LocalStorage.
- **تنظیمات تایپوگرافی:** تغییر اندازه فونت، Font Family و تنظیمات ظاهری متن.
- **معماری مبتنی بر Plugin:** فراهم بودن زیرساخت Plugin Manager برای توسعه قابلیت‌های آینده.
- **قابلیت PWA:** امکان نصب و اجرای برنامه به صورت Web App روی سیستم‌های سازگار.

## 🆕 تغییرات نسخه 2.1.0

نسخه `2.1.0` اولین نسخه Minor در خط توسعه نسخه دوم پروژه است و مجموعه‌ای از قابلیت‌های مهم برای بهبود تجربه ویرایش و پیش‌نمایش Markdown را اضافه می‌کند.

### Editor / Preview

- اضافه شدن همگام‌سازی دوطرفه پیمایش Editor و Preview.
- انتقال Preview به موقعیت تقریبی متن متناظر هنگام کلیک یا حرکت Cursor در Editor.
- تلاش برای نگه‌داشتن Editor و Preview در موقعیت متناظر هنگام Scroll.
- اضافه شدن metadata مربوط به شماره خطوط Markdown به عناصر Preview برای بهبود ارتباط Editor و Preview.

### Layout

- اضافه شدن Splitter قابل Drag برای تغییر اندازه Editor و Preview.
- اضافه شدن حالت نمایش کامل Editor.
- اضافه شدن حالت نمایش کامل Preview.
- اضافه شدن حالت نمایش همزمان Editor و Preview.
- اضافه شدن چیدمان افقی.
- اضافه شدن چیدمان عمودی.

### Navigation

- اضافه شدن ابزار Outline / Headings برای مشاهده Headingهای سند.
- امکان استفاده از Headingها برای ناوبری سریع‌تر در اسناد طولانی.

### File Management

- اضافه شدن گزینه **درج فایل (Insert File)** به منوی File.
- امکان انتخاب فایل متنی از سیستم و وارد کردن محتوای آن در Editor.
- پشتیبانی اولیه از فایل‌های Markdown و Text مانند:
  - `.md`
  - `.markdown`
  - `.txt`
  - `.text`

> توجه: یک Web App مرورگری نمی‌تواند به تنهایی فایل‌های سیستم‌عامل را به عنوان برنامه پیش‌فرض ثبت کند. قابلیت Insert File در این نسخه برای وارد کردن فایل‌های متنی قابل ویرایش طراحی شده است.

### Paste

- اضافه شدن پردازش HTML موجود در Clipboard.
- تلاش برای تبدیل Rich Text و HTML به Markdown هنگام Paste.
- حفظ Markdown به عنوان فرمت اصلی داده در Editor.

## 🛠️ تکنولوژی‌ها
t
- **Core:** React + TypeScript + Vite
- **Styling:** TailwindCSS + CSS Variables
- **State Management:** Zustand
- **Markdown Engine:** React-Markdown
- **Markdown Plugins:** Remark-GFM + Remark-Math
- **HTML Processing:** Rehype-KaTeX + Rehype-Prism-Plus
- **Diagrams:** Mermaid.js
- **Testing:** Vitest
- **Linting:** ESLint
- **Formatting:** Prettier

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
│   └── ui/
├── hooks/
├── lib/
│   ├── markdown/
│   ├── mermaid/
│   └── export/
├── plugins/
├── store/
├── styles/
└── types/
```

---

**ساختار پروژه به صورت ماژولار طراحی شده است تا قابلیت‌های جدید بدون وابستگی غیرضروری به هسته برنامه اضافه شوند**.

## 📦 نصب و اجرا

### نصب وابستگی‌ها
```bash
npm install
```
### اجرای سرور توسعه
```bash
npm run dev
```

### اجرای Lint
```bash
npm run lint
```

### قالب‌بندی کد
```bash
npm run format
```

### ساخت نسخه Production
```bash
npm run build
```

### اجرای تست‌ها
```bash
npm run test
```

## 🐳 اجرا با Docker
docker-compose up -d --build

## 🔐 امنیت
برای مشاهده سیاست امنیتی پروژه و نحوه گزارش آسیب‌پذیری‌ها به فایل SECURITY.md مراجعه کنید.

## 🤝 مشارکت
**راهنمای مشارکت در پروژه در فایل CONTRIBUTING.md قرار دارد**.
**پیش از ارسال Pull Request، اجرای حداقل دستورات زیر توصیه می‌شود**:
```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run build
```

### روند تأیید تغییرات
تمام تغییرات پیشنهادی باید از مسیر رسمی مشارکت پروژه انجام شوند: ابتدا درخواست مشارکت/تغییر از طریق راه ارتباطی اعلام‌شده ارسال شود، سپس تغییرات در یک Branch مستقل انجام و از طریق Pull Request برای بررسی تیم ارسال شوند. هیچ تغییری بدون بررسی و تأیید Maintainer نباید مستقیماً روی `main` اعمال شود.

در صورت انتشار نسخه‌ای مشتق‌شده یا بازنشرشده با مجوز پروژه، باید لینک مخزن اصلی پروژه نیز همراه آن درج شود و اعتبار سازندگان حفظ شود.

## 📋 تاریخچه تغییرات
تاریخچه نسخه‌ها و تغییرات پروژه در فایل CHANGELOG.md نگهداری می‌شود.

## 📄 لایسنس
این پروژه تحت **لایسنس اختصاصی پروژه** مندرج در فایل `LICENSE` منتشر می‌شود. این متن با MIT License یکسان نیست؛ برای شرایط دقیق استفاده، بازتولید، ایجاد تغییر و بازنشر، متن کامل `LICENSE` را مطالعه کنید.
