import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassContainer, GlassButton } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightButton?: {
    title: string;
    icon?: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  leftButton?: {
    title: string;
    icon?: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
}

export default function AppHeader({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightButton,
  leftButton,
}: AppHeaderProps) {
  const colorScheme = useColorScheme();

  return (
    <LinearGradient
      colors={colorScheme === 'dark'
        ? ['rgba(28, 28, 30, 0.95)', 'rgba(28, 28, 30, 0.8)']
        : ['rgba(248, 248, 248, 0.95)', 'rgba(248, 248, 248, 0.8)']
      }
      style={styles.header}
    >
      <GlassContainer intensity="light" style={styles.headerContent}>
        <View style={styles.headerTop}>
          {showBackButton && onBackPress ? (
            <GlassButton
              title="Zurück"
              icon="←"
              onPress={onBackPress}
              size="small"
              variant="outline"
              style={styles.backButton}
            />
          ) : leftButton ? (
            <GlassButton
              title={leftButton.title}
              icon={leftButton.icon}
              onPress={leftButton.onPress}
              size="small"
              variant={leftButton.variant || 'outline'}
              style={styles.leftButton}
            />
          ) : (
            <View style={styles.placeholder} />
          )}

          {rightButton && (
            <GlassButton
              title={rightButton.title}
              icon={rightButton.icon}
              onPress={rightButton.onPress}
              size="small"
              variant={rightButton.variant || 'primary'}
              style={styles.rightButton}
            />
          )}
        </View>

        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
          {title}
        </Text>

        {subtitle && (
          <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
            {subtitle}
          </Text>
        )}
      </GlassContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    paddingVertical: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    minWidth: 80,
  },
  leftButton: {
    minWidth: 80,
  },
  rightButton: {
    minWidth: 100,
  },
  placeholder: {
    width: 80,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 8,
  },
});