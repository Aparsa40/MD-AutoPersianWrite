MD-AutoPersianWrite V2.7.1

ویرایشگر مدرن، ماژولار و راست‌چین (RTL) Markdown با پشتیبانی از متن ترکیبی فارسی/انگلیسی، KaTeX، Mermaid، Syntax Highlighting، Live Preview، PWA و Workspace محلی/ابری.

معرفی

MD-AutoPersianWrite یک ویرایشگر Markdown برای ایجاد و مدیریت اسناد فارسی و انگلیسی است که با تمرکز بر تجربه کاربری RTL، رندر دقیق Markdown، مدیریت Workspace و معماری قابل توسعه ساخته شده است.

نسخه 2.7.1 یک Patch Release است که پس از نسخه 2.7.0 منتشر شده و شامل اصلاحات پایداری، بهبود هماهنگی Scroll بین Editor و Preview و رفع مشکلات تجربه کاربری در اسناد طولانی است.

🚀 قابلیت‌های اصلی
✍️ Editor و Markdown
ویرایشگر Markdown با پشتیبانی از RTL/LTR هوشمند.
حفظ ساختار متن ترکیبی فارسی و انگلیسی.
Live Preview با نمایش همزمان خروجی Markdown.
هماهنگ‌سازی Editor و Preview هنگام پیمایش و حرکت Cursor.
حالت‌های نمایش:
Editor
Preview
Split View
چیدمان افقی و عمودی پنل‌ها.
Resize کردن بخش‌های مختلف رابط کاربری.
Outline برای پیمایش سریع Headingها.
Paste هوشمند از HTML و Rich Text.
Insert فایل‌های Markdown و Text.
اعمال رنگ روی بخش انتخاب‌شده متن.
پشتیبانی از درج تصاویر در Markdown و نمایش صحیح در Preview.
🧮 Rendering Engine
Markdown Rendering
پشتیبانی از GitHub Flavored Markdown (GFM).
Table و Task List.
Syntax Highlighting برای Code Blockها.
حفظ ساختار خام Mermaid برای رندر نمودارها.
Mathematical Rendering
پشتیبانی از KaTeX.
رندر فرمول‌های LaTeX در حالت Inline و Block.
Diagram Rendering

پشتیبانی از Mermaid.js برای:

Flowchart
Sequence Diagram
Class Diagram
Gantt Chart
سایر نمودارهای Mermaid
HTML Processing
پردازش HTML با کنترل tag و attributeهای مجاز.
مدیریت URL protocolها برای افزایش امنیت.
📁 Workspace

MD-AutoPersianWrite از معماری Workspace مبتنی بر Provider استفاده می‌کند که رابط کاربری را از روش ذخیره‌سازی جدا می‌کند.

قابلیت‌ها:

Workspace Manager
Workspace Explorer
Local Workspace بر پایه File System Access API
Cloud Workspace Architecture
Google Drive Provider
Create File / Folder
Rename
Delete
Copy
Move
Refresh
Drag & Drop
Multi-selection
Keyboard Shortcuts
مدیریت Permission
هماهنگی Workspace و Editor Session

جزئیات معماری:

docs/WORKSPACE_ARCHITECTURE.md

🎨 رابط کاربری
طراحی کامل RTL.
پشتیبانی از Themeهای مختلف:
Light
Dark
Sepia
Black & White
Navy & White
Graphite
ذخیره تنظیمات Theme.
تنظیم Font Family.
تنظیم اندازه و رنگ متن.
رابط کاربری سازگار با اسناد فارسی و انگلیسی.
🔧 تغییرات نسخه 2.7.1
Fixed
Editor & Preview Scroll Synchronization
رفع مشکل هماهنگ نبودن Scroll بین Editor و Preview.
بهبود رفتار Split View در اسناد طولانی.
بهبود مدیریت viewport هنگام پیمایش.
افزایش پایداری تعامل Editor و Preview.
Improved
بهبود تجربه کار با اسناد Markdown طولانی.
اصلاح Metadata نسخه Release.
🛡️ Reliability & Security

موارد زیر در نسخه‌های اخیر بررسی و بهبود یافته‌اند:

بهبود URL sanitization.
مدیریت بهتر خطاهای Google Drive authentication.
جلوگیری از retry نامحدود در درخواست‌ها.
بهبود cleanup منابع در Editor و Preview.
بهبود مدیریت Service Worker و Cache Update.
اصلاح رفتار RTL/LTR در بخش‌های مختلف رابط کاربری.
محافظت از تغییرات ذخیره‌نشده هنگام بستن یا ایجاد فایل جدید.
🛠️ تکنولوژی‌ها
Core: React + TypeScript + Vite
Styling: TailwindCSS + CSS Variables
State Management: Zustand
Markdown Engine: React-Markdown
Plugins:
Remark-GFM
Remark-Math
Rehype-KaTeX
Rehype-Prism-Plus
Diagrams: Mermaid.js
Testing: Vitest
Linting: ESLint
Formatting: Prettier
Deployment: Vercel
📦 نصب و اجرا
npm install

npm run dev

npm run typecheck

npm run lint

npm run test

npm run build

npm run format
🐳 Docker
docker-compose up -d --build
🤝 مشارکت

قبل از ارسال Pull Request اجرای موارد زیر پیشنهاد می‌شود:

npm run lint
npm run typecheck
npm run test
npm run build

تمام تغییرات باید در Branch مستقل انجام شده و از طریق Pull Request بررسی شوند.

📋 مستندات
CHANGELOG.md — تاریخچه تغییرات
docs/RELEASE_NOTES_v2.7.0.md — Release Notes نسخه 2.7.0
docs/RELEASE_NOTES_v2.7.1.md — Release Notes نسخه 2.7.1
docs/WORKSPACE_ARCHITECTURE.md — معماری Workspace
SECURITY.md — سیاست امنیتی
CONTRIBUTING.md — راهنمای مشارکت
📄 License

این پروژه تحت MIT License منتشر می‌شود.

برای جزئیات کامل به فایل LICENSE مراجعه کنید.
