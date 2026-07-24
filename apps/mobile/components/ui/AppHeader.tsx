import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { useTranslation } from '@/lib/i18n';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  variant?: 'default' | 'modal' | 'large' | 'standard';
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
  const theme = useIOSTheme();
  const isDark = theme.isDark;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    // Transparent so the header sits on the screen's own background. A solid
    // fill here read as a white block on the grey grouped background, which
    // showed as a line under the header that the design does not have.
    <View style={[styles.container, { paddingTop: useSafeAreaPadding ? insets.top : 0 }]}>
      {/*
        Large variant, two forms from the design:
        - tab roots (no back): title and right action share one row (1a, 1g).
        - pushed screens (showBack): a row of round back + action buttons, then
          the large title on the line below (1b, 1d, 1e).
      */}
      {variant === 'large' ? (
        showBack ? (
          <View style={styles.largeStack}>
            <View style={styles.largeButtonRow}>
              {onBackPress ? (
                <TouchableOpacity
                  onPress={onBackPress}
                  style={[styles.roundButton, { backgroundColor: theme.groupedBackground }]}
                  accessibilityLabel={t('common.back')}
                >
                  <Icon name="arrow-left" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                </TouchableOpacity>
              ) : (
                <View style={styles.roundButton} />
              )}
              {rightAction ?? <View style={styles.roundButton} />}
            </View>
            <Text style={[styles.largeTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        ) : (
          <View style={styles.largeHeaderRow}>
            <Text style={[styles.largeTitle, styles.largeTitleFlex, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]} numberOfLines={1}>
              {title}
            </Text>
            {rightAction ?? <View style={styles.spacer} />}
          </View>
        )
      ) : (
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

        {/* Center - Title for standard variant */}
        {variant === 'standard' && title ? (
          <View style={styles.centerTitle}>
            <Text style={[styles.standardTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]} numberOfLines={1}>
              {title}
            </Text>
          </View>
        ) : (
          <View style={styles.centerSpacer} />
        )}

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
    minHeight: 44,
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
  centerTitle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  standardTitle: {
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
  largeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Reference 1a: title and action share a row inset 20 horizontally; the
    // 70 top of the mockup is the safe area, applied via paddingTop above.
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 12,
  },
  // Pushed screens (1b/1d/1e): round-button row, then the title below it.
  largeStack: {
    paddingHorizontal: 20,
    paddingTop: 6,
    gap: 10,
  },
  largeButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 41,
  },
  // flex:1 is safe here because the title sits in a ROW (largeHeaderRow): it
  // takes the free width and pushes the action to the right. In a column
  // container the same flex:1 collapsed the title to zero height.
  largeTitleFlex: {
    flex: 1,
  },
  largeTitleRightAction: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});