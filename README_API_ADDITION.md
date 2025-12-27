# Gwitter
|
|[中文版本](README.zh_CN.md)
|
|## 🎮 Playground
|
|- **🌐 Live Demo**: [https://simonaking.com/Gwitter](https://simonaking.com/Gwitter) - Experience Gwitter in action
|- **💭 Share Your Thoughts**: [Create an Issue](https://github.com/SimonAKing/Gwitter/issues) to join the conversation
|- **📚 Browse Discussions**: Explore existing thoughts and insights on the demo site
|
|## ✨ Project Introduction
|
|✨ **The Story Behind "Gwitter"**
|
|Ever wondered what happens when you combine the world's most powerful issue tracker with the globe's favorite microblogging platform? 🤔
|
|**GitHub Issues** 📝 = The unsung hero of note-taking (seriously, it's brilliant!)
|
|**Twitter** 🐦 = Where thoughts become conversations worldwide
|
|**Gwitter** 🚀 = Turn GitHub Issues into your personal microblog platform!
|
|![preview](https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGwyY3F1anhjbDIwMDFoYW9sMGZqdGN2bnJpamM2bXQ5M3E5ZTY5NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/J43gtVHbTeNHMIepID/giphy.gif)
|> **📱 Author's Gwitter**: [https://simonaking.com/blog/weibo/](https://simonaking.com/blog/weibo/) - See how Gwitter is used in practice
|
|Gwitter is a lightweight microblogging application built on GitHub Issues. It records my thoughts on technology, life insights, and interesting discoveries. Welcome to join the discussion!
|
|## 🚀 Key Features
|
|1. 📝 GitHub Issues Based
|   - Utilizes GitHub Issues as content storage, supporting GitHub's label system for content categorization
|2. 👍 Social Interaction
|   - Like Feature: Supports GitHub Reactions (👍 ❤️ 😄 😮 😢 😡 🚀 👀)
|   - Comment System: Complete commenting functionality with nested replies support
|3. ✨ Visual Experience
|   - Beautiful Animations: Smooth page animations using Framer Motion
|   - Responsive Design: Perfect adaptation for desktop, tablet, and mobile devices
|   - Skeleton Screen: Elegant loading state display
|4. 🌐 User Experience
|   - Internationalization Support: Built-in Chinese and English bilingual support
|   - Infinite Scroll: Smart pagination loading for smooth browsing experience
|5. 🤖 Automated Synchronization
|   - Multi-platform Sync: Automatically sync newly published Issues to other platforms via GitHub Actions
|
|## 📝 Usage Instructions
|
|### Publishing Content
|
|1. Create a new Issue in the configured GitHub repository
|2. Write content using Markdown format
|3. Add appropriate labels for categorization
|4. Content will automatically sync to gwitter application after publishing
|
|<img src="./docs/issue.png" alt="Create issue example" width="500">
|
|### Content Management
|
|- **Edit**: Edit directly in GitHub Issues
|- **Delete**: Close corresponding Issue
|- **Categorize**: Use GitHub Labels for content categorization
|- **Pin**: Control display order through Issue creation sequence
|
|### 🤖 Automated Synchronization Configuration
|
|Gwitter supports automatically syncing newly published Issues to Telegram and GitHub Gist via GitHub Actions.
|
|1. **Create Sync Script**
|   - Refer to [sync.js](https://github.com/SimonAKing/weibo/blob/master/sync.js) implementation
|   - Create `.github/workflows/sync.yml` in the repository
|
|2. **Configure Environment Variables**
|   In GitHub repository Settings > Secrets and variables
|
|3. **Telegram Configuration**
|   - Create Telegram Bot (via @BotFather)
|   - Get Bot Token and target channel/group Chat ID
|   - Add Bot to target channel and grant admin permissions
|
|## 🔌 API Interface

独立 API 接口，使用环境变量直接从 GitHub 获取 Issues 数据，不受前端限制。

### 快速开始

```bash
# 1. 查看部署文档
cat API_DEPLOYMENT.md

# 2. 选择部署平台（Cloudflare Workers / Vercel / 腾讯云 CloudBase）
```

### API 端点

| 端点 | 说明 |
|--------|------|
| `/api/issues.json` | GitHub Issues API |

### 查询参数

| 参数 | 必填 | 说明 |
|------|--------|------|
| `format=json` | 否 | 返回 JSON 格式 |
| `owner` | ✅ 是 | GitHub 用户名或组织名 |
| `repo` | ✅ 是 | GitHub 仓库名称 |
| `perPage` | 否 | 每页数量（1-100，默认 20） |
| `page` | 否 | 页码（默认 1） |

### 使用示例

```javascript
// 获取 Issues
fetch('https://your-domain.com/api/issues.json?format=json&owner=facebook&repo=react')
  .then(response => response.json())
  .then(data => {
    console.log('Issues:', data.issues);
    console.log('Total:', data.totalIssues);
  });
```

### 详细文档

查看 [API_DEPLOYMENT.md](./API_DEPLOYMENT.md) 获取：
- 完整的部署说明
- 响应格式详解
- 多语言使用示例
- 故障排查指南

### 特点

- ✅ 使用环境变量 `GITHUB_TOKEN` 认证
- ✅ 直接调用 GitHub GraphQL API
- ✅ 支持分页和自定义每页数量
- ✅ 完整的 CORS 支持
- ✅ 高速率限制（5000 次/小时）

## 🛠️ Tech Stack
|
|- **Frontend Framework**: React 18 + TypeScript
|- **Build Tool**: Rsbuild (Fast build tool based on Rspack)
|- **Styling Solution**: Emotion (CSS-in-JS)
|- **Animation Library**: Framer Motion + React Flip Move
|- **State Management**: React Hooks
|- **Network Requests**: Axios + GitHub GraphQL API
|- **Internationalization**: i18next
|- **Code Standards**: ESLint + Prettier
|
```
