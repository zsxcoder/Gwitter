import gwitter from './gwitter';
import './i18n';

// 调试：检查环境变量
console.log('VITE_GITHUB_TOKEN:', import.meta.env.VITE_GITHUB_TOKEN);
console.log('VITE_GITHUB_CLIENT_ID:', import.meta.env.VITE_GITHUB_CLIENT_ID);

gwitter();
