import React, { useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useLayoutStore } from '../../store/useLayoutStore';
import { exportAsMarkdown } from '../../lib/export/fileExport';
import { FeedbackModal } from '../modals/FeedbackModal';
import { AboutModal } from '../modals/AboutModal';

export const TopToolbar: React.FC = () => {
  const { markdown, fileName, setFileName, resetEditor, insertTextAtCursor, setMarkdown } =
    useEditorStore();

  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    fontFamily,

    // تغییر: setFontFamily از Theme Store دریافت شد.
    // دلیل: منوی ویرایشگر برای تغییر فونت از این action استفاده می‌کند.
    setFontFamily,
  } = useThemeStore();

  const { viewMode, orientation, setViewMode, setOrientation, toggleToc } = useLayoutStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  /**
   * تغییر: input مخفی برای Insert File.
   *
   * دلیل:
   * انتخاب فایل باید از File Picker سیستم‌عامل انجام شود ولی
   * ظاهر Toolbar نباید با input خام شلوغ شود.
   */
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportAsMarkdown(markdown, fileName);
    setActiveMenu(null);
  };

  const handleInsertFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      /**
       * تغییر: فایل‌های متنی و Markdown در موقعیت Cursor وارد می‌شوند.
       *
       * دلیل:
       * Insert File باید مکمل New File و Export باشد، نه اینکه
       * محتوای فعلی سند را نابود کند.
       */
      const content = await file.text();

      const textarea = useEditorStore.getState().textareaRef;

      if (!textarea) {
        setMarkdown(`${markdown}\n\n${content}`);
        return;
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const prefix = start > 0 && markdown[start - 1] !== '\n' ? '\n\n' : '';

      const suffix = end < markdown.length && markdown[end] !== '\n' ? '\n\n' : '';

      const insertedContent = `${prefix}${content}${suffix}`;

      const nextMarkdown = markdown.slice(0, start) + insertedContent + markdown.slice(end);

      setMarkdown(nextMarkdown);

      requestAnimationFrame(() => {
        const cursorPosition = start + insertedContent.length;

        textarea.focus();
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      });
    } catch (error) {
      console.error('Unable to insert file:', error);
      window.alert('خواندن فایل امکان‌پذیر نبود.');
    } finally {
      event.target.value = '';
      setActiveMenu(null);
    }
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
              <div className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded shadow-lg py-1 z-50">
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
                  onClick={handleInsertFile}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-bg"
                >
                  درج فایل
                </button>

                <button
                  onClick={() => {
                    const name = window.prompt('نام فایل:', fileName);

                    if (name) {
                      setFileName(name);
                    }

                    setActiveMenu(null);
                  }}
                  className="w-full text-right px-4 py-2 text-sm hover:bg-bg"
                >
                  ذخیره با نام...
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
                    onChange={(event) => setFontSize(Number(event.target.value))}
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
                    onChange={(event) => setFontFamily(event.target.value)}
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

          {/* منوی Preview */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'preview' ? null : 'preview')}
              className="px-3 py-1.5 hover:bg-bg rounded text-sm font-medium transition-colors"
            >
              پیش‌نمایش
            </button>

            {activeMenu === 'preview' && (
              <div className="absolute right-0 mt-2 w-60 bg-surface border border-border rounded shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setViewMode('preview-only');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-bg ${
                    viewMode === 'preview-only' ? 'font-bold text-primary' : ''
                  }`}
                >
                  نمایش کامل پیش‌نمایش
                </button>

                <button
                  onClick={() => {
                    setViewMode('editor-only');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-bg ${
                    viewMode === 'editor-only' ? 'font-bold text-primary' : ''
                  }`}
                >
                  نمایش کامل ویرایشگر
                </button>

                <button
                  onClick={() => {
                    setViewMode('split');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-bg ${
                    viewMode === 'split' ? 'font-bold text-primary' : ''
                  }`}
                >
                  حالت پیش‌فرض (دو پنل)
                </button>

                <div className="border-t border-border my-1" />

                <button
                  onClick={() => {
                    setOrientation('horizontal');
                    setViewMode('split');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-bg ${
                    orientation === 'horizontal' ? 'font-bold text-primary' : ''
                  }`}
                >
                  چینش افقی
                </button>

                <button
                  onClick={() => {
                    setOrientation('vertical');
                    setViewMode('split');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-bg ${
                    orientation === 'vertical' ? 'font-bold text-primary' : ''
                  }`}
                >
                  چینش عمودی
                </button>
              </div>
            )}
          </div>

          {/* منوی Outline */}
          <button
            onClick={() => {
              toggleToc();
              setActiveMenu(null);
            }}
            className="px-3 py-1.5 hover:bg-bg rounded text-sm font-medium transition-colors"
          >
            فهرست سربرگ‌ها
          </button>

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
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-bg ${
                    theme === 'light' ? 'font-bold text-primary' : ''
                  }`}
                >
                  روشن (Light)
                </button>

                <button
                  onClick={() => {
                    setTheme('dark');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-bg ${
                    theme === 'dark' ? 'font-bold text-primary' : ''
                  }`}
                >
                  تاریک (Dark)
                </button>

                <button
                  onClick={() => {
                    setTheme('sepia');
                    setActiveMenu(null);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm hover:bg-bg ${
                    theme === 'sepia' ? 'font-bold text-primary' : ''
                  }`}
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

        {/* تغییر: input مخفی File Picker برای Insert File */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.mdown,.mkdn,.mkd,.txt,text/*"
          className="hidden"
          onChange={handleFileSelected}
        />
      </header>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};
