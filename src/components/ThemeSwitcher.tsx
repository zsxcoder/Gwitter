import styled from '@emotion/styled';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = styled.button<{ isDark: boolean }>`
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  background: ${(props) => (props.isDark ? '#2d2d2d' : '#ffffff')};
  color: ${(props) => (props.isDark ? '#ffffff' : '#2d2d2d')};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid ${(props) => (props.isDark ? '#3d3d3d' : '#e0e0e0')};

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }

  .icon {
    position: absolute;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .icon-hidden {
    opacity: 0;
    transform: rotate(-180deg) scale(0.5);
  }

  .icon-visible {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
`;

const BackToTopButton = styled.button<{ visible: boolean }>`
  position: fixed;
  right: 20px;
  bottom: 85px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 999;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  pointer-events: ${(props) => (props.visible ? 'auto' : 'none')};
  transform: translateY(${(props) => (props.visible ? '0' : '20px')});
  background: ${(props) => (props.theme === 'dark' ? '#2d2d2d' : '#ffffff')};
  color: ${(props) => (props.theme === 'dark' ? '#ffffff' : '#2d2d2d')};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid ${(props) => (props.theme === 'dark' ? '#3d3d3d' : '#e0e0e0')};

  &:hover {
    transform: translateY(${(props) => (props.visible ? '-4px' : '20px')});
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(${(props) => (props.visible ? '0' : '20px')}) scale(0.95);
  }
`;

const FloatingControls = () => {
  const { theme, toggleTheme } = useTheme();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <BackToTopButton
        visible={showBackToTop}
        onClick={handleBackToTop}
        theme={theme}
        aria-label="Back to top"
      >
        ↑
      </BackToTopButton>
      <ThemeToggle
        isDark={theme === 'dark'}
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <span className={`icon ${theme === 'dark' ? 'icon-visible' : 'icon-hidden'}`}>
          ☀️
        </span>
        <span className={`icon ${theme === 'light' ? 'icon-visible' : 'icon-hidden'}`}>
          🌙
        </span>
      </ThemeToggle>
    </>
  );
};

export default FloatingControls;
