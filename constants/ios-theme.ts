// iOS 26 theme surface.
//
// The design mockups specify a distinct value for light and dark for nearly
// every colour (grouped-list fills, separators, label greys, accent tints).
// Screens used to inline `isDark ? '#000000' : '#FFFFFF'` at each use site,
// which is where the two tab groups and the vacation card drifted apart.
// Resolve a theme once per screen with `useIOSTheme()` and read named roles
// off it instead.

import { useColorScheme } from 'react-native';
import { Colors } from './design';

export interface IOSTheme {
  isDark: boolean;

  /** Screen background behind grouped content. */
  background: string;
  /** Fill of a grouped list container or card sitting on `background`. */
  groupedBackground: string;
  /** Compact tile fill (stat tiles, inline chips). */
  tile: string;
  /** Hairline between rows inside a grouped container. */
  separator: string;

  /** Primary text. */
  label: string;
  /** Supporting text: dates, captions, row subtitles. */
  secondaryLabel: string;
  /** De-emphasised text: placeholders, completed checklist items. */
  tertiaryLabel: string;

  /** Accent / interactive colour. */
  accent: string;
  /** Neutral track behind a progress bar or ring. */
  track: string;

  success: string;
  warning: string;
  danger: string;

  /** Category swatches, keyed to the app's expense category ids. */
  category: Record<string, string>;
}

const light: IOSTheme = {
  isDark: false,
  background: '#F2F2F7',
  groupedBackground: '#FFFFFF',
  tile: '#FFFFFF',
  separator: 'rgba(60, 60, 67, 0.12)',
  label: '#000000',
  secondaryLabel: 'rgba(60, 60, 67, 0.6)',
  tertiaryLabel: 'rgba(60, 60, 67, 0.3)',
  accent: Colors.systemColors.blue,
  track: 'rgba(120, 120, 128, 0.16)',
  success: Colors.systemColors.green,
  warning: Colors.systemColors.orange,
  danger: Colors.systemColors.red,
  category: {
    accommodation: Colors.systemColors.indigo,
    food: Colors.systemColors.orange,
    transport: Colors.systemColors.blue,
    entertainment: Colors.systemColors.green,
    shopping: '#FF2D55',
    other: Colors.systemColors.gray,
  },
};

const dark: IOSTheme = {
  isDark: true,
  background: '#000000',
  groupedBackground: '#1C1C1E',
  tile: '#1C1C1E',
  separator: 'rgba(84, 84, 88, 0.65)',
  label: '#FFFFFF',
  secondaryLabel: 'rgba(235, 235, 245, 0.6)',
  tertiaryLabel: 'rgba(235, 235, 245, 0.3)',
  accent: Colors.systemColorsDark.blue,
  track: 'rgba(120, 120, 128, 0.3)',
  success: Colors.systemColorsDark.green,
  warning: Colors.systemColorsDark.orange,
  danger: Colors.systemColorsDark.red,
  category: {
    accommodation: Colors.systemColorsDark.indigo,
    food: Colors.systemColorsDark.orange,
    transport: Colors.systemColorsDark.blue,
    entertainment: Colors.systemColorsDark.green,
    shopping: '#FF375F',
    other: Colors.systemColorsDark.gray,
  },
};

export const iosThemes = { light, dark };

export function useIOSTheme(): IOSTheme {
  return useColorScheme() === 'dark' ? dark : light;
}

/**
 * Swatch for an expense category, falling back to the neutral grey so an
 * unknown or user-created category id still renders.
 */
export function categoryColor(theme: IOSTheme, category: string): string {
  return theme.category[category] ?? theme.category.other;
}

/**
 * Colour for a spend bar or ring: red once the budget is exceeded, amber as it
 * gets close, accent otherwise. `ratio` is spent / budget.
 */
export function budgetColor(theme: IOSTheme, ratio: number): string {
  if (ratio >= 1) return theme.danger;
  if (ratio >= 0.9) return theme.warning;
  return theme.accent;
}
