import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { Icon } from '@/components/design';
import { useTranslation } from '@/lib/i18n';
import {
  pickImageFromCamera,
  pickImageFromGallery,
  showImageSourcePicker,
  ImagePickerResult,
} from '@/lib/utils/image-picker';
import { Colors } from '@/constants/Colors';

interface ImagePickerProps {
  /**
   * Current image URI (if any)
   */
  imageUri?: string;

  /**
   * Callback when image is selected
   */
  onImageSelected: (uri: string) => void;

  /**
   * Callback when image is removed
   */
  onImageRemoved?: () => void;

  /**
   * Label for the image picker
   */
  label?: string;

  /**
   * Optional style for the container
   */
  style?: any;
}

export default function ImagePicker({
  imageUri,
  onImageSelected,
  onImageRemoved,
  label,
  style,
}: ImagePickerProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleCameraPress = async () => {
    const result: ImagePickerResult = await pickImageFromCamera();
    if (!result.canceled && result.uri) {
      onImageSelected(result.uri);
    }
  };

  const handleGalleryPress = async () => {
    const result: ImagePickerResult = await pickImageFromGallery();
    if (!result.canceled && result.uri) {
      onImageSelected(result.uri);
    }
  };

  const handleAddPhoto = () => {
    showImageSourcePicker(
      handleCameraPress,
      handleGalleryPress,
      t('vacations.form.camera'),
      t('vacations.form.gallery'),
      t('vacations.form.cancel')
    );
  };

  const handleRemovePhoto = () => {
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={handleAddPhoto}
              accessibilityLabel={t('vacations.form.change_photo')}
              accessibilityRole="button"
            >
              <Icon name="image" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                {t('vacations.form.change_photo')}
              </Text>
            </TouchableOpacity>

            {onImageRemoved && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.card }]}
                onPress={handleRemovePhoto}
                accessibilityLabel={t('vacations.form.remove_photo')}
                accessibilityRole="button"
              >
                <Icon name="trash" size={20} color="#FF3B30" />
                <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>
                  {t('vacations.form.remove_photo')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.addPhotoButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleAddPhoto}
          accessibilityLabel={t('vacations.form.add_photo')}
          accessibilityRole="button"
        >
          <Icon name="camera" size={32} color={colors.icon} />
          <Text style={[styles.addPhotoText, { color: colors.text }]}>
            {t('vacations.form.add_photo')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  addPhotoButton: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  addPhotoText: {
    fontSize: 16,
    fontWeight: '500',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
