/// <reference types="vite/client" />

interface ImportMetaEnv {
    VITE_ENCRYPTION_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  