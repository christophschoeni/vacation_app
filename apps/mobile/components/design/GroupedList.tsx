import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';

/**
 * The iOS 26 grouped-list container: a rounded filled card whose children are
 * rows separated by inset hairlines.
 *
 * Separators are drawn by the container rather than by each row, so a row does
 * not need to know whether it is last - that is what produced the stray
 * trailing hairline in the earlier list markup.
 */
export function GroupedList({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const theme = useIOSTheme();
  const rows = React.Children.toArray(children).filter(Boolean);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.groupedBackground },
        style,
      ]}
    >
      {rows.map((row, i) => (
        <View
          key={i}
          style={
            i < rows.length - 1
              ? [styles.row, { borderBottomColor: theme.separator }]
              : undefined
          }
        >
          {row}
        </View>
      ))}
    </View>
  );
}

/**
 * Uppercase caption above a GroupedList, inset to line up with the row text
 * rather than the container edge.
 */
export function GroupedListHeader({ title }: { title: string }) {
  const theme = useIOSTheme();
  return (
    <Text style={[styles.header, { color: theme.secondaryLabel }]}>
      {title.toUpperCase()}
    </Text>
  );
}

/** Explanatory text below a GroupedList, inset to match the header. */
export function GroupedListFooter({ text }: { text: string }) {
  const theme = useIOSTheme();
  return (
    <Text style={[styles.footer, { color: theme.secondaryLabel }]}>{text}</Text>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  header: {
    fontSize: Typography.fontSize.footnote,
    letterSpacing: -0.08,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  footer: {
    fontSize: Typography.fontSize.caption1,
    lineHeight: Typography.fontSize.caption1 * 1.4,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
});
