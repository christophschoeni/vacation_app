import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { Icon } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';
import { useChecklists } from '@/hooks/use-checklists';
import { useTranslation } from '@/lib/i18n';

interface ChecklistItemData {
  id: string;
  text: string;
}

export default function CreateChecklistScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { vacationId } = useLocalSearchParams<{ vacationId: string }>();
  const isDark = colorScheme === 'dark';

  const { createChecklist, addItem } = useChecklists(vacationId || '');

  const [title, setTitle] = useState('');
  const [items, setItems] = useState<ChecklistItemData[]>([{ id: '1', text: '' }]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  const handleAddItem = () => {
    const newId = Date.now().toString();
    setItems([...items, { id: newId, text: '' }]);
  };

  const handleUpdateItem = (id: string, text: string) => {
    setItems(items.map(item => item.id === id ? { ...item, text } : item));
  };

  const handleRemoveItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    // Keep at least one empty item
    if (newItems.length === 0) {
      setItems([{ id: Date.now().toString(), text: '' }]);
    } else {
      setItems(newItems);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('vacation.checklists.errors.title_required'));
      return;
    }

    try {
      // Create the checklist
      const checklist = await createChecklist(title.trim());

      // Add non-empty items in order
      const validItems = items.filter(item => item.text.trim());
      for (const item of validItems) {
        await addItem(checklist.id, item.text.trim());
      }

      router.back();
    } catch (error) {
      console.error('Failed to create checklist:', error);
      Alert.alert(t('common.error'), t('vacation.checklists.errors.create'));
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<ChecklistItemData>) => {
    const isDragging = isActive;

    return (
      <ScaleDecorator>
        <View
          style={[styles.itemRow, {
            backgroundColor: isDragging
              ? (isDark ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.08)')
              : focusedId === item.id
              ? (isDark ? '#1C1C1E' : '#F9F9F9')
              : 'transparent',
            marginBottom: 8,
            borderRadius: 8,
            opacity: isDragging ? 0.9 : 1,
          }]}
        >
            <TouchableOpacity
              onPressIn={() => {
                setDraggedItemId(item.id);
                drag();
              }}
              style={styles.dragHandle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name="menu"
                size={20}
                color={isDragging ? '#007AFF' : (isDark ? '#8E8E93' : '#C7C7CC')}
              />
            </TouchableOpacity>

            <View style={[styles.checkbox, {
              borderColor: isDark ? '#3A3A3C' : '#C7C7CC',
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF'
            }]} />

            <TextInput
              style={[styles.itemInput, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}
              value={item.text}
              onChangeText={(text) => handleUpdateItem(item.id, text)}
              placeholder={t('vacation.checklists.create.item_placeholder')}
              placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
              onFocus={() => setFocusedId(item.id)}
              onBlur={() => setFocusedId(null)}
              returnKeyType="next"
              editable={!isDragging}
              onSubmitEditing={() => {
                const isLastItem = items[items.length - 1].id === item.id;
                if (isLastItem && item.text.trim()) {
                  handleAddItem();
                }
              }}
            />

            {items.length > 1 && (
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.id)}
                style={styles.removeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                disabled={isDragging}
              >
                <Icon name="close" size={18} color="#FF3B30" />
              </TouchableOpacity>
            )}
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top', 'bottom']}>
      <AppHeader
        variant="modal"
        title={t('vacation.checklists.create.title')}
        showBack={true}
        onBackPress={handleCancel}
        onRightPress={handleSave}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              {t('vacation.checklists.create.list_name')} <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, {
              backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
              borderColor: isDark ? '#3A3A3C' : '#C7C7CC',
            }]}>
              <TextInput
                style={[styles.titleInput, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}
                value={title}
                onChangeText={setTitle}
                placeholder={t('vacation.checklists.create.list_name_placeholder')}
                placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                autoFocus={true}
              />
            </View>
          </View>

          {/* Items */}
          <View style={styles.section}>
            <View style={styles.itemsHeader}>
              <Text style={[styles.label, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {t('vacation.checklists.create.items')}
              </Text>
              <Text style={[styles.itemsHint, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                {t('vacation.checklists.create.items_hint')}
              </Text>
            </View>

            <View style={styles.itemsList}>
              <DraggableFlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                onDragBegin={() => {}}
                onDragEnd={({ data }) => {
                  setItems(data);
                  setDraggedItemId(null);
                }}
                scrollEnabled={false}
                activationDistance={10}
                dragItemOverflow={true}
              />
            </View>

            {/* Add Item Button */}
            <TouchableOpacity
              onPress={handleAddItem}
              style={styles.addItemButton}
              activeOpacity={0.7}
            >
              <View style={[styles.addItemButtonInner, {
                backgroundColor: isDark ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.1)'
              }]}>
                <Icon name="plus" size={18} color={isDark ? '#0A84FF' : '#007AFF'} />
                <Text style={[styles.addItemButtonText, { color: isDark ? '#0A84FF' : '#007AFF' }]}>
                  {t('vacation.checklists.create.add_item')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'System',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  inputContainer: {
    borderRadius: 10,
    borderWidth: 1,
  },
  titleInput: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemsHint: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  itemsList: {
    gap: 0,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  dragHandle: {
    padding: 4,
    marginRight: 8,
  },
  dropIndicator: {
    height: 2,
    borderRadius: 1,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    marginRight: 12,
  },
  itemInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'System',
    paddingVertical: 0,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  addItemButton: {
    marginTop: 8,
  },
  addItemButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  addItemButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  bottomSpacer: {
    height: 100,
  },
});
