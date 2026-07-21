import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { BorderRadius, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';

export type StatusTone = 'success' | 'accent' | 'neutral' | 'warning' | 'danger';

/**
 * Pill badge with a tinted background, used for vacation status ("Aktiv",
 * "Geplant", "Vorbei") and for the rate source markers in settings.
 *
 * The fill is the tone colour at low opacity. Rather than compose an rgba
 * string from each themed hex, the tint is applied via opacity on a coloured
 * background, which keeps the badge correct in both schemes.
 */
export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  const theme = useIOSTheme();

  const color =
    tone === 'success'
      ? theme.success
      : tone === 'accent'
        ? theme.accent
        : tone === 'warning'
          ? theme.warning
          : tone === 'danger'
            ? theme.danger
            : theme.secondaryLabel;

  return (
    <Text
      style={[
        styles.badge,
        {
          color,
          // Opacity on the hex gives the same tint the mockups specify without
          // needing a parallel rgba table per theme.
          backgroundColor: color + (theme.isDark ? '2B' : '1F'),
        },
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontSize: Typography.fontSize.caption1,
    fontWeight: Typography.fontWeight.semibold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
  },
});
