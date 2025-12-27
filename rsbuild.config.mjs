import { defineConfig } from '@rsbuild/core';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginReact } from '@rsbuild/plugin-react';

// 加载 .env 文件
const envPath = resolve(process.cwd(), '.env');
dotenvConfig({ path: envPath });

export default defineConfig({
  html: {
    template: './public/index.html',
  },
  source: {
    define: {
      'import.meta.env.GITHUB_TOKEN': JSON.stringify(process.env.GITHUB_TOKEN || ''),
      'import.meta.env.GITHUB_CLIENT_ID': JSON.stringify(process.env.GITHUB_CLIENT_ID || ''),
      'import.meta.env.GITHUB_CLIENT_SECRET': JSON.stringify(process.env.GITHUB_CLIENT_SECRET || ''),
    },
  },
  plugins: [pluginReact(), pluginLess()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.jsx$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'ecmascript',
                jsx: true,
              },
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        test: /\.tsx$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
            },
          },
        },
        type: 'javascript/auto',
      },
    ],
  },
  output: {
    assetPrefix: '/',
  },
  tools: {
    eslint: {
      enable: true,
      config: {
        env: {
          node: true,
        },
      },
    },
  },
});