import React from 'react';
import { MainLayout } from './components/layout/MainLayout';

/**
 * تغییر: App به MainLayout متصل شد.
 *
 * دلیل:
 * تمام قابلیت‌های جدید Layout، ScrollSync، Resize، TOC و حالت‌های
 * نمایش باید از یک نقطه مرکزی مدیریت شوند.
 */
const App: React.FC = () => {
  return <MainLayout />;
};

export default App;
