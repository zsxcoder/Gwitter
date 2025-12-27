import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import config from '../config';
import { queryStringify } from '../utils';
import { getAccessToken, getUserInfo } from '../utils/request';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { login: string; avatarUrl: string } | null;
  token: string | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ login: string; avatarUrl: string } | null>(
    null,
  );
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查 URL 中是否有 code 参数（OAuth 回调）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    const storedToken = localStorage.getItem('github_token');
    const storedUser = localStorage.getItem('github_user');

    // 如果有存储的 token，直接使用
    if (storedToken && storedUser && !code) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    // 如果有 code 参数，处理 OAuth 回调
    else if (code) {
      handleAuthCallback(code);
    }
    setIsLoading(false);
  }, []);

  const handleAuthCallback = async (code: string) => {
    console.log('OAuth callback received, code:', code);
    setIsLoading(true);
    try {
      // 使用 code 换取 access_token
      const tokenResponse = await getAccessToken(code);
      console.log('Access token response:', tokenResponse);

      // 检查响应格式
      const accessToken = typeof tokenResponse === 'string'
        ? new URLSearchParams(tokenResponse).get('access_token')
        : tokenResponse.access_token;

      if (!accessToken) {
        throw new Error('Failed to get access token from response');
      }

      // 使用 access_token 获取用户信息
      const response = await getUserInfo(accessToken);
      const user = {
        login: response.login,
        avatarUrl: response.avatar_url,
      };

      setToken(accessToken);
      setUser(user);
      setIsAuthenticated(true);

      localStorage.setItem('github_token', accessToken);
      localStorage.setItem('github_user', JSON.stringify(user));

      // 清除 URL 中的 code 参数
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.error('Auth callback error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 打开 GitHub 授权页面
  const login = () => {
    const githubOauthUrl = 'https://github.com/login/oauth/authorize';
    const query = {
      client_id: config.request.clientID,
      redirect_uri: window.location.origin + window.location.pathname,
      scope: 'public_repo',
    };
    const loginLink = `${githubOauthUrl}?${queryStringify(query)}`;
    console.log('Redirecting to:', loginLink);
    window.location.href = loginLink;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
  };

  const value = {
    isAuthenticated,
    user,
    token,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
