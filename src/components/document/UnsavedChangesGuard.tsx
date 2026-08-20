import React from 'react';

/**
 * The previous in-app unsaved-changes banner was intentionally removed.
 * Browser-level beforeunload protection is handled by MainLayout instead.
 * This component remains as a compatibility no-op so older imports do not
 * unexpectedly introduce a full-width notification into the application.
 */
export const UnsavedChangesGuard: React.FC = () => null;
