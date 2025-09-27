import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Icon } from '@/components/design';
import { useTheme, ThemeMode } from '@/contexts/theme-context';
import { Colors } from '@/constants/design';

const themeOptions: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light', label: 'Hell', icon: 'sun' },
  { mode: 'dark', label: 'Dunkel', icon: 'moon' },
  { mode: 'system', label: 'System', icon: 'settings' },
];

export function ThemeToggleCard() {
  const { themeMode, setThemeMode, isDark } = useTheme();

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  return (
    <Card variant="clean" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Icon name="settings" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              Erscheinungsbild
            </Text>
            <Text style={[styles.subtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              Hell-, Dunkel- oder System-Modus
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.mode}
            style={[
              styles.option,
              {
                backgroundColor: themeMode === option.mode
                  ? (isDark ? Colors.systemColorsDark.blue : Colors.systemColors.blue)
                  : 'transparent',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }
            ]}
            onPress={() => handleThemeChange(option.mode)}
            activeOpacity={0.7}
          >
            <Icon
              name={option.icon as any}
              size={20}
              color={
                themeMode === option.mode
                  ? '#FFFFFF'
                  : (isDark ? '#8E8E93' : '#6D6D70')
              }
            />
            <Text
              style={[
                styles.optionText,
                {
                  color: themeMode === option.mode
                    ? '#FFFFFF'
                    : (isDark ? '#FFFFFF' : '#1C1C1E')
                }
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'System',
  },
});