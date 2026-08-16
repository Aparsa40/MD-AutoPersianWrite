import React from 'react';
import { Modal } from '../ui/Modal';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="راهنمای برنامه">
      <div className="max-h-[70vh] overflow-y-auto pl-2 pr-1 space-y-5 text-sm text-text-main leading-7">
        <section>
          <h4 className="mb-2 text-base font-bold text-primary">
            📝 آشنایی با MD-AutoPersianWrite
          </h4>

          <p>
            MD-AutoPersianWrite یک ویرایشگر مدرن Markdown است که برای نوشتن، ویرایش و مشاهده هم‌زمان
            اسناد Markdown طراحی شده است. این برنامه تلاش می‌کند تجربه‌ای ساده، سریع و کاربردی برای
            نگارش اسناد فنی، آموزشی و روزمره فراهم کند.
          </p>
        </section>

        <section>
          <h4 className="mb-2 text-base font-bold text-primary">✨ امکانات اصلی</h4>

          <ul className="list-disc pr-5 space-y-1">
            <li>ویرایش و نمایش هم‌زمان Markdown</li>
            <li>پشتیبانی از Headingها و ساختارهای مختلف Markdown</li>
            <li>پشتیبانی از متن Bold، Italic و Strikethrough</li>
            <li>لیست‌های مرتب و نامرتب</li>
            <li>لینک‌ها و تصاویر</li>
            <li>Blockquote و Calloutها</li>
            <li>جدول‌های Markdown</li>
            <li>Syntax Highlighting برای کدها</li>
            <li>پشتیبانی از فرمول‌های ریاضی با KaTeX</li>
            <li>نمایش نمودارهای Mermaid</li>
            <li>فهرست مطالب (Table of Contents)</li>
            <li>تغییر پوسته و تنظیمات ظاهری برنامه</li>
          </ul>
        </section>

        <section>
          <h4 className="mb-2 text-base font-bold text-primary">📌 Headingها</h4>

          <h1 className="text-2xl font-bold">Heading 1</h1>
          <h2 className="text-xl font-bold">Heading 2</h2>
          <h3 className="text-lg font-bold">Heading 3</h3>
          <h4 className="font-bold">Heading 4</h4>
        </section>

        <section>
          <h4 className="mb-2 text-base font-bold text-primary">✍️ قالب‌بندی متن</h4>

          <p>
            این یک متن <strong>Bold</strong> است و این قسمت <em>Italic</em> است و این قسمت{' '}
            <del>Strikethrough</del> است.
          </p>

          <blockquote className="border-r-4 border-primary pr-4 italic text-text-muted">
            این یک نمونه Blockquote برای نمایش یک نقل‌قول یا نکته مهم است.
          </blockquote>
        </section>

        <section>
          <h4 className="mb-2 text-base font-bold text-primary">📋 لیست‌ها</h4>

          <ul className="list-disc pr-5 space-y-1">
            <li>آیتم اول</li>
            <li>
              آیتم دوم
              <ul className="list-circle pr-5">
                <li>زیرآیتم اول</li>
                <li>زیرآیتم دوم</li>
              </ul>
            </li>
            <li>آیتم سوم</li>
          </ul>

          <ol className="list-decimal pr-5 mt-3 space-y-1">
            <li>مرحله اول</li>
            <li>مرحله دوم</li>
            <li>مرحله سوم</li>
          </ol>
        </section>

        <section>
          <h4 className="mb-2 text-base font-bold text-primary">💻 Code Block</h4>

          <pre className="overflow-x-auto rounded-md border border-border bg-black/10 p-4 text-xs leading-6">
            <code>{`function greet(name: string) {
  return \`Hello, \${name}!\`;
}

const message = greet("Markdown");`}</code>
          </pre>
        </section>

        <section>
          <h4 className="mb-2 text-base font-bold text-primary">📊 جدول</h4>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border text-sm">
              <thead>
                <tr>
                  <th className="border border-border px-3 py-2 text-right">ویژگی</th>
                  <th className="border border-border px-3 py-2 text-right">وضعیت</th>
                  <th className="border border-border px-3 py-2 text-right">توضیح</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-3 py-2">Markdown</td>
                  <td className="border border-border px-3 py-2">فعال</td>
                  <td className="border border-border px-3 py-2">ویرایش و Preview</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">KaTeX</td>
                  <td className="border border-border px-3 py-2">فعال</td>
                  <td className="border border-border px-3 py-2">فرمول‌های ریاضی</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Mermaid</td>
                  <td className="border border-border px-3 py-2">فعال</td>
                  <td className="border border-border px-3 py-2">نمودارها و دیاگرام‌ها</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-base font-bold text-primary">🧮 فرمول ریاضی</h4>

          <p className="mb-2">نمونه‌ای از یک فرمول ساده:</p>

          <div className="rounded-md border border-border bg-black/5 p-4 text-center">E = mc²</div>

          <p className="mt-3">و یک فرمول کمی کامل‌تر:</p>

          <div className="rounded-md border border-border bg-black/5 p-4 text-center">
            a² + b² = c²
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-base font-bold text-primary">🔗 لینک</h4>

          <p>Markdown امکان ایجاد لینک برای منابع و صفحات مرتبط را فراهم می‌کند.</p>

          <div className="mt-2 rounded-md border border-border bg-black/5 p-3 text-xs">
            https://example.com
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-base font-bold text-primary">📐 Mermaid</h4>

          <pre className="overflow-x-auto rounded-md border border-border bg-black/10 p-4 text-xs leading-6">
            <code>{`flowchart TD
    A[شروع] --> B{بررسی ورودی}
    B -->|معتبر| C[پردازش]
    B -->|نامعتبر| D[نمایش خطا]
    C --> E[پایان]
    D --> E`}</code>
          </pre>

          <p className="mt-2 text-text-muted text-xs">
            این بخش نمونه‌ای از سینتکس Mermaid را نمایش می‌دهد.
          </p>
        </section>

        <section>
          <h4 className="mb-2 text-base font-bold text-primary">💡 نکته</h4>

          <div className="rounded-md border border-border bg-black/5 p-4">
            برای مشاهده نتیجه Markdown، متن خود را در ویرایشگر وارد کنید. Preview برنامه نتیجه نهایی
            را به صورت زنده نمایش می‌دهد.
          </div>
        </section>

        <section>
          <h4 className="mb-2 text-base font-bold text-primary">🐞 ارسال نظر و گزارش باگ</h4>

          <p>
            از بخش «ارسال نظر» و «گزارش باگ» می‌توانید بازخورد خود درباره برنامه، مشکلات احتمالی یا
            پیشنهادهای بهبود را ثبت کنید.
          </p>

          <p className="text-text-muted text-xs">
            سیستم ارسال آنلاین در حال حاضر به صورت نمایشی در برنامه قرار دارد و اتصال واقعی آن به
            سرویس دریافت پیام در نسخه‌های آینده اضافه خواهد شد.
          </p>
        </section>

        <section className="border-t border-border pt-4">
          <p className="text-text-muted text-xs">MD-AutoPersianWrite — Markdown Editor</p>
          <p className="text-text-muted text-xs">
            از اینکه از برنامه استفاده می‌کنید، سپاسگزاریم. ❤️
          </p>
        </section>

        <div className="sticky bottom-0 flex justify-end border-t border-border bg-surface pt-3">
          <button
            onClick={onClose}
            className="rounded bg-primary px-4 py-1.5 text-xs text-white transition-opacity hover:opacity-90"
          >
            بستن
          </button>
        </div>
      </div>
    </Modal>
  );
};
