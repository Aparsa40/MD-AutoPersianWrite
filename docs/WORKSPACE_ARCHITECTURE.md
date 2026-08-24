# Workspace Architecture

این سند نقشه مسئولیت فایل‌های Workspace است تا پیدا کردن محل هر رفتار در آینده ساده باشد.

## اصل معماری

`WorkspaceProvider` یک **قرارداد رفتاری (interface)** است، نه موتور ذخیره‌سازی و نه محل پیاده‌سازی Local یا Cloud.

این قرارداد فقط می‌گوید Workspace Manager برای مدیریت یک درخت فایل چه عملیات معنایی‌ای لازم دارد. نحوه اجرای هر عملیات کاملاً به backend مربوط به همان Workspace واگذار می‌شود.

مثلاً:

- در **Local**، `move` می‌تواند با عملیات واقعی File System مثل copy + delete انجام شود.
- در **Google Drive**، `move` می‌تواند با تغییر parent در Drive API انجام شود.
- اگر یک Cloud دیگر لازم باشد، همان عملیات می‌تواند با API مخصوص آن سرویس یا حتی download/upload پیاده‌سازی شود.

بنابراین این interface هیچ فرضی درباره path، FileSystemDirectoryHandle، HTTP API، OAuth، upload، download یا روش ذخیره‌سازی ندارد.

## 1. `WorkspaceManager.tsx` — 🧠 مدیر مادر / قاب UI

مسئول:
- باز و بسته کردن پنل سمت راست Workspace
- نگهداری عرض پنل و Resize
- نمایش عنوان Workspace
- نمایش دکمه بستن پنل
- قرار دادن `WorkspaceExplorer` داخل پنل

این فایل **مسئول Storage نیست** و نباید کد مستقیم Local File System یا Google Drive API داخل آن قرار بگیرد.

## 2. `WorkspaceExplorer.tsx` — 🎛️ مدیر عملیات UI فایل‌ها و پوشه‌ها

مسئول:
- TopToolbar عملیات Workspace
- New Folder / New File
- Insert File / Insert Folder
- Rename / Delete
- نمایش درخت فایل‌ها و پوشه‌ها
- Hover actions: `C`, `R`, `X`, `P`
- انتخاب و باز کردن فایل در Editor
- Refresh کردن لیست بعد از عملیات

این فایل فقط عملیات معنایی را درخواست می‌کند و نباید جزئیات Local یا Cloud را بداند.

## 3. `src/types/workspaceProvider.ts` — 📜 قرارداد عملیات Workspace

این فایل فقط `interface` و typeهای مشترک را تعریف می‌کند:

- `list`
- `readFile`
- `writeFile`
- `createFile`
- `createFolder`
- `copy`
- `move`
- `rename`
- `delete`

این فایل **هیچ Storage واقعی ندارد** و هیچ API را صدا نمی‌زند.

نکته مهم: وجود این قرارداد به این معنی نیست که Local و Cloud باید یک روش فنی برای انجام عملیات داشته باشند. فقط نتیجه و رفتار مورد انتظار Workspace Manager یکسان می‌شود؛ implementation می‌تواند کاملاً متفاوت باشد.

## 4. `src/lib/workspace/localWorkspaceProvider.ts` — 💻 Adapter مربوط به Local

مسئول اجرای قرارداد بالا روی `FileSystemDirectoryHandle` انتخاب‌شده توسط کاربر.

این فایل می‌داند Workspace Local در کدام handle قرار دارد و عملیات واقعی Windows File System را انجام می‌دهد.

مثلاً `copy` و `move` در Local با عملیات File System انجام می‌شوند؛ هیچ Google API یا upload/download در این مسیر وجود ندارد.

## 5. `src/lib/workspace/localWorkspaceFiles.ts` — 🗂️ عملیات خام Local File System

توابع سطح پایین Local در این فایل قرار دارند:
- `listDirectory`
- `createFile`
- `createFolder`
- `readTextFile` / `writeTextFile`
- `deleteEntry`
- `copyEntry`
- `renameEntry`

این فایل مالک منطق مستقیم File System Access API است.

اگر مشکل از دسترسی پوشه، مسیر Local، ساخت فایل، کپی، حذف یا تغییرنام در Windows باشد، این یکی از اولین فایل‌هایی است که باید بررسی شود.

## 6. `src/lib/cloud/googleDriveProvider.ts` — ☁️ Adapter مربوط به Google Drive

مسئول:
- احراز هویت و token مربوط به Google Drive
- اتصال و قطع اتصال Google Drive
- Drive API requests
- نگهداری شناسه Workspace/Folder مربوط به Drive
- پیاده‌سازی `list/read/write/create/copy/move/rename/delete` برای Drive

این فایل **نباید Local File System را بشناسد**.

تفاوت مهم با Local عمداً حفظ می‌شود: اگر Drive برای انتقال یا وارد کردن یک فایل به upload/download نیاز داشته باشد، همین implementation آن را مدیریت می‌کند؛ Workspace Manager مجبور نیست از این تفاوت خبر داشته باشد.

## 7. `src/lib/cloud/providerRegistry.ts` — 📚 ثبت Cloud Providerها

مسئول پیدا کردن Cloud Provider بر اساس شناسه‌ای مثل `google-drive`.

این فایل نباید UI فایل‌ها یا منطق Local را مدیریت کند.

این لایه را عمداً برای Cloud نگه می‌داریم تا بعداً OneDrive، Dropbox، MEGA و سرویس‌های دیگر بتوانند Provider مستقل خودشان را داشته باشند.

## جریان کلی

```text
WorkspaceMenu
    ↓
WorkspaceManager
    ↓
WorkspaceExplorer
    ↓
WorkspaceProvider (contract / فقط قرارداد رفتاری)
    ├── LocalWorkspaceProvider
    │      ↓
    │   localWorkspaceFiles
    │      ↓
    │   Windows File System
    │
    └── GoogleDriveProvider
           ↓
        Google Drive API
```

## یک مثال برای درک Provider

وقتی کاربر `X` یا `C` را روی یک فایل می‌زند، Workspace Manager فقط می‌گوید:

```ts
await provider.copy(entryId, targetParentId)
```

اما اجرای واقعی متفاوت است:

```text
Local:
copy → FileSystem copy

Google Drive:
copy → Drive API

Cloud دیگر:
copy → API مخصوص آن سرویس
یا در صورت نیاز → download + upload
```

بنابراین Provider **روش ذخیره‌سازی را یکسان نمی‌کند**؛ فقط یک نقطه تماس مشخص برای UI فراهم می‌کند.

## قانون مهم

`WorkspaceManager` و `WorkspaceExplorer` نباید به Storage خاصی وابسته شوند.

`LocalWorkspaceProvider` نباید Google Drive را بشناسد.

`googleDriveProvider.ts` نباید Local File System را بشناسد.

`src/lib/cloud/providerRegistry.ts` فقط Cloud Providerها را مدیریت می‌کند و جایگزین Local Workspace نیست.

به این ترتیب اگر یک Storage خراب شد، محل جست‌وجوی مشکل مشخص است و لازم نیست کل Workspace UI بررسی شود.
