import { requireNativeModule } from 'expo-modules-core';

type WidgetStorageNativeModule = {
  set(key: string, value: string, appGroup: string): Promise<void>;
  reloadAll(): void;
};

let nativeModule: WidgetStorageNativeModule | null = null;

try {
  nativeModule = requireNativeModule<WidgetStorageNativeModule>('WidgetStorage');
} catch {
  // Native module not present (e.g. Expo Go, web, or before a native rebuild).
  nativeModule = null;
}

/**
 * True when the native WidgetStorage module is linked and available.
 * On any platform/build where it isn't, the API below no-ops safely.
 */
export const isAvailable: boolean = nativeModule !== null;

/**
 * Write a string value into the given App Group's shared UserDefaults suite.
 * Typically the value is a JSON string the widget extension reads back.
 */
export async function setItem(
  key: string,
  value: string,
  appGroup: string
): Promise<void> {
  if (!nativeModule) return;
  await nativeModule.set(key, value, appGroup);
}

/**
 * Ask WidgetKit to reload all widget timelines so widgets re-render with
 * freshly written data. No-op when the native module is unavailable.
 */
export function reloadAll(): void {
  if (!nativeModule) return;
  nativeModule.reloadAll();
}
