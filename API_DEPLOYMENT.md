# GitHub Issues API 部署说明

独立 API 接口，使用环境变量直接从 GitHub 获取 Issues 数据。

## 功能特点

- ✅ 使用环境变量中的 `GITHUB_TOKEN` 进行认证
- ✅ 不依赖前端数据，独立获取 GitHub Issues
- ✅ 支持分页（`page` 和 `perPage` 参数）
- ✅ 完整的 CORS 支持
- ✅ 返回标准的 JSON 格式
- ✅ 高速率限制（5000 次/小时）

## 环境变量

| 变量名 | 必填 | 说明 |
|---------|--------|------|
| `GITHUB_TOKEN` | ✅ 是 | GitHub Personal Access Token（推荐）或 OAuth Token |
| `GITHUB_CLIENT_ID` | ❌ 否 | GitHub OAuth App Client ID（用于 OAuth 流程，可选） |
| `GITHUB_CLIENT_SECRET` | ❌ 否 | GitHub OAuth App Client Secret（可选） |

### 获取 GITHUB_TOKEN

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" (classic)
3. 勾选 `public_repo` 权限
4. 点击生成
5. 复制 token

## API 端点

### 基础端点

```
GET /api/issues.json
```

### 查询参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|--------|------|
| `format` | string | 否 | 设置为 `json` 返回 JSON 数据 |
| `owner` | string | ✅ 是 | GitHub 用户名或组织名 |
| `repo` | string | ✅ 是 | GitHub 仓库名称 |
| `perPage` | number | 否 | 每页数量（1-100，默认 20） |
| `page` | number | 否 | 页码（默认 1） |

### 请求示例

```bash
# 获取指定仓库的 Issues（返回 JSON）
curl "https://your-domain.com/api/issues.json?format=json&owner=facebook&repo=react"

# 分页获取（第 2 页，每页 10 条）
curl "https://your-domain.com/api/issues.json?format=json&owner=facebook&repo=react&page=2&perPage=10"
```

## 响应格式

### 成功响应（200 OK）

```json
{
  "repository": "owner/repo",
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "totalIssues": 10,
  "hasMore": true,
  "currentPage": 1,
  "perPage": 20,
  "issues": [
    {
      "id": "issue_id",
      "number": 1,
      "title": "Issue 标题",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "login": "username",
        "avatarUrl": "https://avatars.githubusercontent.com/...",
        "url": "https://github.com/..."
      },
      "reactions": {
        "totalCount": 5,
        "userReacted": true,
        "heartCount": 5
      },
      "comments": 3,
      "label": {
        "name": "label_name",
        "color": "#ffffff"
      },
      "url": "https://github.com/..."
    }
  ]
}
```

### 错误响应

```json
{
  "error": "Failed to fetch issues",
  "message": "Repository not found",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 使用示例

### JavaScript (Fetch API)

```javascript
// 获取 Issues
fetch('https://your-domain.com/api/issues.json?format=json&owner=facebook&repo=react')
  .then(response => response.json())
  .then(data => {
    console.log('Issues:', data);
    console.log(`Total: ${data.totalIssues}`);
    console.log(`Has more: ${data.hasMore}`);
    
    // 处理每个 issue
    data.issues.forEach(issue => {
      console.log(`${issue.number}: ${issue.title}`);
    });
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### JavaScript (async/await)

```javascript
async function getIssues() {
  const response = await fetch(
    'https://your-domain.com/api/issues.json?format=json&owner=facebook&repo=react'
  );
  const data = await response.json();
  
  console.log('Repository:', data.repository);
  console.log('Total Issues:', data.totalIssues);
  console.log('Issues:', data.issues);
  
  return data;
}

// 使用
getIssues().then(data => {
  // 处理数据
});
```

### TypeScript

```typescript
interface GwitterIssue {
  id: string;
  number: number;
  title: string;
  createdAt: string;
  author: {
    login: string;
    avatarUrl: string;
    url: string;
  };
  reactions: {
    totalCount: number;
    userReacted: boolean;
    heartCount: number;
  };
  comments: number;
  label: {
    name: string;
    color: string;
  };
  url: string;
}

interface GwitterResponse {
  repository: string;
  exportedAt: string;
  totalIssues: number;
  hasMore: boolean;
  currentPage: number;
  perPage: number;
  issues: GwitterIssue[];
}

async function getIssues(
  owner: string,
  repo: string,
  page = 1,
  perPage = 20
): Promise<GwitterResponse> {
  const response = await fetch(
    `https://your-domain.com/api/issues.json?format=json&owner=${owner}&repo=${repo}&page=${page}&perPage=${perPage}`
  );
  return await response.json() as GwitterResponse;
}

// 使用
const data = await getIssues('facebook', 'react');
console.log(`Loaded ${data.totalIssues} issues from page ${data.currentPage}`);
```

### React Hook

```typescript
import { useState, useEffect } from 'react';

function useIssues(owner: string, repo: string) {
  const [data, setData] = useState<GwitterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://your-domain.com/api/issues.json?format=json&owner=${owner}&repo=${repo}`
        );
        const result = await response.json();
        
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [owner, repo]);

  return { data, loading, error };
}

// 使用
function App() {
  const { data, loading, error } = useIssues('facebook', 'react');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{data?.repository}</h1>
      <p>Total Issues: {data?.totalIssues}</p>
      <ul>
        {data?.issues.map(issue => (
          <li key={issue.id}>
            {issue.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 部署方案

### 方案 1：Cloudflare Workers（推荐）

**优点：**
- 免费额度充足
- 全球 CDN 加速
- 部署简单
- 支持环境变量

**步骤：**

1. 重命名 `api/issues.js` 为 `_worker.js`
   ```bash
   mv api/issues.js _worker.js
   ```

2. 安装 wrangler CLI
   ```bash
   npm install -g @cloudflare/wrangler
   ```

3. 登录 Cloudflare
   ```bash
   wrangler login
   ```

4. 创建项目
   ```bash
   wrangler init gwitter-api
   ```

5. 设置环境变量
   ```bash
   wrangler secret put GITHUB_TOKEN
   ```

6. 部署
   ```bash
   wrangler deploy _worker.js
   ```

7. 获取 API URL
   部署成功后会返回类似：
   ```
   https://gwitter-api.your-name.workers.dev/api/issues.json
   ```

### 方案 2：Vercel Serverless Functions

**优点：**
- 与 GitHub 集成好
- 免费额度
- 自动 HTTPS

**步骤：**

1. 创建 `api/issues.js` 文件（已完成）

2. 在项目根目录创建 `vercel.json`：
   ```json
   {
     "functions": {
       "api/issues.js": {
         "runtime": "@vercel/node"
       }
     }
   }
   ```

3. 部署到 Vercel
   ```bash
   npm install -g vercel
   vercel
   ```

4. 在 Vercel 控制台设置环境变量
   - 项目 → Settings → Environment Variables
   - 添加 `GITHUB_TOKEN`

5. 部署成功后访问：
   ```
   https://your-project.vercel.app/api/issues.json
   ```

### 方案 3：腾讯云 CloudBase

**优点：**
- 国内访问速度快
- 支持云函数
- 与微信生态集成

**步骤：**

1. 创建云开发环境
   ```bash
   npm install -g @cloudbase/cli
   tcb login
   ```

2. 初始化项目
   ```bash
   tcb init
   ```

3. 创建云函数
   - 在 CloudBase 控制台创建云函数
   - 将 `api/issues.js` 内容复制到云函数
   - 运行时选择 Node.js 16+

4. 设置环境变量
   - 云函数 → 配置 → 环境变量
   - 添加 `GITHUB_TOKEN`

5. 部署
   ```bash
   tcb functions:deploy
   ```

### 方案 4：Vercel Edge Config

如果项目使用 rsbuild，可以直接配置：

1. 安装 @vercel/edge：
   ```bash
   npm install @vercel/edge
   ```

2. 创建 `api/_routes.json`：
   ```json
   {
     "version": 1,
     "include": ["/*"],
     "exclude": ["/api/*"]
   }
   ```

3. 使用边缘函数

## 测试 API

部署后测试：

```bash
# 测试获取 Issues
curl "https://your-api-domain.com/api/issues.json?format=json&owner=facebook&repo=react"

# 测试分页
curl "https://your-api-domain.com/api/issues.json?format=json&owner=facebook&repo=react&page=2&perPage=5"

# 测试错误情况（不存在的仓库）
curl "https://your-api-domain.com/api/issues.json?format=json&owner=nonexistent&repo=repo"
```

## 注意事项

### 安全建议

1. **最小权限原则**
   - GitHub Token 只给需要的权限（`public_repo`）
   - 不使用 admin 权限

2. **环境变量保护**
   - 不要在代码中硬编码 token
   - 使用 `.env` 文件或平台的环境变量设置

3. **Token 轮换**
   - 定期更新 token
   - 使用短期有效的 token

4. **访问控制**
   - 考虑添加 API 密钥验证
   - 限制 API 调用频率

### 性能优化

1. **缓存策略**
   - 考虑添加缓存层（Cloudflare KV、Redis）
   - 缓存热门仓库的数据

2. **CDN**
   - 使用 Cloudflare Workers 等全球 CDN
   - 减少延迟

3. **错误处理**
   - 添加重试机制
   - 记录错误日志

## 故障排查

### 常见错误

| 错误信息 | 原因 | 解决方案 |
|---------|------|--------|
| `Repository not found` | 仓库不存在或无权限 | 检查 owner、repo 和 token 权限 |
| `Rate limit exceeded` | 超出 GitHub API 限制 | 等待或使用更高权限的 token |
| `Bad credentials` | Token 无效或过期 | 重新生成 token |
| `GraphQL error` | 查询语法错误 | 检查 GraphQL 查询语句 |

### 调试技巧

1. **查看日志**
   ```javascript
   // API 会输出错误到控制台
   console.error('API Error:', error);
   ```

2. **检查环境变量**
   ```bash
   # Cloudflare Workers
   wrangler secret list
   
   # Vercel
   vercel env ls
   ```

3. **测试认证**
   ```bash
   # 手动测试 token 是否有效
   curl -H "Authorization: bearer YOUR_TOKEN" https://api.github.com/user
   ```

## 更新日志

### v1.0.0
- ✅ 初始版本
- ✅ 支持从 GitHub GraphQL API 获取 Issues
- ✅ 支持分页
- ✅ 完整的 CORS 支持
- ✅ 环境变量配置
