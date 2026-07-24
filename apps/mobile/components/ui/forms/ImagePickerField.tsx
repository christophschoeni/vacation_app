import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';

import { Icon } from '@/components/design';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { pickVacationImage } from '@/lib/utils/vacation-image';
import { useTranslation } from '@/lib/i18n';

interface ImagePickerFieldProps {
  label: string;
  /** Current image URI, or null/undefined when none is set. */
  value: string | null | undefined;
  onChange: (uri: string | null) => void;
}

/**
 * Labelled photo field for the vacation form.
 *
 * Shows the chosen photo as a 16:9 banner (the shape the card and detail hero
 * use) with a change/remove overlay, or a dashed placeholder that opens the
 * picker. Selection and file persistence are handled by pickVacationImage.
 */
export function ImagePickerField({ label, value, onChange }: ImagePickerFieldProps) {
  const theme = useIOSTheme();
  const { t } = useTranslation();
  const [busy, setBusy] = React.useState(false);

  const handlePick = async () => {
    setBusy(true);
    try {
      const uri = await pickVacationImage();
      if (uri) onChange(uri);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.secondaryLabel }]}>{label}</Text>

      {value ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: value }} style={styles.preview} contentFit="cover" />
          <View style={styles.overlay}>
            <TouchableOpacity
              onPress={handlePick}
              style={[styles.overlayButton, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
              accessibilityRole="button"
              accessibilityLabel={t('vacation.form.image.change')}
            >
              <Icon name="camera" size={16} color="#FFFFFF" />
              <Text style={styles.overlayText}>{t('vacation.form.image.change')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onChange(null)}
              style={[styles.overlayButton, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
              accessibilityRole="button"
              accessibilityLabel={t('vacation.form.image.remove')}
            >
              <Icon name="delete" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handlePick}
          disabled={busy}
          style={[styles.placeholder, { borderColor: theme.separator, backgroundColor: theme.groupedBackground }]}
          accessibilityRole="button"
          accessibilityLabel={t('vacation.form.image.add')}
        >
          {busy ? (
            <ActivityIndicator color={theme.secondaryLabel} />
          ) : (
            <>
              <Icon name="camera" size={24} color={theme.accent} />
              <Text style={[styles.placeholderText, { color: theme.accent }]}>
                {t('vacation.form.image.add')}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.footnote,
    marginBottom: 6,
  },
  previewWrap: {
    borderRadius: BorderRadius.tile,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    right: Spacing.sm,
    bottom: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  overlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.footnote,
    fontWeight: Typography.fontWeight.semibold,
  },
  placeholder: {
    aspectRatio: 16 / 9,
    borderRadius: BorderRadius.tile,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  placeholderText: {
    fontSize: Typography.fontSize.callout,
    fontWeight: Typography.fontWeight.medium,
  },
});
