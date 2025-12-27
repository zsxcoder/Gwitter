// GitHub Issues API - 使用环境变量直接从 GitHub 获取 Issues 数据

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

// CORS 头设置
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8',
};

export default {
  async fetch(request, env) {
    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    const owner = url.searchParams.get('owner');
    const repo = url.searchParams.get('repo');
    const perPage = parseInt(url.searchParams.get('perPage') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');

    // 如果请求 JSON 格式
    if (format === 'json' || url.pathname.endsWith('.json')) {
      try {
        // 如果指定了 owner 和 repo，获取指定仓库的 issues
        if (owner && repo) {
          const data = await fetchRepositoryIssues(owner, repo, perPage, page);
          return new Response(JSON.stringify(data, null, 2), {
            status: 200,
            headers: CORS_HEADERS,
          });
        }

        // 如果没有指定，返回使用说明
        const usageInfo = {
          usage: 'GitHub Issues API',
          version: '1.0.0',
          endpoints: {
            getIssues: '/api/issues.json?format=json&owner=owner&repo=repo',
            getIssuesPaginated: '/api/issues.json?format=json&owner=owner&repo=repo&page=1&perPage=20',
          },
          parameters: {
            owner: '仓库所有者（必填）',
            repo: '仓库名称（必填）',
            perPage: '每页数量（默认 20，最大 100）',
            page: '页码（默认 1）',
          },
          responseFormat: {
            repository: 'string - 仓库地址',
            exportedAt: 'string - 导出时间',
            totalIssues: 'number - Issues 总数',
            issues: 'array - Issues 数组',
          },
          examples: [
            {
              description: '获取指定仓库的 Issues',
              url: `/api/issues.json?format=json&owner=facebook&repo=react`,
              curl: `curl "${url.origin}/api/issues.json?format=json&owner=facebook&repo=react"`,
            },
            {
              description: '分页获取 Issues',
              url: `/api/issues.json?format=json&owner=facebook&repo=react&page=2&perPage=10`,
              curl: `curl "${url.origin}/api/issues.json?format=json&owner=facebook&repo=react&page=2&perPage=10"`,
            },
          ],
        };

        return new Response(JSON.stringify(usageInfo, null, 2), {
          status: 200,
          headers: CORS_HEADERS,
        });
      } catch (error) {
        console.error('API Error:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to fetch issues',
            message: error.message,
            timestamp: new Date().toISOString(),
          }, null, 2),
          {
            status: 500,
            headers: CORS_HEADERS,
          }
        );
      }
    }

    // 默认返回 JSON API 文档
    return new Response(JSON.stringify(getAPIDocumentation(url.origin), null, 2), {
      status: 200,
      headers: CORS_HEADERS,
    });
  },
};

// 从 GitHub GraphQL API 获取 Issues
async function fetchRepositoryIssues(owner, repo, perPage = 20, page = 1) {
  const headers = {
    'Authorization': `bearer ${GITHUB_TOKEN}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Gwitter-API',
  };

  // 计算 after 游标（用于分页）
  const after = page > 1 ? (page - 1) * perPage : null;

  const query = `
    query($owner: String!, $repo: String!, $perPage: Int!, $after: String) {
      repository(owner: $owner, name: $repo) {
        issues(
          first: $perPage
          after: $after
          orderBy: { field: CREATED_AT, direction: DESC }
          filterBy: { states: OPEN }
        ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
          nodes {
            id
            number
            title
            createdAt
            bodyHTML
            url
            author {
              login
              avatarUrl
              url
            }
            reactions(first: 100) {
              totalCount
              nodes {
                content
                user {
                  login
                }
              }
            }
            }
            comments(first: 1) {
              totalCount
            }
            labels(first: 1) {
              nodes {
                name
                color
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    owner,
    repo,
    perPage,
    after,
  };

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'GraphQL error');
  }

  const repository = data.data.repository;

  if (!repository) {
    throw new Error(`Repository ${owner}/${repo} not found`);
  }

  const issuesData = repository.issues;
  const processedIssues = issuesData.nodes.map((issue) => {
    // 计算点赞数
    const heartReactions = issue.reactions.nodes.filter(
      (r) => r.content === 'HEART'
    );

    return {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      createdAt: issue.createdAt,
      author: {
        login: issue.author.login,
        avatarUrl: issue.author.avatarUrl,
        url: issue.author.url,
      },
      reactions: {
        totalCount: issue.reactions.totalCount,
        userReacted: heartReactions.length > 0,
        heartCount: heartReactions.length,
      },
      comments: issue.comments.totalCount,
      label: issue.labels.nodes.length > 0
        ? {
            name: issue.labels.nodes[0].name,
            color: issue.labels.nodes[0].color,
          }
        : {
            name: 'default',
            color: '1da1f2',
          },
      url: issue.url,
    };
  });

  return {
    repository: `${owner}/${repo}`,
    exportedAt: new Date().toISOString(),
    totalIssues: issuesData.totalCount,
    hasMore: issuesData.pageInfo.hasNextPage,
    currentPage: page,
    perPage,
    issues: processedIssues,
  };
}

// 获取 API 文档
function getAPIDocumentation(origin) {
  return {
    name: 'Gwitter Issues API',
    version: '1.0.0',
    description: 'GitHub Issues API 接口，使用环境变量直接从 GitHub 获取数据',
    
    authentication: {
      type: 'Bearer Token',
      location: 'Environment Variables',
      required: ['GITHUB_TOKEN'],
    },

    endpoints: {
      getIssues: {
        path: '/api/issues.json',
        method: 'GET',
        parameters: {
          format: {
            type: 'string',
            required: false,
            description: '指定返回格式，设置为 "json" 返回 JSON 数据',
            values: ['json'],
          },
          owner: {
            type: 'string',
            required: true,
            description: 'GitHub 用户名或组织名',
          },
          repo: {
            type: 'string',
            required: true,
            description: 'GitHub 仓库名',
          },
          perPage: {
            type: 'number',
            required: false,
            description: '每页返回的 Issues 数量（1-100，默认 20）',
          },
          page: {
            type: 'number',
            required: false,
            description: '页码（默认 1）',
          },
        },
      },
    },

    responseFormat: {
      success: {
        repository: 'string - 仓库地址（owner/repo）',
        exportedAt: 'string - 导出时间（ISO 8601）',
        totalIssues: 'number - Issues 总数',
        hasMore: 'boolean - 是否还有更多数据',
        currentPage: 'number - 当前页码',
        perPage: 'number - 每页数量',
        issues: 'array - Issues 数组',
      },
      issue: {
        id: 'string - Issue 唯一标识符',
        number: 'number - Issue 编号',
        title: 'string - Issue 标题',
        createdAt: 'string - 创建时间（ISO 8601）',
        author: {
          login: 'string - 作者用户名',
          avatarUrl: 'string - 作者头像 URL',
          url: 'string - 作者 GitHub URL',
        },
        reactions: {
          totalCount: 'number - 反应总数',
          userReacted: 'boolean - 当前用户是否已反应',
          heartCount: 'number - 点赞数',
        },
        comments: 'number - 评论数量',
        label: {
          name: 'string - 标签名称',
          color: 'string - 标签颜色（十六进制）',
        },
        url: 'string - Issue 在 GitHub 的链接',
      },
    },

    examples: {
      javascript: {
        description: '获取 Issues',
        code: `fetch('${origin}/api/issues.json?format=json&owner=facebook&repo=react')\n  .then(res => res.json())\n  .then(data => console.log(data));`,
      },
      curl: {
        description: '获取 Issues',
        code: `curl "${origin}/api/issues.json?format=json&owner=facebook&repo=react"`,
      },
      pagination: {
        description: '分页获取（第二页，每页 10 条）',
        code: `fetch('${origin}/api/issues.json?format=json&owner=facebook&repo=react&page=2&perPage=10')\n  .then(res => res.json())\n  .then(data => console.log(data));`,
      },
    },

    notes: [
      '此 API 使用项目的 GITHUB_TOKEN 环境变量进行认证',
      '不受 GitHub API 的未认证速率限制（5000 次/小时）',
      '认证用户的速率限制为 5000 次/小时',
      '支持分页，通过 page 和 perPage 参数控制',
      '返回的数据包含完整的 Issue 信息',
      '所有时间戳均为 ISO 8601 格式',
    ],

    deployment: {
      recommended: ['Cloudflare Workers', 'Vercel', 'Netlify', 'Tencent CloudBase'],
      environmentVariables: {
        GITHUB_TOKEN: 'GitHub Personal Access Token（必填）',
        GITHUB_CLIENT_ID: 'GitHub OAuth App Client ID（可选）',
        GITHUB_CLIENT_SECRET: 'GitHub OAuth App Client Secret（可选）',
      },
      cloudflareExample: {
        title: 'Cloudflare Workers 部署',
        steps: [
          '1. 将此文件保存为 _worker.js',
          '2. 设置环境变量：GITHUB_TOKEN',
          '3. 使用 wrangler 部署',
        ],
        command: 'npx wrangler deploy',
      },
      tencentExample: {
        title: '腾讯云 CloudBase 部署',
        steps: [
          '1. 在 CloudBase 创建云函数',
          '2. 复制此文件内容到云函数',
          '3. 设置环境变量：GITHUB_TOKEN',
        ],
      },
    },
  };
}
