import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  useSafeAreaPadding?: boolean;
}

export default function AppHeader({
  title,
  showBack = false,
  onBackPress,
  rightAction,
  leftAction,
  variant = 'default',
  onRightPress,
  useSafeAreaPadding = false
}: AppHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF', paddingTop: useSafeAreaPadding ? insets.top : 0 }]}>
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
                <View style={[styles.modalButtonInner, { backgroundColor: isDark ? 'rgba(255, 69, 58, 0.2)' : 'rgba(255, 59, 48, 0.15)' }]}>
                  <Text style={[styles.modalCloseText, { color: isDark ? '#FF453A' : '#FF3B30' }]}>×</Text>
                </View>
              ) : (
                <Icon name="arrow-left" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
              )}
            </TouchableOpacity>
          ) : leftAction ? (
            leftAction
          ) : variant === 'default' && title ? (
            <Text style={[styles.defaultTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
              {title}
            </Text>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>

        {/* Center */}
        <View style={styles.centerSpacer}>
          {(variant === 'modal' || variant === 'large' || (variant === 'default' && showBack)) && title && (
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>

        {/* Right Side */}
        <View style={styles.rightSide}>
          {variant === 'modal' && onRightPress ? (
            <TouchableOpacity
              onPress={onRightPress}
              style={styles.modalButton}
              accessibilityLabel={t('common.save')}
            >
              <View style={[styles.modalButtonInner, { backgroundColor: isDark ? 'rgba(52, 199, 89, 0.2)' : 'rgba(52, 199, 89, 0.15)' }]}>
                <Icon name="check" size={22} color={isDark ? '#34C759' : '#28A745'} />
              </View>
            </TouchableOpacity>
          ) : rightAction ? (
            rightAction
          ) : (
            <View style={styles.spacer} />
          )}
        </View>
      </View>

      {/* Large Title - Disabled as title is now shown in center */}
      {/* {variant === 'large' && title && (
        <View style={styles.largeTitleContainer}>
          <Text style={[styles.largeTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {title}
          </Text>
        </View>
      )} */}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  modalButton: {
    marginRight: 0,
  },
  modalButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
  defaultTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 41,
  },
  largeTitleContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
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