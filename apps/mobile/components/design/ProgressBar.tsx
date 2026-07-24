import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useIOSTheme } from '@/constants/ios-theme';

interface ProgressBarProps {
  /** Fraction filled. Values outside 0..1 are clamped. */
  progress: number;
  color?: string;
  height?: number;
  trackColor?: string;
  style?: ViewStyle;
}

/**
 * Rounded track with a filled portion, as used by the budget rows and the
 * checklist progress summary.
 */
export function ProgressBar({
  progress,
  color,
  height = 6,
  trackColor,
  style,
}: ProgressBarProps) {
  const theme = useIOSTheme();
  // NaN survives Math.min/max, and a NaN width silently collapses the fill, so
  // treat a non-finite ratio (0/0 from a zero budget) as empty.
  const safe = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor ?? theme.track },
        style,
      ]}
    >
      <View
        style={{
          width: `${safe * 100}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: color ?? theme.accent,
        }}
      />
    </View>
  );
}

/**
 * Multi-segment bar showing each category's share of the total, as in the
 * report header. Segments whose share rounds to nothing are dropped so they
 * cannot render as a visible sliver.
 */
export function SegmentedBar({
  segments,
  height = 12,
  style,
}: {
  segments: { value: number; color: string }[];
  height?: number;
  style?: ViewStyle;
}) {
  const theme = useIOSTheme();
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);

  return (
    <View
      style={[
        styles.segmented,
        { height, borderRadius: height / 2, backgroundColor: theme.track },
        style,
      ]}
    >
      {total > 0 &&
        segments
          .filter((s) => s.value > 0)
          .map((s, i) => (
            <View
              key={i}
              style={{ flex: s.value / total, backgroundColor: s.color }}
            />
          ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    width: '100%',
  },
  segmented: {
    flexDirection: 'row',
    overflow: 'hidden',
    width: '100%',
  },
});
