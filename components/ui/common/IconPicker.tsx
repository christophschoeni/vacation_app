import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Icon, IconName } from '@/components/design';
import { useColorScheme } from 'react-native';

// Available icons for categories - organized by category
// Default category icons are listed first for easy access
const CATEGORY_ICONS: IconName[] = [
  // DEFAULT CATEGORIES - Used in expense categories
  'restaurant',   // Essen
  'car',         // Transport
  'hotel',       // Hotel/Accommodation
  'music',       // Entertainment
  'shopping',    // Shopping
  'other',       // Sonstiges

  // Additional Food & Drink
  'coffee',
  'utensils',
  'wine',
  'beer',
  'ice-cream',
  'pizza',

  // Additional Transportation
  'airplane',
  'bus',
  'train',
  'ship',
  'bike',
  'fuel',

  // Additional Places
  'home',
  'location',
  'mountain',
  'trees',

  // Additional Shopping & Items
  'cart',
  'shirt',
  'gift',
  'camera',

  // Additional Activities & Entertainment
  'gamepad',
  'book',
  'compass',

  // Services & Utilities
  'phone',
  'wifi',
  'stethoscope',
  'settings',

  // Money & Finance
  'currency',
  'wallet',
  'budget',

  // Time & Weather
  'calendar',
  'sun',
  'moon',
  'cloud',

  // General
  'heart',
  'star',
  'plus',
  'check',
];

interface IconPickerProps {
  visible: boolean;
  selectedIcon: IconName;
  onIconSelect: (icon: IconName) => void;
  onClose: () => void;
}

export default function IconPicker({
  visible,
  selectedIcon,
  onIconSelect,
  onClose,
}: IconPickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleIconSelect = (icon: IconName) => {
    console.log('Icon selected:', icon);
    onIconSelect(icon);
    onClose();
  };

  console.log('IconPicker render - visible:', visible);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            },
          ]}
        >
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: isDark ? '#FFFFFF' : '#1C1C1E' },
              ]}
            >
              Icon auswählen
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.iconGrid}>
              {CATEGORY_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    {
                      backgroundColor:
                        selectedIcon === icon
                          ? isDark
                            ? '#007AFF'
                            : '#007AFF'
                          : isDark
                          ? '#2C2C2E'
                          : '#F2F2F7',
                      borderColor:
                        selectedIcon === icon
                          ? '#007AFF'
                          : isDark
                          ? '#3A3A3C'
                          : '#E5E5EA',
                    },
                  ]}
                  onPress={() => handleIconSelect(icon)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={icon}
                    size={28}
                    color={
                      selectedIcon === icon
                        ? '#FFFFFF'
                        : isDark
                        ? '#FFFFFF'
                        : '#1C1C1E'
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
});