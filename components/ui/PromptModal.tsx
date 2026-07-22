import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { useTranslation } from '@/lib/i18n';

interface PromptModalProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Prefilled value, e.g. the current name when renaming. */
  initialValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  keyboardType?: 'default' | 'decimal-pad';
  /** Called with the entered text when the user confirms. */
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

/**
 * Cross-platform replacement for Alert.prompt, which is iOS-only - on Android
 * it is a no-op, so every rename/create/limit flow built on it silently did
 * nothing there. A themed Modal with a single text field, matching the app's
 * grouped surfaces.
 */
export function PromptModal({
  visible,
  title,
  message,
  initialValue = '',
  placeholder,
  confirmLabel,
  cancelLabel,
  keyboardType = 'default',
  onConfirm,
  onCancel,
}: PromptModalProps) {
  const theme = useIOSTheme();
  const { t } = useTranslation();
  const [value, setValue] = React.useState(initialValue);

  // Reset the field each time the modal is opened, so a previous entry does not
  // leak into the next prompt.
  React.useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel} />

        <View style={[styles.card, { backgroundColor: theme.groupedBackground }]}>
          <Text style={[styles.title, { color: theme.label }]}>{title}</Text>
          {message ? (
            <Text style={[styles.message, { color: theme.secondaryLabel }]}>{message}</Text>
          ) : null}

          <TextInput
            style={[styles.input, { color: theme.label, backgroundColor: theme.tile, borderColor: theme.separator }]}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={theme.tertiaryLabel}
            keyboardType={keyboardType}
            autoFocus
            selectTextOnFocus
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={onCancel} accessibilityRole="button">
              <Text style={[styles.buttonText, { color: theme.secondaryLabel }]}>
                {cancelLabel ?? t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: theme.separator }]} />
            <TouchableOpacity
              style={styles.button}
              onPress={() => onConfirm(value)}
              accessibilityRole="button"
            >
              <Text style={[styles.buttonText, styles.confirm, { color: theme.accent }]}>
                {confirmLabel ?? t('common.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius['3xl'],
    padding: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.headline,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.fontSize.footnote,
    textAlign: 'center',
    marginTop: 6,
  },
  input: {
    marginTop: Spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: Typography.fontSize.callout,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  buttonText: {
    fontSize: Typography.fontSize.body,
  },
  confirm: {
    fontWeight: Typography.fontWeight.semibold,
  },
});
