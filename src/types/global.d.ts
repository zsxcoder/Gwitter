export interface GwitterConfig {
  request?: {
    token?: string;
    clientID?: string;
    clientSecret?: string;
    pageSize?: number;
    autoProxy?: string;
    owner?: string;
    repo?: string;
  };
  app?: {
    onlyShowOwner?: boolean;
    enableRepoSwitcher?: boolean;
    enableAbout?: boolean;
    enableEgg?: boolean;
  };
}

export interface GwitterOptions {
  container?: HTMLElement;
  config?: GwitterConfig;
}

declare global {
  interface Window {
    gwitter?: (options?: GwitterOptions) => void;
  }

  interface ImportMetaEnv {
    readonly VITE_GITHUB_TOKEN: string;
    readonly VITE_GITHUB_CLIENT_ID: string;
    readonly VITE_GITHUB_CLIENT_SECRET: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}