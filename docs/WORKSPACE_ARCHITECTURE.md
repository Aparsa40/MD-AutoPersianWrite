# Workspace Architecture

این سند نقشه مسئولیت فایل‌های Workspace است تا پیدا کردن محل هر رفتار در آینده ساده باشد.

## 1. WorkspaceManager.tsx — مدیر مادر / قاب UI

مسئول:
- باز و بسته کردن پنل سمت راست Workspace
- نگهداری عرض پنل و Resize
- نمایش عنوان Workspace
- نمایش دکمه بستن پنل
- قرار دادن `WorkspaceExplorer` داخل پنل

این فایل **مسئول Storage نیست** و نباید کد مستقیم Local File System یا Google Drive API داخل آن قرار بگیرد.

## 2. WorkspaceExplorer.tsx — مدیر عملیات UI فایل‌ها و پوشه‌ها

مسئول:
- TopToolbar عملیات Workspace
- New Folder / New File
- Insert File / Insert Folder
- Rename / Delete
- نمایش درخت فایل‌ها و پوشه‌ها
- Hover actions: `C`, `R`, `X`, `P`
- انتخاب و باز کردن فایل در Editor
- Refresh کردن لیست بعد از عملیات

این فایل عملیات را از طریق `WorkspaceProvider` درخواست می‌کند؛ خودش نباید جزئیات APIهای Local یا Cloud را بداند.

## 3. types/workspaceProvider.ts — قرارداد مشترک Storage

این فایل فقط قرارداد (`interface`) را تعریف می‌کند:
- list
- readFile
- writeFile
- createFile
- createFolder
- copy
- move
- rename
- delete

هیچ Storage واقعی در این فایل وجود ندارد.

## 4. localWorkspaceProvider.ts — Adapter مربوط به Local

مسئول اجرای قرارداد بالا روی `FileSystemDirectoryHandle` انتخاب‌شده توسط کاربر.

این فایل می‌داند Workspace Local در کدام `FileSystemDirectoryHandle` قرار دارد و عملیات واقعی Windows File System را انجام می‌دهد.

## 5. localWorkspaceFiles.ts — عملیات خام Local File System

توابع سطح پایین Local در این فایل قرار دارند:
- listDirectory
- createFile
- createFolder
- readTextFile / writeTextFile
- deleteEntry
- copyEntry
- renameEntry

این فایل مالک منطق مستقیم File System Access API است.

## 6. googleDriveProvider.ts — Adapter مربوط به Google Drive

مسئول:
- Google OAuth token
- اتصال و قطع اتصال Google Drive
- Drive API requests
- نگهداری provider مربوط به Workspace فعلی Drive
- list/read/write/create/copy/move/rename/delete روی Drive

این فایل تنها جایی است که جزئیات Google Drive API باید در آن باشد.

## 7. cloud/providerRegistry.ts — ثبت Providerهای Cloud

مسئول پیدا کردن Provider بر اساس شناسه‌ای مثل `google-drive`.

این فایل نباید UI فایل‌ها را مدیریت کند.

## جریان کلی

```text
WorkspaceMenu
    ↓
WorkspaceManager
    ↓
WorkspaceExplorer
    ↓
WorkspaceProvider (contract)
    ├── LocalWorkspaceProvider
    │      ↓
    │   localWorkspaceFiles
    │      ↓
    │   Windows File System
    │
    └── GoogleDriveWorkspaceProvider
           ↓
        Google Drive API
```

## قانون مهم

`WorkspaceManager` و `WorkspaceExplorer` نباید به Storage خاصی وابسته شوند.

`LocalWorkspaceProvider` نباید Google Drive را بشناسد.

`googleDriveProvider.ts` نباید Local File System را بشناسد.

به این ترتیب اگر یک Storage خراب شد، محل جست‌وجوی مشکل مشخص است و لازم نیست کل Workspace UI بررسی شود.
