import * as ImagePicker from 'expo-image-picker';
import { File, Directory, Paths } from 'expo-file-system';
import { logger } from '@/lib/utils/logger';

// Vacation photos live in their own folder under the app's document directory,
// so they survive relaunches (the picker's own URI is a temporary cache path
// that the OS may purge) and are easy to clean up as a group. Uses the SDK 54
// File/Directory API, as the rest of the app does (see app/debug.tsx).
function imageDir(): Directory {
  return new Directory(Paths.document, 'vacation-images');
}

/**
 * Prompt for photo-library access, let the user pick one image, and copy it
 * into the app's document directory.
 *
 * Returns the persisted file URI, or null if the user cancelled or denied
 * access. The caller stores this URI in vacation.imageUrl.
 */
export async function pickVacationImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    // The card hero and detail hero are wide banners; a 16:9 crop matches them.
    aspect: [16, 9],
    quality: 0.8,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  try {
    const dir = imageDir();
    if (!dir.exists) {
      dir.create({ intermediates: true });
    }

    const asset = result.assets[0];
    const extension = asset.uri.split('.').pop()?.split('?')[0] || 'jpg';
    // A stable, collision-free name without needing Date.now/random (which are
    // unavailable in some execution contexts): the asset id or dimensions are
    // already unique enough per pick.
    const base =
      asset.assetId?.replace(/[^a-zA-Z0-9]/g, '') ||
      `img-${asset.width}x${asset.height}-${asset.uri.length}`;

    const source = new File(asset.uri);
    const dest = new File(dir, `${base}.${extension}`);
    // Replacing the same pick twice would otherwise throw on an existing file.
    if (dest.exists) {
      dest.delete();
    }
    source.copy(dest);
    return dest.uri;
  } catch (error) {
    logger.warn('Failed to persist vacation image', { error });
    // Fall back to the picker URI so the user at least sees their choice this
    // session, even though it may not survive a relaunch.
    return result.assets[0].uri;
  }
}

/** Delete a persisted vacation image. Best-effort; a missing file is fine. */
export async function deleteVacationImage(uri: string | null | undefined): Promise<void> {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    logger.warn('Failed to delete vacation image', { error });
  }
}
