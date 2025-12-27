import { GwitterConfig } from '../types/global';

const { VITE_GITHUB_TOKEN = '', VITE_GITHUB_CLIENT_ID = '', VITE_GITHUB_CLIENT_SECRET = '' } = import.meta.env || {};

let config = {
  request: {
    token: VITE_GITHUB_TOKEN,
    clientID: VITE_GITHUB_CLIENT_ID,
    clientSecret: VITE_GITHUB_CLIENT_SECRET,
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
