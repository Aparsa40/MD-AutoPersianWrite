import React, { useCallback, useEffect, useState } from 'react';
import { getCloudProvider } from '../../lib/cloud/providerRegistry';
import type { CloudFileEntry } from '../../types/cloud';

const googleDriveProvider = () => getCloudProvider('google-drive');

export const GoogleDriveTestPanel: React.FC = () => {
  const [files, setFiles] = useState<CloudFileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    const provider = googleDriveProvider();
    if (!provider?.listFiles) {
      setError('Google Drive Provider در دسترس نیست.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const entries = await provider.listFiles();
      setFiles(entries);
      setMessage(`${entries.length} مورد از Google Drive دریافت شد.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'دریافت فایل‌ها ناموفق بود.');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTestFile = async () => {
    const provider = googleDriveProvider();
    if (!provider?.createFile) {
      setError('عملیات ساخت فایل برای Google Drive در دسترس نیست.');
      return;
    }

    setCreating(true);
    setError(null);
    setMessage(null);
    const name = `MD-AutoPersianWrite-Test-${new Date().toISOString().replace(/[:.]/g, '-')}.md`;
    const content = `# MD-AutoPersianWrite Google Drive Test\n\nاین فایل در ${new Date().toLocaleString('fa-IR')} از داخل برنامه ساخته شد.\n`;

    try {
      const entry = await provider.createFile(name, content);
      setFiles((current) => [entry, ...current]);
      setMessage(`فایل «${entry.name}» با موفقیت در Google Drive ساخته شد.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'ساخت فایل ناموفق بود.');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  return (
    <div className="mt-2 rounded border border-border bg-bg p-2" dir="rtl">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold">تست Google Drive</div>
          <div className="text-[10px] text-text-muted">آزمایش مستقیم خواندن و ساخت فایل</div>
        </div>
        <button
          type="button"
          onClick={() => void loadFiles()}
          disabled={loading || creating}
          className="rounded border border-border px-2 py-1 text-[10px] hover:bg-surface disabled:opacity-50"
        >
          {loading ? 'در حال دریافت...' : '↻ بروزرسانی'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => void createTestFile()}
        disabled={loading || creating}
        className="mb-2 w-full rounded border border-border px-2 py-2 text-xs font-medium hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
      >
        {creating ? 'در حال ساخت فایل...' : '📄 ساخت فایل تست در Google Drive'}
      </button>

      {message && <div className="mb-2 rounded border border-border px-2 py-1 text-[10px] text-text-muted">{message}</div>}
      {error && <div className="mb-2 rounded border border-red-300 px-2 py-1 text-[10px] text-red-600">{error}</div>}

      <div className="max-h-48 overflow-y-auto rounded border border-border bg-surface">
        {files.length === 0 && !loading ? (
          <div className="px-2 py-4 text-center text-[10px] text-text-muted">فایلی برای نمایش پیدا نشد.</div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center gap-2 border-b border-border px-2 py-1.5 last:border-b-0">
              <span aria-hidden="true">{file.isFolder ? '📁' : '📄'}</span>
              <span className="min-w-0 flex-1 truncate text-[10px]" title={file.name}>{file.name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
