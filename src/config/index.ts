import { GwitterConfig } from '../types/global';

// 动态读取环境变量
const getEnv = () => ({
  GITHUB_TOKEN: (import.meta.env as any).GITHUB_TOKEN || '',
  GITHUB_CLIENT_ID: (import.meta.env as any).GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: (import.meta.env as any).GITHUB_CLIENT_SECRET || '',
});

let config = {
  request: {
    get token() {
      return getEnv().GITHUB_TOKEN;
    },
    get clientID() {
      return getEnv().GITHUB_CLIENT_ID;
    },
    get clientSecret() {
      return getEnv().GITHUB_CLIENT_SECRET;
    },
    pageSize: 6,
    autoProxy:
      'https://cors-anywhere.azm.workers.dev/https://github.com/login/oauth/access_token',
    owner: 'zsxcoder',
    repo: 'weibo',
  },

  app: {
    onlyShowOwner: true,
    enableRepoSwitcher: true,
    enableAbout: false,
    enableEgg: false,
  },
};

export function setConfig(newConfig: GwitterConfig) {
  if (newConfig.request) {
    config.request = {
      ...config.request,
      ...newConfig.request,
    };
  }

  if (newConfig.app) {
    config.app = {
      ...config.app,
      ...newConfig.app,
    };
  }
}

export default config;
