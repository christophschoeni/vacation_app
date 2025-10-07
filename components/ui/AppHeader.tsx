import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Icon } from '@/components/design';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <View style={styles.header}>
        {/* Left Side */}
        <View style={styles.leftSide}>
          {showBack && onBackPress ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={variant === 'modal' ? styles.modalButton : styles.backButton}
              accessibilityLabel={t('common.back')}
            >
              {variant === 'modal' ? (
                <View style={styles.modalButtonInner}>
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
              accessibilityLabel={t('common.save')}
            >
              <View style={styles.modalButtonInner}>
                <Icon name="check" size={20} color={isDark ? '#FFFFFF' : '#007AFF'} />
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
    </View>
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
    backgroundColor: 'transparent',
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
  largeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 41,
    flex: 1,
  },
  largeTitleRightAction: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});