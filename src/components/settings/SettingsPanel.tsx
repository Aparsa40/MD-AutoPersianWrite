import React from 'react';

export const SettingsPanel: React.FC = () => {
  return (
    <div className="p-4 bg-surface rounded border border-border">
      <h3 className="text-sm font-bold mb-2">تنظیمات ویرایشگر</h3>
      <p className="text-xs text-text-muted">
        تنظیمات اصلی از طریق نوار ابزار بالا قابل دسترس است.
      </p>
    </div>
  );
};
