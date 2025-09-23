import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Button, Icon, IconName } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import IconPicker from '../common/IconPicker';

// Function to get display name for icons
const getIconDisplayName = (iconName: IconName): string => {
  const iconNames: Record<IconName, string> = {
    // Food & Drink
    'restaurant': 'Restaurant',
    'coffee': 'Kaffee',
    'utensils': 'Besteck',
    'wine': 'Wein',
    'beer': 'Bier',
    'ice-cream': 'Eis',
    'pizza': 'Pizza',

    // Transportation
    'car': 'Auto',
    'airplane': 'Flugzeug',
    'bus': 'Bus',
    'train': 'Zug',
    'ship': 'Schiff',
    'bike': 'Fahrrad',
    'fuel': 'Kraftstoff',

    // Accommodation & Places
    'hotel': 'Hotel',
    'home': 'Zuhause',
    'location': 'Standort',
    'mountain': 'Berg',
    'trees': 'Bäume',

    // Shopping & Items
    'shopping': 'Einkaufen',
    'cart': 'Warenkorb',
    'shirt': 'Kleidung',
    'gift': 'Geschenk',
    'camera': 'Kamera',

    // Activities & Entertainment
    'music': 'Musik',
    'gamepad': 'Spiele',
    'book': 'Buch',
    'compass': 'Kompass',

    // Services & Utilities
    'phone': 'Telefon',
    'wifi': 'WLAN',
    'stethoscope': 'Gesundheit',
    'settings': 'Einstellungen',

    // Money & Finance
    'currency': 'Währung',
    'wallet': 'Geldbörse',
    'budget': 'Budget',

    // Time & Weather
    'calendar': 'Kalender',
    'sun': 'Sonne',
    'moon': 'Mond',
    'cloud': 'Wolke',

    // General
    'heart': 'Herz',
    'star': 'Stern',
    'plus': 'Plus',
    'check': 'Häkchen',
    'other': 'Sonstiges',

    // Navigation (fallbacks)
    'arrow-left': 'Pfeil links',
    'arrow-right': 'Pfeil rechts',
    'chevron-right': 'Pfeil rechts',
    'close': 'Schließen',
    'edit': 'Bearbeiten',
    'delete': 'Löschen',
    'search': 'Suchen',
    'filter': 'Filter',
    'more': 'Mehr',
    'menu': 'Menü',
    'back': 'Zurück',
    'refresh': 'Aktualisieren',
    'warning': 'Warnung',
    'error': 'Fehler',
    'success': 'Erfolg',
    'info': 'Info',
    'image': 'Bild',
    'clock': 'Uhr',
    'minus': 'Minus',
    'arrow-up': 'Pfeil hoch',
    'arrow-down': 'Pfeil runter',
    'chevron-left': 'Pfeil links',
    'chevron-up': 'Pfeil hoch',
    'chevron-down': 'Pfeil runter',
    'heart-filled': 'Herz gefüllt',
    'star-filled': 'Stern gefüllt',
  };

  return iconNames[iconName] || 'Icon auswählen';
};

export interface Category {
  id: string;
  name: string;
  icon: IconName;
}

interface CategoryEditorProps {
  visible: boolean;
  category?: Category; // undefined for new category, defined for editing
  onSave: (category: Category) => void;
  onCancel: () => void;
}

export default function CategoryEditor({
  visible,
  category,
  onSave,
  onCancel,
}: CategoryEditorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isEditing = !!category;

  const [name, setName] = useState(category?.name || '');
  const [selectedIcon, setSelectedIcon] = useState<IconName>(category?.icon || 'other');
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      const categoryData: Category = {
        id: category?.id || Date.now().toString(),
        name: name.trim(),
        icon: selectedIcon,
      };
      onSave(categoryData);

      // Reset form
      setName('');
      setSelectedIcon('other');
    }
  };

  const handleCancel = () => {
    setName(category?.name || '');
    setSelectedIcon(category?.icon || 'other');
    onCancel();
  };

  // Reset form when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setName(category?.name || '');
      setSelectedIcon(category?.icon || 'other');
    }
  }, [visible, category]);

  return (
    <>
      <IconPicker
        visible={showIconPicker}
        selectedIcon={selectedIcon}
        onIconSelect={(icon) => {
          console.log('Setting selected icon to:', icon);
          setSelectedIcon(icon);
        }}
        onClose={() => {
          console.log('Closing icon picker');
          setShowIconPicker(false);
        }}
      />

      <Modal
        visible={visible && !showIconPicker}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
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
                {isEditing ? 'Kategorie bearbeiten' : 'Neue Kategorie'}
              </Text>
              <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                <Icon name="close" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? '#FFFFFF' : '#1C1C1E' },
                  ]}
                >
                  Name
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#1C1C1E',
                      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                      borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                    },
                  ]}
                  placeholder="Kategorie-Name eingeben"
                  placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                  value={name}
                  onChangeText={setName}
                  autoFocus={!isEditing}
                />
              </View>

              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? '#FFFFFF' : '#1C1C1E' },
                  ]}
                >
                  Icon
                </Text>
                <TouchableOpacity
                  style={[
                    styles.iconSelector,
                    {
                      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                      borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                    },
                  ]}
                  onPress={() => {
                    console.log('Icon selector pressed, showIconPicker:', showIconPicker);
                    setShowIconPicker(true);
                    console.log('After setting showIconPicker to true');
                  }}
                >
                  <View style={styles.iconPreview}>
                    <Icon
                      name={selectedIcon}
                      size={24}
                      color={isDark ? '#FFFFFF' : '#1C1C1E'}
                    />
                    <Text
                      style={[
                        styles.iconText,
                        { color: isDark ? '#FFFFFF' : '#1C1C1E' },
                      ]}
                    >
                      {getIconDisplayName(selectedIcon)}
                    </Text>
                  </View>
                  <Icon
                    name="chevron-right"
                    size={16}
                    color={isDark ? '#8E8E93' : '#6D6D70'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                title="Abbrechen"
                variant="outline"
                onPress={handleCancel}
                style={styles.actionButton}
              />
              <Button
                title={isEditing ? 'Speichern' : 'Hinzufügen'}
                variant="primary"
                onPress={handleSave}
                disabled={!name.trim()}
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 24,
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    fontFamily: 'System',
  },
  iconSelector: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconText: {
    fontSize: 17,
    fontFamily: 'System',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});