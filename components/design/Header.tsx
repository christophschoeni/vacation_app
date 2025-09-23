import { Colors, Shadow, Spacing, Typography } from '@/constants/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
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
}

export function Header({
  title,
  subtitle,
  leftButton,
  rightButton,
  showBackButton,
  onBackPress,
  style,
}: HeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const headerStyles: ViewStyle = {
    backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? Colors.dark.border : Colors.light.border,
    ...Shadow.sm,
  };

  const titleColor = isDark ? Colors.dark.onBackground : Colors.light.onBackground;
  const subtitleColor = isDark ? Colors.dark.onSurfaceVariant : Colors.light.onSurfaceVariant;

  return (
    <SafeAreaView style={[headerStyles, style]} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            {showBackButton && onBackPress ? (
              <Button
                title="← Zurück"
                onPress={onBackPress}
                variant="ghost"
                size="small"
              />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing.sm,
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
});