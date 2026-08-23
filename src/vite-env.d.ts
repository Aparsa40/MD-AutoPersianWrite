/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_DRIVE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
