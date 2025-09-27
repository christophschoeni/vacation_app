import { useTheme } from '@/contexts/theme-context';

export function useColorScheme() {
  const { isDark } = useTheme();
  return isDark ? 'dark' : 'light';
}
