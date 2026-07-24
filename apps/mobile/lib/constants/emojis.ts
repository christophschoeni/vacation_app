/**
 * Emoji constants for consistent icon usage across the app
 * Organized by category for easy selection and reuse
 */

interface EmojiCategory {
  label: string;
  emojis: string[];
}

/**
 * Organized emoji collections for templates and UI elements
 */
export const EMOJI_CATEGORIES: Record<string, EmojiCategory> = {
  common: {
    label: 'Häufig verwendet',
    emojis: ['📝', '🧳', '🛒', '🌟', '✅', '📋', '🎯', '📱', '💡', '🎨', '🔧', '⚙️']
  },
  travel: {
    label: 'Reise',
    emojis: ['✈️', '🏖️', '🗺️', '🎒', '📷', '🚗', '🚢', '🚂', '🏨', '🏝️', '🌍', '🧭']
  },
  activities: {
    label: 'Aktivitäten',
    emojis: ['🏊', '🏄', '🚴', '🥾', '🎿', '🏂', '🎣', '🎭', '🎪', '🎨', '🎵', '🎮']
  },
  food: {
    label: 'Essen & Trinken',
    emojis: ['🍕', '🍔', '🍜', '🍣', '🥗', '🍰', '🍷', '🍺', '☕', '🧁', '🍉', '🥑']
  },
  objects: {
    label: 'Gegenstände',
    emojis: ['👕', '👖', '👟', '🕶️', '💊', '🧴', '📱', '💻', '📚', '💰', '🎁', '🛡️']
  },
  nature: {
    label: 'Natur',
    emojis: ['🌲', '🌺', '🌊', '⛰️', '🏔️', '🌅', '🌙', '⭐', '☀️', '🌈', '🍃', '🌸']
  },
  symbols: {
    label: 'Symbole',
    emojis: ['❤️', '💎', '🔥', '⚡', '🎉', '🎊', '💫', '✨', '🎈', '🏆', '🎯', '🔮']
  }
};

/**
 * Template icons - most commonly used emojis for templates
 * Alias for backward compatibility with TEMPLATE_ICONS
 */
export const TEMPLATE_ICONS = EMOJI_CATEGORIES.common.emojis;

/**
 * Get all emojis as a flat array
 */
export function getAllEmojis(): string[] {
  return Object.values(EMOJI_CATEGORIES).flatMap(category => category.emojis);
}

/**
 * Get emojis by category
 */
export function getEmojisByCategory(categoryKey: string): string[] {
  return EMOJI_CATEGORIES[categoryKey]?.emojis || [];
}

/**
 * Search emojis across all categories
 */
export function searchEmojis(query: string): string[] {
  const searchTerm = query.toLowerCase();
  const allEmojis = getAllEmojis();

  // Simple search - could be enhanced with emoji names/descriptions
  return allEmojis.filter(emoji =>
    // For now, just return all emojis if there's a search term
    // This could be enhanced with emoji-to-keyword mapping
    searchTerm.length > 0
  );
}

/**
 * Get emoji category keys
 */
export function getEmojiCategoryKeys(): string[] {
  return Object.keys(EMOJI_CATEGORIES);
}

/**
 * Get emoji category label
 */
export function getEmojiCategoryLabel(categoryKey: string): string {
  return EMOJI_CATEGORIES[categoryKey]?.label || 'Unbekannt';
}