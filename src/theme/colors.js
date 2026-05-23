import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { STATION } from '../config/station';

export const colors = {
  bg: '#0F172A',
  bgElevated: '#1E293B',
  card: 'rgba(30, 41, 59, 0.7)',
  cardHover: 'rgba(51, 65, 85, 0.8)',
  border: 'rgba(255, 255, 255, 0.15)',
  text: '#F8FAFC',
  textDim: '#CBD5E1',
  textMuted: '#94A3B8',
  primary: STATION.primary || '#3B82F6',
  accent: STATION.accent || '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  overlay: 'rgba(15, 23, 42, 0.7)',
  glassBg: 'rgba(30, 41, 59, 0.45)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 6, md: 10, lg: 14, xl: 20, full: 999 };

export const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
  },
};

export function applyStationTheme(station) {
  if (!station) return;
  // Fallback to our vibrant default if backend returns empty or '#000000'
  const isInvalid = (c) => !c || c.trim() === '' || c.trim() === '#000000' || c.trim() === '#ffffff';
  
  if (!isInvalid(station.primary)) colors.primary = station.primary.trim();
  if (!isInvalid(station.accent)) colors.accent = station.accent.trim();
  
  navTheme.colors.primary = colors.primary;
  navTheme.colors.background = colors.bg;
  navTheme.colors.card = colors.bgElevated;
  navTheme.colors.text = colors.text;
  navTheme.colors.border = colors.border;
}
