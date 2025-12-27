import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import config from '../config';
import { useAuth } from '../hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';

const ToolbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--card);
  border-radius: 10px;
  border: 1px solid var(--border);
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0.1em 0.2em 0 var(--shadow);
  margin: 6px;
  margin-bottom: 1em;

  ${config.app.enableRepoSwitcher && `
    @media (max-width: 600px) {
      flex-direction: column;
      gap: 8px;
      align-items: stretch;
    }
  `}
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RepoInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RepoInput = styled.input`
  padding: 6px 10px;
  border: 1px solid var(--input-border);
  border-radius: 16px;
  font-size: 12px;
  background: var(--input);
  color: var(--text);
  width: 180px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(143, 99, 233, 0.1);
  }

  &::placeholder {
    color: var(--placeholder);
  }

  @media (max-width: 768px) {
    width: 140px;
    font-size: 12px;
  }
`;

const RepoLabel = styled.span`
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const ApplyButton = styled.button`
  background: var(--primary);
  color: var(--background);
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: var(--primary-hover);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LoginBtn = styled.button`
  background: #1da1f2;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #1991db;
  }
`;

const LogoutBtn = styled(LoginBtn)`
  background: transparent;
  color: #657786;
  border: none;
  padding: 0;
  font-size: 12px;
  font-weight: 400;
  opacity: 0.8;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: #657786;
    background: transparent;
    opacity: 1;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 16px;
  font-size: 12px;
`;

const UserAvatar = styled.img`
  width: 25px;
  height: 25px;
  border-radius: 50%;
`;

const UserName = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #e1e8ed;
  border-top: 2px solid #1da1f2;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 16px;
  font-size: 12px;
  color: var(--text-secondary);
`;

const ExportButton = styled.button`
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: var(--hover);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

interface ToolbarProps {
  onRepoChange?: (owner: string, repo: string) => void;
  currentRepo?: { owner: string; repo: string };
  isLoading?: boolean;
  error?: string | null;
  onExport?: () => void;
}

const Toolbar = ({
  onRepoChange,
  currentRepo,
  isLoading: repoLoading = false,
  error,
  onExport,
}: ToolbarProps) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, login, logout, isLoading } = useAuth();

  const defaultRepo = `${config.request.owner}/${config.request.repo}`;

  const [repoInput, setRepoInput] = useState(
    currentRepo ? `${currentRepo.owner}/${currentRepo.repo}` : defaultRepo,
  );
  const [validationError, setValidationError] = useState<string>('');

  const isValidRepo = (input: string) => {
    if (!input.trim()) {
      return false;
    }
    const parts = input.split('/');
    return parts.length === 2 && parts[0].trim() && parts[1].trim();
  };

  const handleApplyRepo = () => {
    setValidationError('');

    if (!isValidRepo(repoInput)) {
      setValidationError(t('toolbar.invalidRepo'));
      return;
    }

    const [owner, repo] = repoInput.split('/');
    if (onRepoChange) {
      onRepoChange(owner.trim(), repo.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValidRepo(repoInput)) {
      handleApplyRepo();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoInput(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  useEffect(() => {
    const expectedInput = currentRepo
      ? `${currentRepo.owner}/${currentRepo.repo}`
      : defaultRepo;
    if (expectedInput !== repoInput) {
      setRepoInput(expectedInput);
      setValidationError('');
    }
  }, [currentRepo, defaultRepo]);

  const renderAuthSection = () => {
    if (isLoading) {
      return (
        <LoadingContainer>
          <LoadingSpinner />
          <span>{t('auth.loading')}</span>
        </LoadingContainer>
      );
    }

    if (isAuthenticated && user) {
      return (
        <UserInfo>
          <UserAvatar src={user.avatarUrl} alt={user.login} />
          <UserName>@{user.login}</UserName>
          <LogoutBtn onClick={logout}>{t('auth.logout')}</LogoutBtn>
        </UserInfo>
      );
    }

    return (
      <LoginBtn onClick={login}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        {t('auth.login')}
      </LoginBtn>
    );
  };

  return (
    <ToolbarContainer>
      <LeftSection>
        <LanguageSwitcher />
        {config.app.enableRepoSwitcher && (
          <RepoInputContainer>
            <RepoLabel>{t('toolbar.repo')}</RepoLabel>
            <RepoInput
              value={repoInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={t('toolbar.repoPlaceholder')}
              disabled={!config.app.enableRepoSwitcher}
              style={{
                borderColor: error || validationError ? '#ff6b6b' : '#e1e8ed',
                opacity: !config.app.enableRepoSwitcher ? 0.6 : 1,
                cursor: !config.app.enableRepoSwitcher ? 'not-allowed' : 'text',
              }}
            />
            <ApplyButton
              onClick={handleApplyRepo}
              disabled={!isValidRepo(repoInput) || repoLoading}
              title={!isValidRepo(repoInput) ? t('toolbar.invalidRepo') : ''}
            >
              {repoLoading ? (
                <LoadingSpinner style={{ width: '12px', height: '12px' }} />
              ) : (
                t('toolbar.apply')
              )}
            </ApplyButton>
          </RepoInputContainer>
        )}
      </LeftSection>
      <RightSection>
        {renderAuthSection()}
        {onExport && (
          <ExportButton onClick={onExport} title="Export issues to JSON console">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0L3 5h3v5H2v5h4v5h3l-5 5h-1l-5-5h4V10H8V5h3L8 0z" />
              <path d="M14 3H9v1h5v10H9v1h5c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM0 12l3-3h-1l-2 2V7H0v4h3v4l2 2h1l-3-3z" />
            </svg>
            JSON
          </ExportButton>
        )}
      </RightSection>
    </ToolbarContainer>
  );
};

export default Toolbar;
