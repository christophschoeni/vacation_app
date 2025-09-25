import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Common emojis organized by category for templates
const EMOJI_CATEGORIES = {
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

interface EmojiSelectorProps {
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
  showCategories?: boolean;
  compact?: boolean;
}

export default function EmojiSelector({
  selectedEmoji,
  onEmojiSelect,
  showCategories = true,
  compact = false,
}: EmojiSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderEmoji = (emoji: string) => (
    <TouchableOpacity
      key={emoji}
      style={[
        compact ? styles.compactEmojiButton : styles.emojiButton,
        {
          backgroundColor: selectedEmoji === emoji
            ? (isDark ? '#1C1C1E' : '#F2F2F7')
            : 'transparent',
          borderColor: selectedEmoji === emoji
            ? '#007AFF'
            : (isDark ? '#38383A' : '#E5E5EA'),
        }
      ]}
      onPress={() => onEmojiSelect(emoji)}
      activeOpacity={0.7}
    >
      <Text style={compact ? styles.compactEmojiText : styles.emojiText}>
        {emoji}
      </Text>
    </TouchableOpacity>
  );

  if (!showCategories) {
    // Simple grid with just common emojis
    return (
      <View style={styles.simpleGrid}>
        {EMOJI_CATEGORIES.common.emojis.map(renderEmoji)}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {Object.entries(EMOJI_CATEGORIES).map(([categoryKey, category]) => (
        <View key={categoryKey} style={styles.categorySection}>
          <Text style={[
            styles.categoryTitle,
            { color: isDark ? '#FFFFFF' : '#1C1C1E' }
          ]}>
            {category.label}
          </Text>
          <View style={styles.emojiGrid}>
            {category.emojis.map(renderEmoji)}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  simpleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactEmojiButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  compactEmojiText: {
    fontSize: 20,
  },
});