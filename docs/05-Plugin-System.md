# مستند سیستم پلاگین (Milestone 6)

## هدف و معماری
به منظور جلوگیری از حجیم شدن هسته برنامه (Core) و رعایت اصل **Open/Closed** از اصول SOLID، ساختار `PluginManager` پیاده‌سازی شد.

## قابلیت‌های فعلی سیستم پلاگین:
1. **Toolbar Extensibility:** قابلیت تزریق دکمه‌های سفارشی به Toolbar بدون تغییر در سورس کد `TopToolbar.tsx`.
2. **Markdown Parsing Extensibility:** قابلیت اضافه‌کردن سیستم‌های پردازشی جدید (مثل مایکرو-تایپوگرافی یا ابزارهای AI) از طریق توابع ثبت Remark/Rehype پلاگین‌ها.

## نحوه استفاده (مثال)
توسعه‌دهندگان ثالث می‌توانند در فایل `main.tsx` پیش از رندر اصلی، پلاگین خود را ثبت کنند:
```typescript
import { PluginManager } from './plugins/PluginManager';

PluginManager.registerToolbarButton({
  id: 'ai-summary',
  label: 'خلاصه‌سازی با هوش مصنوعی',
  onClick: () => { alert('AI Summary Plugin Triggered!') }
});