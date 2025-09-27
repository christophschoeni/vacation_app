import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme-context';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = isDark ? 'dark' : 'light';

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
