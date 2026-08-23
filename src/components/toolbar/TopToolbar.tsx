import React, { useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useLayoutStore } from '../../store/useLayoutStore';
import { useDocumentSessionStore } from '../../store/useDocumentSessionStore';
import { buildTableOfContents } from '../../lib/markdown/toc';
import { exportAsMarkdown } from '../../lib/export/fileExport';
import { deleteEntry, writeTextFile } from '../../lib/workspace/localWorkspaceFiles';
import { FeedbackModal } from '../modals/FeedbackModal';
import { AboutModal } from '../modals/AboutModal';
import { HyperlinkModal } from '../modals/HyperlinkModal';
import { WorkspaceMenu } from './WorkspaceMenu';
import { DocumentStyleMenu } from './DocumentStyleMenu';
import { AgentMenu } from './AgentMenu';

type FileSystemSavePickerWindow = Window & {
  showSaveFilePicker?: (options?: { suggestedName?: string; startIn?: FileSystemDirectoryHandle }) => Promise<FileSystemFileHandle>;
};

const getSaveFilePicker = () => {
  const picker = (window as FileSystemSavePickerWindow).showSaveFilePicker;
  return typeof picker === 'function' ? picker.bind(window) : null;
};

export const TopToolbar: React.FC = () => {
  const { markdown, fileName, resetEditor, insertTextAtCursor } = useEditorStore();
  const { theme, setTheme, fontSize, setFontSize, fontFamily, setFontFamily, setTextColor } = useThemeStore();
  const { viewMode, setViewMode, orientation, setOrientation, toggleToc, isTocOpen } = useLayoutStore();
  const activeSession = useDocumentSessionStore((state) => state.sessions.find((session) => session.id === state.activeSessionId));
  const markPersisted = useDocumentSessionStore((state) => state.markPersisted);
  const updateSession = useDocumentSessionStore((state) => state.updateSession);
  const createSession = useDocumentSessionStore((state) => state.createSession);
  const closeSession = useDocumentSessionStore((state) => state.closeSession);
  const refreshOpenSessions = useDocumentSessionStore((state) => state.refreshOpenSessions);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHyperlinkOpen, setIsHyperlinkOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const closeMenu = () => setActiveMenu(null);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshOpenSessions();
    } finally {
      setIsRefreshing(false);
      closeMenu();
    }
  };

  const handleOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      createSession({ fileName: file.name, markdown: content, isDirty: false, fileHandle: null, workspaceDirectory: null, isWorkspaceFile: false, isNewWorkspaceFile: false });
      closeMenu();
    };
    reader.onerror = () => window.alert('خواندن فایل انجام نشد.');
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleSaveAs = async () => {
    const picker = getSaveFilePicker();
    if (!picker) {
      window.alert('مرورگر فعلی از پنجره انتخاب محل ذخیره فایل پشتیبانی نمی‌کند.');
      closeMenu();
      return;
    }
    try {
      const handle = await picker({ suggestedName: fileName?.trim() || 'document.md', startIn: activeSession?.workspaceDirectory ?? undefined });
      await writeTextFile(handle, markdown);
      if (activeSession) {
        updateSession(activeSession.id, { fileHandle: handle, fileName: handle.name, isWorkspaceFile: true, isNewWorkspaceFile: false, isDirty: false });
        useEditorStore.setState({ fileName: handle.name, isDirty: false });
        markPersisted(handle);
      }
      closeMenu();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        closeMenu();
        return;
      }
      window.alert(error instanceof Error ? error.message : 'ذخیره با نام انجام نشد.');
      closeMenu();
    }
  };

  const handleDeleteDocument = async () => {
    if (!activeSession) {
      window.alert('سندی برای حذف انتخاب نشده است.');
      closeMenu();
      return;
    }
    const hasPersistedFile = Boolean(activeSession.fileHandle && activeSession.workspaceDirectory);
    const confirmation = hasPersistedFile ? `آیا از حذف «${activeSession.fileName}» از Workspace و بستن آن مطمئن هستید؟` : `آیا از حذف «${activeSession.fileName}» از برنامه و بستن آن مطمئن هستید؟`;
    if (!window.confirm(confirmation)) {
      closeMenu();
      return;
    }
    try {
      if (hasPersistedFile && activeSession.workspaceDirectory) await deleteEntry(activeSession.workspaceDirectory, activeSession.fileName, false);
      closeSession(activeSession.id);
      closeMenu();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'حذف فایل انجام نشد.');
    }
  };

  const handleInsertTableOfContents = () => {
    const toc = buildTableOfContents(markdown);
    if (!toc) {
      window.alert('برای ساخت فهرست مطالب، ابتدا حداقل یک عنوان Markdown مانند # عنوان در سند قرار دهید.');
      return;
    }
    insertTextAtCursor('', '', toc);
    closeMenu();
  };

  return (
    <>
      <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt,.text" className="hidden" onChange={handleOpenFile} />
      <header className="z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 shadow-sm">
        <div className="relative flex items-center space-x-2 space-x-reverse">
          <div className="relative">
            <button type="button" onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')} className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg">فایل</button>
            {activeMenu === 'file' && <div className="absolute right-0 mt-2 w-56 rounded border border-border bg-surface py-1 shadow-lg">
              <button type="button" onClick={() => { resetEditor(); closeMenu(); }} className="w-full px-4 py-2 text-right text-sm hover:bg-bg">فایل جدید</button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-2 text-right text-sm font-medium text-primary hover:bg-bg">درج فایل...</button>
              <button type="button" onClick={() => void handleSaveAs()} className="w-full px-4 py-2 text-right text-sm hover:bg-bg">ذخیره با نام...</button>
              <button type="button" onClick={() => { exportAsMarkdown(markdown, fileName); closeMenu(); }} className="w-full px-4 py-2 text-right text-sm hover:bg-bg">خروجی Markdown</button>
              <div className="my-1 border-t border-border" />
              <button type="button" onClick={() => void handleRefresh()} disabled={isRefreshing} className="w-full px-4 py-2 text-right text-sm hover:bg-bg disabled:cursor-wait disabled:opacity-60">🔄 {isRefreshing ? 'در حال تازه‌سازی...' : 'تازه‌سازی برنامه و اسناد'}</button>
              <div className="my-1 border-t border-border" />
              <button type="button" onClick={() => void handleDeleteDocument()} className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-bg">حذف / Delete</button>
            </div>}
          </div>
          <WorkspaceMenu />
          <div className="relative">
            <button type="button" onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')} className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg">ویرایش</button>
            {activeMenu === 'edit' && <div className="absolute right-0 mt-2 w-60 space-y-2 rounded border border-border bg-surface p-2 shadow-lg">
              <label className="block text-xs text-text-muted">اندازه فونت:<select value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="mt-1 w-full rounded border border-border bg-bg p-1 text-xs">{[12, 14, 16, 18, 20].map((size) => <option key={size} value={size}>{size}px{size === 16 ? ' (پیش‌فرض)' : ''}</option>)}</select></label>
              <label className="block text-xs text-text-muted">فونت:<select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="mt-1 w-full rounded border border-border bg-bg p-1 text-xs"><option value="Vazirmatn">وزیرمتن (Vazirmatn)</option><option value="Sahel">ساحل (Sahel)</option><option value="Shabnam">شبنم (Shabnam)</option></select></label>
              <button type="button" onClick={() => { setIsHyperlinkOpen(true); closeMenu(); }} className="w-full rounded px-2 py-1.5 text-right text-sm font-medium hover:bg-bg">🔗 هایپرلینک</button>
              <button type="button" onClick={handleInsertTableOfContents} className="w-full rounded px-2 py-1.5 text-right text-sm font-medium hover:bg-bg">📑 درج فهرست مطالب</button>
              <div className="my-1 border-t border-border" />
              <button type="button" onClick={() => { insertTextAtCursor('**', '**', 'متن برجسته'); closeMenu(); }} className="w-full px-2 py-1 text-right text-sm font-bold hover:bg-bg">Bold</button>
              <button type="button" onClick={() => { insertTextAtCursor('*', '*', 'متن مورب'); closeMenu(); }} className="w-full px-2 py-1 text-right text-sm italic hover:bg-bg">Italic</button>
              <button type="button" onClick={() => { setTextColor('#ff0000'); closeMenu(); }} className="w-full px-2 py-1 text-right text-sm hover:bg-bg">رنگ متن: قرمز</button>
            </div>}
          </div>
          <div className="relative">
            <button type="button" onClick={() => setActiveMenu(activeMenu === 'preview' ? null : 'preview')} className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg">پیش‌نمایش</button>
            {activeMenu === 'preview' && <div className="absolute right-0 mt-2 w-60 rounded border border-border bg-surface py-1 shadow-lg">
              <button type="button" onClick={() => { setViewMode('split'); closeMenu(); }} className={`w-full px-4 py-2 text-right text-sm hover:bg-bg ${viewMode === 'split' ? 'font-bold text-primary' : ''}`}>حالت پیش‌فرض (دو پنل)</button>
              <button type="button" onClick={() => { setViewMode('preview-only'); closeMenu(); }} className={`w-full px-4 py-2 text-right text-sm hover:bg-bg ${viewMode === 'preview-only' ? 'font-bold text-primary' : ''}`}>نمایش کامل پیش‌نمایش</button>
              <button type="button" onClick={() => { setViewMode('editor-only'); closeMenu(); }} className={`w-full px-4 py-2 text-right text-sm hover:bg-bg ${viewMode === 'editor-only' ? 'font-bold text-primary' : ''}`}>نمایش کامل ویرایشگر</button>
              <div className="my-1 border-t border-border" />
              <button type="button" onClick={() => { setOrientation('horizontal'); setViewMode('split'); closeMenu(); }} className={`w-full px-4 py-2 text-right text-sm hover:bg-bg ${orientation === 'horizontal' ? 'font-bold text-primary' : ''}`}>چینش افقی (کنار هم)</button>
              <button type="button" onClick={() => { setOrientation('vertical'); setViewMode('split'); closeMenu(); }} className={`w-full px-4 py-2 text-right text-sm hover:bg-bg ${orientation === 'vertical' ? 'font-bold text-primary' : ''}`}>چینش عمودی (بالا و پایین)</button>
            </div>}
          </div>
          <button type="button" onClick={toggleToc} className={`rounded px-3 py-1.5 text-sm font-medium ${isTocOpen ? 'bg-primary text-white' : 'hover:bg-bg'}`}>فهرست مطالب</button>
          <div className="relative">
            <button type="button" onClick={() => setActiveMenu(activeMenu === 'themes' ? null : 'themes')} className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg">تم‌ها</button>
            {activeMenu === 'themes' && <div className="absolute right-0 mt-2 w-56 rounded border border-border bg-surface py-1 shadow-lg">
              {(['light', 'dark', 'sepia', 'black-white', 'navy-white'] as const).map((name) => <button type="button" key={name} onClick={() => { setTheme(name); closeMenu(); }} className={`w-full px-4 py-2 text-right text-sm hover:bg-bg ${theme === name ? 'font-bold text-primary' : ''}`}>{name === 'light' ? 'روشن (Light)' : name === 'dark' ? 'تاریک (Dark)' : name === 'sepia' ? 'سپیا (Sepia)' : name === 'black-white' ? 'سیاه و سفید (Black & White)' : 'سرمه‌ای و سفید (Navy & White)'}</button>)}
            </div>}
          </div>
          <DocumentStyleMenu />
          <AgentMenu />
          <div className="relative">
            <button type="button" onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')} className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg">راهنما / Help</button>
            {activeMenu === 'help' && <div className="absolute right-0 mt-2 w-48 rounded border border-border bg-surface py-1 shadow-lg"><button type="button" onClick={() => { setIsFeedbackOpen(true); closeMenu(); }} className="w-full px-4 py-2 text-right text-sm hover:bg-bg">ارسال نظر / باگ</button><button type="button" onClick={() => { setIsAboutOpen(true); closeMenu(); }} className="w-full px-4 py-2 text-right text-sm hover:bg-bg">راهنمای برنامه</button></div>}
          </div>
        </div>
        <div className="text-xs text-text-muted dir-ltr">{fileName}</div>
      </header>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <HyperlinkModal isOpen={isHyperlinkOpen} onClose={() => setIsHyperlinkOpen(false)} />
    </>
  );
};
