import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Typography } from '@/constants/design';
import { budgetColor, useIOSTheme } from '@/constants/ios-theme';

interface BudgetRingProps {
  /** Spent / budget. Values above 1 fill the ring completely. */
  progress: number;
  /** Large value inside the ring, already formatted. */
  value: string;
  /** Caption under the value, e.g. "CHF übrig". */
  caption: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Circular budget indicator for the vacation detail screen.
 *
 * The arc starts at twelve o'clock, so the circle is rotated -90 degrees about
 * its own centre rather than the SVG origin.
 */
export function BudgetRing({
  progress,
  value,
  caption,
  size = 190,
  strokeWidth = 14,
}: BudgetRingProps) {
  const theme = useIOSTheme();

  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const safe = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const color = budgetColor(theme, Number.isFinite(progress) ? progress : 0);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={theme.track}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - safe)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      <View style={styles.labels} pointerEvents="none">
        <Text
          style={[styles.value, { color: theme.label }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {value}
        </Text>
        <Text style={[styles.caption, { color: theme.secondaryLabel }]}>
          {caption}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labels: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    // Keep the text clear of the stroke so a long amount cannot overlap it.
    paddingHorizontal: 34,
  },
  value: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -0.5,
  },
  caption: {
    fontSize: Typography.fontSize.footnote,
    marginTop: 2,
  },
});
