import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import config from '../config';
import { queryStringify, windowOpen } from '../utils';
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

  useEffect(() => {
    const storedToken = localStorage.getItem('github_token');
    const storedUser = localStorage.getItem('github_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleAuthCallback = async (code: string) => {
    setIsLoading(true);
    try {
      // 使用 code 换取 access_token
      const tokenResponse = await getAccessToken(code);
      console.log('Access token response:', tokenResponse);

      // 使用 access_token 获取用户信息
      const response = await getUserInfo(tokenResponse.access_token || tokenResponse);
      const user = {
        login: response.login,
        avatarUrl: response.avatar_url,
      };

      const accessToken = tokenResponse.access_token || tokenResponse;
      setToken(accessToken);
      setUser(user);
      setIsAuthenticated(true);

      localStorage.setItem('github_token', accessToken);
      localStorage.setItem('github_user', JSON.stringify(user));
    } catch (error) {
      console.error('Auth callback error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // open window，点击授权，重定向到 auth window，请求 proxy 获取token
  const login = () => {
    const githubOauthUrl = 'https://github.com/login/oauth/authorize';
    const query = {
      client_id: config.request.clientID,
      redirect_uri: window.location.href,
      scope: 'public_repo',
    };
    const loginLink = `${githubOauthUrl}?${queryStringify(query)}`;
    setIsLoading(true);
    windowOpen(loginLink)
      .then((tokenOrCode: unknown) => {
        handleAuthCallback(tokenOrCode as string);
      })
      .catch((error) => {
        console.error('Login error:', error);
        setIsLoading(false);
      });
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
