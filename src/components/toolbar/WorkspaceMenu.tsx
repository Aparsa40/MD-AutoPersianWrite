import React, { useState } from 'react';
import { createLocalWorkspace, openLocalWorkspace } from '../../lib/workspace/localWorkspace';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

export const WorkspaceMenu: React.FC = () => {
  const { activeWorkspace, setActiveWorkspace } = useWorkspaceStore();
  const [activeSubmenu, setActiveSubmenu] = useState<'create' | 'open' | null>(null);

  const handleCreateLocalWorkspace = async () => {
    const name = window.prompt('نام محیط کاری را وارد کنید:');
    if (!name?.trim()) return;

    try {
      const workspace = await createLocalWorkspace(name);
      setActiveWorkspace(workspace);
      setActiveSubmenu(null);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.alert(error instanceof Error ? error.message : 'ساخت Workspace انجام نشد.');
    }
  };

  const handleOpenLocalWorkspace = async () => {
    try {
      const workspace = await openLocalWorkspace();
      setActiveWorkspace(workspace);
      setActiveSubmenu(null);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.alert(error instanceof Error ? error.message : 'باز کردن Workspace انجام نشد.');
    }
  };

  const toggleSubmenu = (submenu: 'create' | 'open') => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setActiveSubmenu(null)}
        className="rounded px-3 py-1.5 text-sm font-medium hover:bg-bg"
      >
        Workspace
      </button>

      <div className="absolute right-0 mt-2 w-64 rounded border border-border bg-surface py-1 shadow-lg">
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleSubmenu('create')}
            className="w-full px-4 py-2 text-right text-sm hover:bg-bg"
          >
            ساخت محیط کاری (Create Workspace)
          </button>
          {activeSubmenu === 'create' && (
            <div className="absolute right-full top-0 mr-1 w-52 rounded border border-border bg-surface py-1 shadow-lg">
              <button
                type="button"
                onClick={handleCreateLocalWorkspace}
                className="w-full px-4 py-2 text-right text-sm hover:bg-bg"
              >
                سیستم محلی (Local)
              </button>
              <button
                type="button"
                onClick={() => window.alert('اتصال Cloud در مرحله بعدی پیاده‌سازی می‌شود.')}
                className="w-full px-4 py-2 text-right text-sm hover:bg-bg"
              >
                فضای ابری (Cloud)
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => toggleSubmenu('open')}
            className="w-full px-4 py-2 text-right text-sm hover:bg-bg"
          >
            باز کردن محیط کاری (Open Workspace)
          </button>
          {activeSubmenu === 'open' && (
            <div className="absolute right-full top-0 mr-1 w-52 rounded border border-border bg-surface py-1 shadow-lg">
              <button
                type="button"
                onClick={handleOpenLocalWorkspace}
                className="w-full px-4 py-2 text-right text-sm hover:bg-bg"
              >
                سیستم محلی (Local)
              </button>
              <button
                type="button"
                onClick={() => window.alert('اتصال Cloud در مرحله بعدی پیاده‌سازی می‌شود.')}
                className="w-full px-4 py-2 text-right text-sm hover:bg-bg"
              >
                فضای ابری (Cloud)
              </button>
            </div>
          )}
        </div>

        {activeWorkspace && (
          <>
            <div className="my-1 border-t border-border" />
            <div className="px-4 py-2 text-xs text-text-muted">
              محیط فعال: <span className="font-medium text-text">{activeWorkspace.name}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
