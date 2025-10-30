/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_EMAIL_AUTH: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
