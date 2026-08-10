import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useThemeStore } from '../../store/useThemeStore';
import { exportAsMarkdown } from '../../lib/export/fileExport';
import { FeedbackModal } from '../modals/FeedbackModal';
import { AboutModal } from '../modals/AboutModal';

export const TopToolbar: React.FC = () => {
  const { markdown, fileName, setFileName, resetEditor, insertTextAtCursor } = useEditorStore();
  const { theme, setTheme, fontSize, setFontSize, fontFamily, setFontFamily, setTextColor } =
    useThemeStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleExport = () => {
    exportAsMarkdown(markdown, fileName);
    setActiveMenu(null);
  };

  return (
    <>
      <header className="h-14 bg-surface border-b border-border flex items-center px-4 shrink-0 shadow-sm justify-between select-none">
        <div className="flex items-center space-x-2 space-x-reverse relative">
          {/* منوی فایل */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className="px-3 py-1.5 hover:bg-bg rounded text-sm font-medium transition-colors"
            >
              فایل
            </button>
            {activeMenu === 'file' && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded shadow-lg py-1 z-50">
                <button onClick={() => setTextColor('#ff0000')}> Red</button>
                <button
                  onClick={() => {
                    resetEditor();
                    setActiveMenu(null);
                  }}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-bg"
                >
                  فایل جدید
                </button>
                <button
                  onClick={() => {
                    const n = prompt('نام فایل:', fileName);
                    if (n) setFileName(n);
                    setActiveMenu(null);
                  }}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-bg"
                >
                  ذخیره با نام..
                </button>
                <button
                  onClick={handleExport}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-bg"
                >
                  خروجی Markdown
                </button>
              </div>
            )}
          </div>

          {/* منوی ویرایش */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              className="px-3 py-1.5 hover:bg-bg rounded text-sm font-medium transition-colors"
            >
              ویرایش
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded shadow-lg py-2 z-50 px-2 space-y-2">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">اندازه فونت:</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full bg-bg border border-border rounded p-1 text-xs"
                  >
                    <option value={12}>12px</option>
                    <option value={14}>14px</option>
                    <option value={16}>16px (پیش‌فرض)</option>
                    <option value={18}>18px</option>
                    <option value={20}>20px</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">فونت:</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-bg border border-border rounded p-1 text-xs"
                  >
                    <option value="Vazirmatn">وزیرمتن (Vazirmatn)</option>
                    <option value="Sahel">ساحل (Sahel)</option>
                    <option value="Shabnam">شبنم (Shabnam)</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    insertTextAtCursor('**', '**', 'متن برجسته');
                    setActiveMenu(null);
                  }}
                  className="w-full text-right px-2 py-1 text-sm hover:bg-bg font-bold"
                >
                  Bold
                </button>
                <button
                  onClick={() => {
                    insertTextAtCursor('*', '*', 'متن مورب');
                    setActiveMenu(null);
                  }}
                  className="w-full text-right px-2 py-1 text-sm hover:bg-bg italic"
                >
                  Italic
                </button>
              </div>
            )}
          </div>

          {/* منوی Themes */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'themes' ? null : 'themes')}
              className="px-3 py-1.5 hover:bg-bg rounded text-sm font-medium transition-colors"
            >
              تم‌ها
            </button>
            {activeMenu === 'themes' && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setTheme('light');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-bg ${theme === 'light' ? 'font-bold text-primary' : ''}`}
                >
                  روشن (Light)
                </button>
                <button
                  onClick={() => {
                    setTheme('dark');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-bg ${theme === 'dark' ? 'font-bold text-primary' : ''}`}
                >
                  تاریک (Dark)
                </button>
                <button
                  onClick={() => {
                    setTheme('sepia');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-bg ${theme === 'sepia' ? 'font-bold text-primary' : ''}`}
                >
                  سپیا (Sepia)
                </button>
              </div>
            )}
          </div>

          {/* منوی Help / About */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
              className="px-3 py-1.5 hover:bg-bg rounded text-sm font-medium transition-colors"
            >
              راهنما / Help
            </button>
            {activeMenu === 'help' && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setIsFeedbackOpen(true);
                    setActiveMenu(null);
                  }}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-bg"
                >
                  ارسال نظر / باگ
                </button>
                <button
                  onClick={() => {
                    setIsAboutOpen(true);
                    setActiveMenu(null);
                  }}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-bg"
                >
                  درباره ما
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-text-muted dir-ltr">{fileName}</div>
      </header>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};
