// Custom Design System
// Core design tokens for the vacation app

export const Colors = {
  // Primary colors
  primary: {
    50: '#E6F2FF',
    100: '#CCE6FF',
    200: '#99CCFF',
    300: '#66B2FF',
    400: '#3399FF',
    500: '#007AFF', // Main primary
    600: '#0056CC',
    700: '#003D99',
    800: '#002966',
    900: '#001433',
  },

  // Secondary colors
  secondary: {
    50: '#F5F5F7',
    100: '#E8E8ED',
    200: '#D1D1D6',
    300: '#B4B4BE',
    400: '#9797A7',
    500: '#7A7A8F',
    600: '#626278',
    700: '#4A4A61',
    800: '#32324A',
    900: '#1A1A33',
  },

  // Semantic colors
  success: {
    50: '#E6F7E6',
    100: '#CCEFCC',
    200: '#99DF99',
    300: '#66CF66',
    400: '#33BF33',
    500: '#00AF00',
    600: '#008C00',
    700: '#006900',
    800: '#004600',
    900: '#002300',
  },

  warning: {
    50: '#FFF8E6',
    100: '#FFF0CC',
    200: '#FFE199',
    300: '#FFD266',
    400: '#FFC333',
    500: '#FFB400',
    600: '#CC9000',
    700: '#996C00',
    800: '#664800',
    900: '#332400',
  },

  error: {
    50: '#FFEBE6',
    100: '#FFD6CC',
    200: '#FFAD99',
    300: '#FF8466',
    400: '#FF5B33',
    500: '#FF3B30',
    600: '#CC2F26',
    700: '#99231D',
    800: '#661713',
    900: '#330C0A',
  },

  // Neutral colors
  neutral: {
    0: '#FFFFFF',
    50: '#F9F9F9',
    100: '#F2F2F2',
    200: '#E6E6E6',
    300: '#D9D9D9',
    400: '#CCCCCC',
    500: '#BFBFBF',
    600: '#999999',
    700: '#737373',
    800: '#4D4D4D',
    900: '#262626',
    1000: '#000000',
  },

  // iOS System Colors (Light Mode)
  systemColors: {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D92',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00',
    gray: '#8E8E93',
    gray2: '#AEAEB2',
    gray3: '#C7C7CC',
    gray4: '#D1D1D6',
    gray5: '#E5E5EA',
    gray6: '#F2F2F7',
  },

  // iOS System Colors (Dark Mode)
  systemColorsDark: {
    blue: '#0A84FF',
    green: '#30D158',
    indigo: '#5E5CE6',
    orange: '#FF9F0A',
    pink: '#FF375F',
    purple: '#BF5AF2',
    red: '#FF453A',
    teal: '#64D2FF',
    yellow: '#FFD60A',
    gray: '#8E8E93',
    gray2: '#636366',
    gray3: '#48484A',
    gray4: '#3A3A3C',
    gray5: '#2C2C2E',
    gray6: '#1C1C1E',
  },

  // Theme specific
  light: {
    background: '#FFFFFF',
    surface: '#F9F9F9',
    surfaceVariant: '#F2F2F2',
    onBackground: '#1C1C1E',
    onSurface: '#1C1C1E',
    onSurfaceVariant: '#6D6D70',
    border: '#E6E6E6',
    borderVariant: '#D9D9D9',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceVariant: '#2C2C2E',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#8E8E93',
    border: 'rgba(255, 255, 255, 0.1)',
    borderVariant: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export const Typography = {
  // iOS Dynamic Type Text Styles
  fontSize: {
    // iOS Text Styles (matched to Apple's specifications)
    caption2: 11,      // Caption 2
    caption1: 12,      // Caption 1
    footnote: 13,      // Footnote
    subheadline: 15,   // Subheadline
    callout: 16,       // Callout
    body: 17,          // Body (iOS default)
    headline: 17,      // Headline (semibold body)
    title3: 20,        // Title 3
    title2: 22,        // Title 2
    title1: 28,        // Title 1
    largeTitle: 34,    // Large Title

    // Legacy sizes for backwards compatibility
    xs: 11,
    sm: 13,
    base: 17,
    lg: 17,
    xl: 20,
    '2xl': 22,
    '3xl': 28,
    '4xl': 34,
  },

  // iOS Font Weights
  fontWeight: {
    ultraLight: '100' as const,  // iOS Ultra Light
    thin: '200' as const,        // iOS Thin
    light: '300' as const,       // iOS Light
    regular: '400' as const,     // iOS Regular (renamed from normal)
    medium: '500' as const,      // iOS Medium
    semibold: '600' as const,    // iOS Semibold
    bold: '700' as const,        // iOS Bold
    heavy: '800' as const,       // iOS Heavy
    black: '900' as const,       // iOS Black
  },

  // iOS Line Heights (matched to system defaults)
  lineHeight: {
    caption: 1.2,     // For caption text
    body: 1.29,       // For body text (iOS default)
    headline: 1.24,   // For headlines
    title: 1.21,      // For titles
    largeTitle: 1.18, // For large titles
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
  },
};

export const Spacing = {
  // 4px base unit system
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
};

export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 20,
  '4xl': 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const Animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const Layout = {
  // Standard sizes
  sizes: {
    buttonHeight: 48,
    inputHeight: 48,
    headerHeight: 56,
    tabBarHeight: 80,
    fabSize: 56,
    iconSize: 24,
    avatarSize: 40,
  },

  // Breakpoints for responsive design
  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};