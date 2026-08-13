import { useRef, useEffect, useCallback } from 'react';

/**
 * پیدا کردن شماره خط Markdown در موقعیت فعلی Cursor.
 *
 * این تابع فقط برای Navigation ناشی از کلیک/حرکت Cursor استفاده می‌شود
 * و نباید مبنای Scroll Sync معمولی باشد.
 */
const getCurrentEditorLine = (textarea: HTMLTextAreaElement): number => {
  const beforeCursor = textarea.value.slice(0, textarea.selectionStart);

  return beforeCursor.split('\n').length;
};

/**
 * پیدا کردن نزدیک‌ترین عنصر Preview نسبت به یک خط Markdown.
 *
 * Preview توسط PreviewPane روی عناصر Markdown دارای data-source-line است.
 */
const findPreviewLineElement = (preview: HTMLElement, targetLine: number): HTMLElement | null => {
  const elements = Array.from(preview.querySelectorAll<HTMLElement>('[data-source-line]'));

  if (elements.length === 0) {
    return null;
  }

  let closest: HTMLElement | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const element of elements) {
    const line = Number(element.dataset.sourceLine);

    if (!Number.isFinite(line)) {
      continue;
    }

    const distance = Math.abs(line - targetLine);

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = element;
    }
  }

  return closest;
};

/**
 * پیدا کردن نزدیک‌ترین عنصر Preview به بالای ناحیه قابل مشاهده.
 *
 * این تابع برای حرکت Preview → Editor استفاده می‌شود.
 */
const getPreviewSourceLine = (preview: HTMLElement): number | null => {
  const elements = Array.from(preview.querySelectorAll<HTMLElement>('[data-source-line]'));

  if (elements.length === 0) {
    return null;
  }

  const previewRect = preview.getBoundingClientRect();

  let bestElement: HTMLElement | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const element of elements) {
    const rect = element.getBoundingClientRect();

    /**
     * فقط عناصری که در محدوده قابل مشاهده یا کمی بالاتر از آن هستند
     * برای تعیین نقطه فعلی Preview بررسی می‌شوند.
     */
    if (rect.bottom < previewRect.top) {
      continue;
    }

    const distance = Math.abs(rect.top - previewRect.top);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestElement = element;
    }
  }

  if (!bestElement) {
    return null;
  }

  const line = Number(bestElement.dataset.sourceLine);

  return Number.isFinite(line) ? line : null;
};

/**
 * تبدیل شماره خط Markdown به موقعیت کاراکتر در textarea.
 *
 * این مقدار برای قرار دادن Cursor در خط متناظر Preview استفاده می‌شود.
 */
const getEditorPositionForLine = (textarea: HTMLTextAreaElement, line: number): number => {
  const lines = textarea.value.split('\n');

  const safeLine = Math.min(Math.max(line - 1, 0), Math.max(lines.length - 1, 0));

  if (safeLine === 0) {
    return 0;
  }

  return lines.slice(0, safeLine).join('\n').length + 1;
};

/**
 * محاسبه نسبت Scroll در Editor.
 *
 * این مقدار برای Scroll معمولی Editor → Preview استفاده می‌شود.
 *
 * دلیل:
 * textarea یک عنصر متنی واحد است و مانند Preview برای هر خط یک
 * HTMLElement مستقل ندارد. بنابراین در Scroll معمولی، نسبت Scroll
 * مطمئن‌ترین fallback برای حفظ موقعیت کلی سند است.
 */
const getScrollRatio = (element: HTMLElement): number => {
  const maxScroll = element.scrollHeight - element.clientHeight;

  if (maxScroll <= 0) {
    return 0;
  }

  return Math.min(Math.max(element.scrollTop / maxScroll, 0), 1);
};

/**
 * تنظیم Scroll بر اساس نسبت.
 */
const setScrollRatio = (element: HTMLElement, ratio: number): void => {
  const maxScroll = element.scrollHeight - element.clientHeight;

  if (maxScroll <= 0) {
    element.scrollTop = 0;
    return;
  }

  element.scrollTop = Math.min(Math.max(ratio, 0), 1) * maxScroll;
};

/**
 * هوک همگام‌سازی دوطرفه Editor و Preview.
 *
 * تغییرات اصلی این نسخه:
 *
 * 1. کلیک در Editor:
 *    Cursor line پیدا می‌شود و Preview دقیقاً به عنصر متناظر
 *    data-source-line منتقل می‌شود.
 *
 * 2. Scroll معمولی Editor:
 *    دیگر از Cursor line استفاده نمی‌شود.
 *    Preview بر اساس نسبت Scroll جابه‌جا می‌شود.
 *
 * 3. Scroll Preview:
 *    نزدیک‌ترین عنصر Markdown به بالای Preview پیدا شده و
 *    Editor به خط متناظر منتقل می‌شود.
 *
 * 4. جلوگیری از Loop:
 *    هنگام Sync برنامه‌ای، event طرف مقابل نادیده گرفته می‌شود.
 *
 * 5. انتخاب Cursor در Preview → Editor:
 *    Cursor فقط زمانی جابه‌جا می‌شود که Preview واقعاً به خط جدیدی
 *    منتقل شده باشد.
 */
export function useScrollSync() {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  /**
   * مشخص می‌کند که Scroll فعلی توسط خود برنامه ایجاد شده است.
   *
   * دلیل:
   * اگر Editor را برنامه‌ای Scroll کنیم، Preview نباید دوباره
   * Editor را Scroll کند و همین‌طور برعکس.
   */
  const syncingFromEditor = useRef(false);
  const syncingFromPreview = useRef(false);

  /**
   * تغییر: Editor → Preview برای کلیک/Cursor.
   *
   * این تابع فقط زمانی استفاده می‌شود که کاربر روی Editor کلیک کرده
   * یا Cursor خود را جابه‌جا کرده است.
   */
  const syncEditorCursorToPreview = useCallback(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;

    if (!editor || !preview) {
      return;
    }

    const currentLine = getCurrentEditorLine(editor);

    const target = findPreviewLineElement(preview, currentLine);

    if (!target) {
      return;
    }

    const previewRect = preview.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    /**
     * تغییر: عنصر متناظر به بالای ناحیه Preview منتقل می‌شود.
     *
     * دلیل:
     * کاربر بعد از کلیک روی Editor باید همان بخش متن را در Preview
     * بلافاصله مشاهده کند، نه اینکه فقط درصد Scroll تغییر کند.
     */
    syncingFromEditor.current = true;

    preview.scrollTop += targetRect.top - previewRect.top;

    requestAnimationFrame(() => {
      syncingFromEditor.current = false;
    });
  }, []);

  /**
   * تغییر: Editor → Preview برای Scroll معمولی.
   *
   * دلیل:
   * وقتی کاربر فقط Scroll می‌کند، Cursor ممکن است همچنان روی یک خط
   * قدیمی باقی مانده باشد. استفاده از Cursor در این حالت باعث می‌شد
   * Preview دوباره به خط Cursor برگردد.
   *
   * بنابراین Scroll معمولی از نسبت Scroll دو پنل استفاده می‌کند.
   */
  const syncEditorScrollToPreview = useCallback(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;

    if (!editor || !preview) {
      return;
    }

    const ratio = getScrollRatio(editor);

    syncingFromEditor.current = true;

    setScrollRatio(preview, ratio);

    requestAnimationFrame(() => {
      syncingFromEditor.current = false;
    });
  }, []);

  /**
   * تغییر: Preview → Editor.
   *
   * نزدیک‌ترین عنصر Markdown به بالای Preview پیدا می‌شود.
   * سپس Editor به همان خط منتقل می‌شود.
   */
  const syncPreviewToEditor = useCallback(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;

    if (!editor || !preview) {
      return;
    }

    const sourceLine = getPreviewSourceLine(preview);

    if (sourceLine !== null) {
      const targetPosition = getEditorPositionForLine(editor, sourceLine);

      /**
       * تغییر: نسبت Scroll بر اساس خط متناظر محاسبه می‌شود.
       *
       * دلیل:
       * ارتفاع HTML Preview با textarea الزاماً برابر نیست.
       * بنابراین صرفاً برابر کردن scrollTop دقیق نیست.
       */
      const totalLines = Math.max(editor.value.split('\n').length, 1);

      const lineIndex = Math.max(sourceLine - 1, 0);

      const lineRatio = totalLines > 1 ? lineIndex / (totalLines - 1) : 0;

      syncingFromPreview.current = true;

      setScrollRatio(editor, lineRatio);

      /**
       * تغییر: Cursor به خط متناظر منتقل می‌شود.
       *
       * دلیل:
       * وقتی کاربر Preview را جابه‌جا می‌کند، Editor نیز باید
       * موقعیت متناظر را مشخص کند تا ارتباط دو پنل برای کاربر واضح باشد.
       */
      editor.setSelectionRange(targetPosition, targetPosition);

      requestAnimationFrame(() => {
        syncingFromPreview.current = false;
      });

      return;
    }

    /**
     * Fallback:
     * اگر Preview هیچ data-source-line قابل استفاده‌ای نداشت،
     * نسبت Scroll دو پنل استفاده می‌شود.
     */
    const ratio = getScrollRatio(preview);

    syncingFromPreview.current = true;

    setScrollRatio(editor, ratio);

    requestAnimationFrame(() => {
      syncingFromPreview.current = false;
    });
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    const preview = previewRef.current;

    if (!editor || !preview) {
      return;
    }

    /**
     * تغییر: Scroll Editor فقط با Scroll نسبت داده می‌شود.
     *
     * قبلاً این event از Cursor line استفاده می‌کرد که باعث می‌شد
     * هنگام Scroll کردن Editor، Preview به موقعیت Cursor برگردد.
     */
    const handleEditorScroll = () => {
      if (syncingFromPreview.current) {
        return;
      }

      syncEditorScrollToPreview();
    };

    /**
     * تغییر: Scroll Preview بر اساس source line به Editor منتقل می‌شود.
     */
    const handlePreviewScroll = () => {
      if (syncingFromEditor.current) {
        return;
      }

      syncPreviewToEditor();
    };

    /**
     * تغییر: کلیک در Editor به‌صورت مستقل از Scroll پردازش می‌شود.
     *
     * دلیل:
     * درخواست اصلی کاربر این است که با کلیک در هر قسمت Editor،
     * Preview دقیقاً به همان قسمت منتقل شود.
     */
    const handleEditorClick = () => {
      syncEditorCursorToPreview();
    };

    /**
     * تغییر: حرکت Cursor با Keyboard نیز Preview را دنبال می‌کند.
     *
     * مثال:
     * کاربر با Arrow Down یا Page Navigation حرکت می‌کند.
     */
    const handleEditorKeyUp = () => {
      syncEditorCursorToPreview();
    };

    editor.addEventListener('scroll', handleEditorScroll, { passive: true });

    preview.addEventListener('scroll', handlePreviewScroll, { passive: true });

    editor.addEventListener('click', handleEditorClick);

    editor.addEventListener('keyup', handleEditorKeyUp);

    return () => {
      editor.removeEventListener('scroll', handleEditorScroll);

      preview.removeEventListener('scroll', handlePreviewScroll);

      editor.removeEventListener('click', handleEditorClick);

      editor.removeEventListener('keyup', handleEditorKeyUp);
    };
  }, [syncEditorCursorToPreview, syncEditorScrollToPreview, syncPreviewToEditor]);

  return {
    editorRef,
    previewRef,
    syncEditorCursorToPreview,
    syncEditorScrollToPreview,
    syncPreviewToEditor,
  };
}
