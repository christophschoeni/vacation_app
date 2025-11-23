import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import { logger } from './logger';

export interface ImagePickerResult {
  uri: string;
  canceled: boolean;
}

export type ImageSourceType = 'camera' | 'gallery';

/**
 * Request camera permissions
 * @returns true if permission granted, false otherwise
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      logger.warn('Camera permission denied');
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error requesting camera permission:', error);
    return false;
  }
}

/**
 * Request media library permissions
 * @returns true if permission granted, false otherwise
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      logger.warn('Media library permission denied');
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error requesting media library permission:', error);
    return false;
  }
}

/**
 * Pick an image from the camera
 * @returns ImagePickerResult with uri or canceled status
 */
export async function pickImageFromCamera(): Promise<ImagePickerResult> {
  try {
    // Request camera permission
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return { uri: '', canceled: true };
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { uri: '', canceled: true };
    }

    logger.debug('Image captured from camera:', result.assets[0].uri);
    return { uri: result.assets[0].uri, canceled: false };
  } catch (error) {
    logger.error('Error picking image from camera:', error);
    return { uri: '', canceled: true };
  }
}

/**
 * Pick an image from the gallery
 * @returns ImagePickerResult with uri or canceled status
 */
export async function pickImageFromGallery(): Promise<ImagePickerResult> {
  try {
    // Request media library permission
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      return { uri: '', canceled: true };
    }

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { uri: '', canceled: true };
    }

    logger.debug('Image selected from gallery:', result.assets[0].uri);
    return { uri: result.assets[0].uri, canceled: false };
  } catch (error) {
    logger.error('Error picking image from gallery:', error);
    return { uri: '', canceled: true };
  }
}

/**
 * Show action sheet to choose image source (camera or gallery)
 * @param onCameraPress Callback when camera is selected
 * @param onGalleryPress Callback when gallery is selected
 * @param cameraLabel Label for camera option
 * @param galleryLabel Label for gallery option
 * @param cancelLabel Label for cancel option
 */
export function showImageSourcePicker(
  onCameraPress: () => void,
  onGalleryPress: () => void,
  cameraLabel: string = 'Camera',
  galleryLabel: string = 'Gallery',
  cancelLabel: string = 'Cancel'
): void {
  if (Platform.OS === 'ios') {
    // iOS uses Alert with buttons
    Alert.alert(
      '',
      '',
      [
        {
          text: cameraLabel,
          onPress: onCameraPress,
        },
        {
          text: galleryLabel,
          onPress: onGalleryPress,
        },
        {
          text: cancelLabel,
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  } else {
    // Android uses Alert with buttons
    Alert.alert(
      '',
      '',
      [
        {
          text: cameraLabel,
          onPress: onCameraPress,
        },
        {
          text: galleryLabel,
          onPress: onGalleryPress,
        },
        {
          text: cancelLabel,
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }
}
