import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';

export const UnsavedChangesGuard: React.FC = () => {
  const isDirty = useEditorStore((state) => state.isDirty);
  const sessions = useDocumentSessionStore((state) => state.sessions);
  const dirtySessions = sessions.filter((session) => session.isDirty);

  if (!isDirty && dirtySessions.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      dir="rtl"
      className="fixed inset-x-0 top-0 z-[200] flex min-h-16 items-center justify-center border-b-2 border-amber-500 bg-amber-50 px-5 py-3 text-amber-950 shadow-lg dark:bg-amber-950 dark:text-amber-50"
    >
      <div className="flex w-full max-w-5xl items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xl text-white" aria-hidden="true">
          !
        </span>
        <div className="min-w-0">
          <p className="text-base font-extrabold">⚠️ فایل ذخیره نشده دارید</p>
          <p className="text-sm font-medium">
            این سند در حال ویرایش است و تغییرات آن هنوز ذخیره نشده‌اند. قبل از بستن برنامه، فایل را ذخیره کنید.
            {dirtySessions.length > 1 ? ` (${dirtySessions.length} سند تغییرنشده)` : ''}
          </p>
        </div>
      </div>
    </div>
  );
};
