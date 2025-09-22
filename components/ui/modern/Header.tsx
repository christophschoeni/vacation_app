import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Button from './Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftButton?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  };
  rightButton?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  };
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function Header({
  title,
  subtitle,
  leftButton,
  rightButton,
  showBackButton,
  onBackPress,
}: HeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const headerStyles = {
    backgroundColor: isDark ? '#000000' : '#F8F8F8',
    borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA',
  };

  return (
    <SafeAreaView style={[styles.container, headerStyles]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            {showBackButton && onBackPress ? (
              <Button
                title="← Zurück"
                onPress={onBackPress}
                variant="outline"
                size="small"
              />
            ) : leftButton ? (
              <Button
                title={leftButton.title}
                onPress={leftButton.onPress}
                variant={leftButton.variant || 'outline'}
                size="small"
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
              />
            )}
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
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
    borderBottomWidth: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 32,
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
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'System',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'System',
  },
});