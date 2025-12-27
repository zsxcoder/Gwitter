import { GwitterConfig } from '../types/global';

const { GITHUB_TOKEN = '', GITHUB_CLIENT_ID = '', GITHUB_CLIENT_SECRET = '' } = import.meta.env || {};

let config = {
  request: {
    token: GITHUB_TOKEN,
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
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
