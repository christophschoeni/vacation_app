import { Colors, Spacing, Typography } from '@/constants/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './Button';
import { IconName } from './Icon';

interface HeaderButton {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  icon?: IconName;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftButton?: HeaderButton;
  rightButton?: HeaderButton;
  showBackButton?: boolean;
  onBackPress?: () => void;
  style?: ViewStyle;
  compact?: boolean; // New prop for compact spacing
}

export function Header({
  title,
  subtitle,
  leftButton,
  rightButton,
  showBackButton,
  onBackPress,
  style,
  compact = false,
}: HeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const headerStyles: ViewStyle = {
    backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    // Removed border and shadow for clean design
  };

  const titleColor = isDark ? Colors.dark.onBackground : Colors.light.onBackground;
  const subtitleColor = isDark ? Colors.dark.onSurfaceVariant : Colors.light.onSurfaceVariant;

  const HeaderWrapper = compact ? View : SafeAreaView;
  const wrapperProps = compact ? {} : { edges: ['top'] };

  return (
    <HeaderWrapper style={[headerStyles, style]} {...wrapperProps}>
      <View style={[styles.container, compact && styles.compactContainer]}>
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            {showBackButton && onBackPress ? (
              <TouchableOpacity
                onPress={onBackPress}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Zurück"
                accessibilityHint="Kehrt zur vorherigen Seite zurück"
              >
                <Text style={[styles.backButtonText, { color: Colors.primary[500] }]}>
                  ‹
                </Text>
              </TouchableOpacity>
            ) : leftButton ? (
              <Button
                title={leftButton.title}
                onPress={leftButton.onPress}
                variant={leftButton.variant || 'ghost'}
                size="small"
                icon={leftButton.icon}
              />
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>

          <View style={styles.rightSection}>
            {rightButton && (
              <Button
                title={rightButton.title}
                onPress={rightButton.onPress}
                variant={rightButton.variant || 'primary'}
                size="small"
                icon={rightButton.icon}
              />
            )}
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: titleColor }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: subtitleColor }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </HeaderWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing.sm,
  },
  compactContainer: {
    paddingTop: Spacing.sm, // Minimal top padding for compact version
    paddingBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    minHeight: 20,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 80,
  },
  titleSection: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    fontFamily: 'System',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: 'System',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 44, // iOS HIG minimum touch target
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: Typography.fontSize.body, // iOS body text size (17pt)
    fontWeight: Typography.fontWeight.regular,
    fontFamily: 'System',
  },
});