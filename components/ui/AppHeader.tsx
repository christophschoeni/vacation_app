import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/design';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  variant?: 'default' | 'modal' | 'large';
  onRightPress?: () => void;
}

export default function AppHeader({
  title,
  showBack = false,
  onBackPress,
  rightAction,
  leftAction,
  variant = 'default',
  onRightPress
}: AppHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
      edges={['top']}
    >
      <View style={styles.header}>
        {/* Left Side */}
        <View style={styles.leftSide}>
          {showBack && onBackPress ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={variant === 'modal' ? styles.modalButton : styles.backButton}
              accessibilityLabel="Zurück"
            >
              {variant === 'modal' ? (
                <View style={[styles.modalButtonInner, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.98)' }]}>
                  <Text style={[styles.modalCloseText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>×</Text>
                </View>
              ) : (
                <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
              )}
            </TouchableOpacity>
          ) : leftAction ? (
            leftAction
          ) : (
            <View style={styles.spacer} />
          )}
        </View>

        {/* Center - Keep empty for iOS native look */}
        <View style={styles.centerSpacer} />

        {/* Right Side */}
        <View style={styles.rightSide}>
          {variant === 'modal' && onRightPress ? (
            <TouchableOpacity
              onPress={onRightPress}
              style={styles.modalButton}
              accessibilityLabel="Speichern"
            >
              <View style={[styles.modalSaveButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.98)' }]}>
                <Icon name="check" size={18} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                <Text style={[styles.modalButtonText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  Speichern
                </Text>
              </View>
            </TouchableOpacity>
          ) : rightAction ? (
            rightAction
          ) : (
            <View style={styles.spacer} />
          )}
        </View>
      </View>

      {/* Large Title */}
      {variant === 'large' && title && (
        <View style={styles.largeTitleContainer}>
          <Text style={[styles.largeTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {title}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    minHeight: 32,
  },
  leftSide: {
    minWidth: 40,
    alignItems: 'flex-start',
  },
  rightSide: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  centerSpacer: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  modalButton: {
    padding: 4,
  },
  modalButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalSaveButton: {
    height: 36,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  modalCloseText: {
    fontSize: 22,
    fontWeight: '300',
    fontFamily: 'System',
    lineHeight: 22,
  },
  spacer: {
    width: 40,
  },
  largeTitleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 41,
  },
});