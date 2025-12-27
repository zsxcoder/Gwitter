/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GITHUB_TOKEN?: string;
  readonly GITHUB_CLIENT_ID?: string;
  readonly GITHUB_CLIENT_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
