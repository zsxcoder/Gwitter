# Gwitter Issues JSON API

通过 API 接口获取 Gwitter 的 Issues 数据，方便在其他项目中使用。

## API 端点

```
https://your-domain.com/issues.json?format=json
```

## 请求示例

### JavaScript (Fetch)

```javascript
fetch('https://your-domain.com/issues.json?format=json')
  .then(response => response.text())
  .then(jsonText => {
    const data = JSON.parse(jsonText);
    console.log('Issues:', data);
    
    // 处理数据
    data.issues.forEach(issue => {
      console.log(issue.title, issue.author.login);
    });
  });
```

### JavaScript (async/await)

```javascript
async function fetchIssues() {
  const response = await fetch('https://your-domain.com/issues.json?format=json');
  const jsonText = await response.text();
  const data = JSON.parse(jsonText);
  
  console.log('Repository:', data.repository);
  console.log('Total Issues:', data.totalIssues);
  console.log('Issues:', data.issues);
  
  return data;
}

// 使用
fetchIssues().then(data => {
  // 处理 issues 数据
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
  issues: GwitterIssue[];
}

async function getGwitterIssues(): Promise<GwitterResponse> {
  const response = await fetch('https://your-domain.com/issues.json?format=json');
  const jsonText = await response.text();
  return JSON.parse(jsonText) as GwitterResponse;
}

// 使用
const data = await getGwitterIssues();
console.log(`Loaded ${data.totalIssues} issues from ${data.repository}`);
```

### cURL

```bash
curl "https://your-domain.com/issues.json?format=json"
```

## 响应格式

```json
{
  "repository": "owner/repo",
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "totalIssues": 10,
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

## 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `repository` | string | 仓库地址（owner/repo） |
| `exportedAt` | string | 导出时间（ISO 8601 格式） |
| `totalIssues` | number | Issues 总数 |
| `issues` | array | Issues 数组 |
| `issues[].id` | string | Issue 唯一标识符 |
| `issues[].number` | number | Issue 编号 |
| `issues[].title` | string | Issue 标题 |
| `issues[].createdAt` | string | 创建时间（ISO 8601） |
| `issues[].author.login` | string | 作者用户名 |
| `issues[].author.avatarUrl` | string | 作者头像 URL |
| `issues[].author.url` | string | 作者 GitHub URL |
| `issues[].reactions.totalCount` | number | 反应总数 |
| `issues[].reactions.userReacted` | boolean | 当前用户是否已反应 |
| `issues[].reactions.heartCount` | number | 点赞数 |
| `issues[].comments` | number | 评论数量 |
| `issues[].label.name` | string | 标签名称 |
| `issues[].label.color` | string | 标签颜色 |
| `issues[].url` | string | Issue 在 GitHub 的链接 |

## 数据更新机制

API 接口从以下来源获取数据（按优先级）：

1. **localStorage** - 自动保存的最新数据（最高优先级）
2. **主页面** - 如果在 Gwitter 主页加载过数据，会自动同步

### 更新数据

1. 打开 Gwitter 主页
2. 等待 Issues 加载完成
3. 数据会自动保存到 localStorage
4. API 端点会返回最新的数据

### 手动触发更新

在 Gwitter 工具栏点击 "JSON" 按钮，会手动触发数据更新。

## CORS 注意事项

如果在不同域名下使用 API，可能会遇到 CORS（跨域）问题：

### 解决方案 1：同域名部署
将使用 API 的项目部署在同一个域名下。

### 解决方案 2：配置 CORS 头
在服务器配置中添加：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Content-Type
```

### 解决方案 3：使用代理
通过代理服务器转发请求：

```javascript
// 使用自己的代理
fetch('https://your-proxy.com/api/gwitter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    target: 'https://your-gwitter-domain.com/issues.json?format=json'
  })
})
.then(response => response.json())
.then(data => {
  console.log(data);
});
```

## 使用场景示例

### 场景 1：在博客中显示最新动态

```javascript
fetch('https://your-gwitter.com/issues.json?format=json')
  .then(res => res.text())
  .then(jsonText => JSON.parse(jsonText))
  .then(data => {
    const container = document.getElementById('latest-tweets');
    data.issues.slice(0, 5).forEach(issue => {
      const tweet = document.createElement('div');
      tweet.innerHTML = `
        <div class="tweet">
          <img src="${issue.author.avatarUrl}" alt="${issue.author.login}">
          <span class="author">@${issue.author.login}</span>
          <p>${issue.title}</p>
          <a href="${issue.url}">查看详情</a>
        </div>
      `;
      container.appendChild(tweet);
    });
  });
```

### 场景 2：统计数据

```javascript
fetch('https://your-gwitter.com/issues.json?format=json')
  .then(res => res.text())
  .then(jsonText => JSON.parse(jsonText))
  .then(data => {
    const stats = {
      totalIssues: data.totalIssues,
      totalLikes: data.issues.reduce((sum, issue) => sum + issue.reactions.heartCount, 0),
      totalComments: data.issues.reduce((sum, issue) => sum + issue.comments, 0),
      topLiked: data.issues.sort((a, b) => b.reactions.heartCount - a.reactions.heartCount)[0]
    };
    
    console.log('统计:', stats);
  });
```

### 场景 3：搜索 Issues

```javascript
async function searchIssues(keyword) {
  const response = await fetch('https://your-gwitter.com/issues.json?format=json');
  const jsonText = await response.text();
  const data = JSON.parse(jsonText);
  
  const results = data.issues.filter(issue => 
    issue.title.toLowerCase().includes(keyword.toLowerCase()) ||
    issue.author.login.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return results;
}

// 使用
searchIssues('react').then(results => {
  console.log(`找到 ${results.length} 条匹配的 Issues`);
});
```

## 错误处理

```javascript
fetch('https://your-domain.com/issues.json?format=json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then(jsonText => {
    try {
      const data = JSON.parse(jsonText);
      
      if (!data.issues || !Array.isArray(data.issues)) {
        throw new Error('Invalid data format');
      }
      
      return data;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      throw new Error('Invalid JSON response');
    }
  })
  .catch(error => {
    console.error('Fetch failed:', error);
    // 处理错误
  });
```

## FAQ

**Q: 数据多久更新一次？**
A: 每次打开 Gwitter 主页或点击 "JSON" 按钮时更新。

**Q: API 有速率限制吗？**
A: 没有速率限制，但受 GitHub API 限制影响。

**Q: 支持过滤和分页吗？**
A: 当前版本返回所有已加载的 Issues，暂不支持过滤和分页参数。

**Q: 数据来源是什么？**
A: 数据来自 GitHub Issues API，与 Gwitter 主页显示的数据一致。

**Q: 如何获取特定仓库的数据？**
A: API 自动返回当前 Gwitter 加载的仓库数据。切换仓库后，API 也会更新。
