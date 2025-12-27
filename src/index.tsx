import gwitter from './gwitter';
import './i18n';

// 调试：检查环境变量
console.log('GITHUB_TOKEN:', import.meta.env.GITHUB_TOKEN);
console.log('GITHUB_CLIENT_ID:', import.meta.env.GITHUB_CLIENT_ID);

gwitter();
