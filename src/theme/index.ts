export const lightTheme = {
  background: '#ffffff',
  backgroundSecondary: '#f5f5f5',
  text: '#2d2d2d',
  textSecondary: '#666666',
  border: '#e0e0e0',
  primary: '#8f63e9',
  hover: '#f0f0f0',
  card: '#ffffff',
  shadow: 'rgba(0, 0, 0, 0.1)',
  input: '#ffffff',
  placeholder: '#999999',
  error: '#cb2431',
  success: '#28a745',
  warning: '#f1c40f',
};

export const darkTheme = {
  background: '#1a1a1a',
  backgroundSecondary: '#2d2d2d',
  text: '#e0e0e0',
  textSecondary: '#a0a0a0',
  border: '#3d3d3d',
  primary: '#a78bfa',
  hover: '#3d3d3d',
  card: '#2d2d2d',
  shadow: 'rgba(0, 0, 0, 0.3)',
  input: '#2d2d2d',
  placeholder: '#666666',
  error: '#f87171',
  success: '#4ade80',
  warning: '#fbbf24',
};

export type ThemeColors = typeof lightTheme;

export const getTheme = (theme: 'light' | 'dark'): ThemeColors => {
  return theme === 'light' ? lightTheme : darkTheme;
};
