import React, { useState } from 'react';
import { cloudProviderDefinitions } from '../../lib/cloud/providerRegistry';
import { useCloudStore } from '../../store/useCloudStore';
import type { CloudProviderId } from '../../types/cloud';

const GoogleDriveIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-7 w-7">
    <path fill="#0F9D58" d="M17.4 5h13.2L44 29H30.8z" />
    <path fill="#F4B400" d="M17.4 5 4 29h13.1l13.5-24z" />
    <path fill="#4285F4" d="M4 29h13.1l6.8 12H10.8zM30.8 29H44l-6.7 12H24z" />
  </svg>
);

const ProviderIcon: React.FC<{ id: CloudProviderId; fallback: string }> = ({ id, fallback }) =>
  id === 'google-drive' ? <GoogleDriveIcon /> : <span className="flex h-7 w-7 items-center justify-center text-xl">{fallback}</span>;

export const CloudMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProviders, setShowProviders] = useState(false);
  const [busyProvider, setBusyProvider] = useState<CloudProviderId | null>(null);
  const connections = useCloudStore((state) => state.connections);
  const connect = useCloudStore((state) => state.connect);
  const disconnect = useCloudStore((state) => state.disconnect);
  const openProvider = useCloudStore((state) => state.openProvider);

  const handleConnect = async (providerId: CloudProviderId) => {
    setBusyProvider(providerId);
    try {
      await connect(providerId);
      setShowProviders(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      window.alert(error instanceof Error ? error.message : 'اتصال به فضای ابری انجام نشد.');
    } finally {
      setBusyProvider(null);
    }
  };

  const handleDisconnect = async (providerId: CloudProviderId) => {
    setBusyProvider(providerId);
    try {
      await disconnect(providerId);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'قطع اتصال انجام نشد.');
    } finally {
      setBusyProvider(null);
    }
  };

  const connected = cloudProviderDefinitions.filter((provider) => connections[provider.id]?.status === 'connected');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setIsOpen((value) => !value); setShowProviders(false); }}
        className="w-full px-4 py-2 text-right text-sm hover:bg-bg"
      >
        ☁️ فضای ابری (Cloud)
      </button>

      {isOpen && (
        <div className="absolute right-full top-0 mr-1 w-[23rem] rounded border border-border bg-surface p-2 shadow-lg" dir="rtl">
          <div className="flex items-center justify-between border-b border-border px-2 pb-2">
            <div>
              <div className="text-sm font-semibold">فضاهای ابری</div>
              <div className="text-[11px] text-text-muted">مدیریت اتصال و باز کردن محیط رسمی سرویس‌دهنده</div>
            </div>
            <button type="button" onClick={() => setShowProviders((value) => !value)} className="rounded border border-border px-2 py-1 text-xs font-medium hover:bg-bg">
              + اتصال
            </button>
          </div>

          {showProviders && (
            <div className="my-2 rounded border border-border bg-bg p-1">
              <div className="px-2 py-1 text-[11px] text-text-muted">انتخاب فضای ابری</div>
              {cloudProviderDefinitions.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  disabled={!provider.available || busyProvider !== null}
                  onClick={() => void handleConnect(provider.id)}
                  className="flex w-full items-center gap-2 rounded px-2 py-2 text-right hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ProviderIcon id={provider.id} fallback={provider.icon} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{provider.name}</span>
                    <span className="block truncate text-[10px] text-text-muted">{provider.available ? 'آماده استفاده' : 'به‌زودی'}</span>
                  </span>
                  {busyProvider === provider.id && <span className="text-xs text-text-muted">در حال اتصال...</span>}
                </button>
              ))}
              <div className="px-2 pb-1 pt-2 text-[10px] leading-5 text-text-muted">
                ورود به حساب، احراز هویت و مدیریت فایل‌ها در محیط رسمی هر سرویس‌دهنده انجام می‌شود.
              </div>
            </div>
          )}

          {connected.length === 0 && !showProviders && (
            <div className="px-2 py-4 text-center text-xs text-text-muted">هنوز هیچ فضای ابری متصل نشده است.</div>
          )}

          <div className="space-y-1">
            {connected.map((provider) => (
              <div key={provider.id} className="rounded border border-border px-2 py-2">
                <div className="flex items-center gap-2">
                  <ProviderIcon id={provider.id} fallback={provider.icon} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{provider.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-green-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> متصل و فعال
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openProvider(provider.id)}
                    disabled={busyProvider !== null}
                    className="rounded border border-border px-2 py-1 text-xs font-medium hover:bg-bg disabled:opacity-50"
                  >
                    Open {provider.name === 'Google Drive' ? 'Drive' : provider.name}
                  </button>
                  <button
                    type="button"
                    disabled={busyProvider !== null}
                    onClick={() => void handleDisconnect(provider.id)}
                    className="rounded px-2 py-1 text-xs text-red-600 hover:bg-bg disabled:opacity-50"
                  >
                    قطع اتصال
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
