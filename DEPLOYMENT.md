# 部署指南

## Vercel 部署

### 1. 配置环境变量

在 Vercel 控制台添加环境变量：

1. 访问 https://vercel.com/dashboard
2. 进入你的项目
3. 点击 **Settings** → **Environment Variables**
4. 添加以下三个变量：

```
GITHUB_TOKEN=ghp_你的token
GITHUB_CLIENT_ID=你的client_id
GITHUB_CLIENT_SECRET=你的client_secret
```

5. 选择 **Production**, **Preview**, **Development** 三个环境都勾选
6. 点击 **Save**

### 2. 重新部署

在项目页面点击 **Deployments**，找到最新的部署，点击 **Redeploy**

---

## 本地开发

确保项目根目录有 `.env` 文件：

```
VITE_GITHUB_TOKEN=ghp_你的token
VITE_GITHUB_CLIENT_ID=你的client_id
VITE_GITHUB_CLIENT_SECRET=你的client_secret
```

运行：
```bash
pnpm run dev
```

---

## GitHub Token 权限

确保 Token 包含以下权限：
- ✅ `repo` (完整仓库访问)
- ✅ `read:user` (读取用户信息)

生成地址：https://github.com/settings/tokens
