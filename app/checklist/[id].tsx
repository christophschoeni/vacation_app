import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { goBack } from '@/lib/utils/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, GroupedList, ProgressBar } from '@/components/design';
import { Spacing, Typography, BorderRadius } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import AppHeader from '@/components/ui/AppHeader';
import { PromptModal } from '@/components/ui/PromptModal';
import { useRouteId } from '@/hooks/use-route-param';
import {
  useChecklist,
  useAddChecklistItem,
  useToggleChecklistItem,
  useDeleteChecklistItem,
  useUpdateChecklist,
} from '@/hooks/queries';
import { ChecklistItem } from '@/types';
import { useTranslation } from '@/lib/i18n';

export default function ChecklistDetailScreen() {
  const checklistId = useRouteId();
  const theme = useIOSTheme();
  const { t } = useTranslation();

  const [newItemText, setNewItemText] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  // Cross-platform prompt (Alert.prompt is iOS-only). Null when closed.
  const [renamePrompt, setRenamePrompt] = useState<{ initialValue: string } | null>(null);

  const { data: checklist } = useChecklist(checklistId);
  const { mutateAsync: addItem } = useAddChecklistItem();
  const { mutateAsync: toggleItem } = useToggleChecklistItem();
  const { mutateAsync: deleteItem } = useDeleteChecklistItem();
  const { mutateAsync: updateChecklist } = useUpdateChecklist();

  if (!checklist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <AppHeader
          title={t('checklist.loading')}
          showBack={true}
          onBackPress={() => goBack('/(tabs)')}
        />
      </SafeAreaView>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      packing: '#007AFF',
      shopping: '#34C759',
      bucket: '#FF9500',
      todo: '#FF3B30',
      planning: '#5856D6',
      general: '#8E8E93',
      custom: '#6D6D70',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const handleAddItem = async () => {
    if (!newItemText.trim()) return;

    try {
      await addItem({ checklistId, text: newItemText.trim() });
      setNewItemText('');
      setIsAddingItem(false);
    } catch {
      Alert.alert(t('common.error'), t('checklist.errors.add_item'));
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      await toggleItem({ checklistId, itemId });
    } catch {
      Alert.alert(t('common.error'), t('checklist.errors.update_item'));
    }
  };

  const handleDeleteItem = async (item: ChecklistItem) => {
    Alert.alert(
      t('checklist.delete_item.title'),
      t('checklist.delete_item.message', { text: item.text }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem({ checklistId, itemId: item.id });
            } catch {
              Alert.alert(t('common.error'), t('checklist.errors.delete_item'));
            }
          },
        },
      ]
    );
  };

  const handleEditTitle = () => {
    setRenamePrompt({ initialValue: checklist.title });
  };

  const submitRename = async (newTitle: string) => {
    if (newTitle?.trim() && newTitle.trim() !== checklist.title) {
      try {
        await updateChecklist({
          id: checklistId,
          title: newTitle.trim(),
        });
      } catch {
        Alert.alert(t('common.error'), t('checklist.errors.update_title'));
      }
    }
  };

  const completedItems = checklist.items.filter((item: ChecklistItem) => item.completed).length;
  const totalItems = checklist.items.length;
  const progress = totalItems > 0 ? completedItems / totalItems : 0;
  const categoryColor = getCategoryColor(checklist.category);

  const sortedItems = [...checklist.items].sort(
    (a: ChecklistItem, b: ChecklistItem) => a.order - b.order
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <AppHeader
        title={checklist.title}
        variant="default"
        showBack={true}
        onBackPress={() => goBack('/(tabs)')}
        leftAction={
          <TouchableOpacity onPress={handleEditTitle}>
            <Icon name="edit" size={20} color={theme.label} />
          </TouchableOpacity>
        }
        rightAction={
          <TouchableOpacity
            onPress={() => setIsAddingItem(!isAddingItem)}
            style={[styles.addButton, { backgroundColor: categoryColor }]}
          >
            <Icon name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      {/* Progress Bar */}
      {totalItems > 0 && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} color={categoryColor} height={4} />
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Add Item Input */}
          {isAddingItem && (
            <View style={[styles.addItemContainer, { backgroundColor: theme.groupedBackground }]}>
              <TextInput
                style={[
                  styles.addItemInput,
                  {
                    color: theme.label,
                    backgroundColor: theme.tile,
                    borderColor: theme.separator,
                  },
                ]}
                placeholder={t('checklist.add_item_placeholder')}
                placeholderTextColor={theme.tertiaryLabel}
                value={newItemText}
                onChangeText={setNewItemText}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddItem}
              />
              <View style={styles.addItemActions}>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddingItem(false);
                    setNewItemText('');
                  }}
                  style={[styles.actionButton, { backgroundColor: theme.tile }]}
                >
                  <Icon name="close" size={16} color={theme.label} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddItem}
                  style={[styles.actionButton, { backgroundColor: theme.success }]}
                >
                  <Icon name="plus" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Items List */}
          {sortedItems.length > 0 && (
            <GroupedList>
              {sortedItems.map((item: ChecklistItem) => (
                <View key={item.id} style={styles.itemContainer}>
                  <TouchableOpacity
                    onPress={() => handleToggleItem(item.id)}
                    style={[
                      styles.itemCheckbox,
                      {
                        backgroundColor: item.completed ? theme.success : 'transparent',
                        borderColor: item.completed ? theme.success : theme.separator,
                      },
                    ]}
                  >
                    <Icon
                      name="check"
                      size={16}
                      color={item.completed ? '#FFFFFF' : 'transparent'}
                    />
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.itemText,
                      {
                        color: item.completed ? theme.secondaryLabel : theme.label,
                        textDecorationLine: item.completed ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {item.text}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item)}
                    style={styles.deleteButton}
                  >
                    <Icon name="close" size={14} color={theme.secondaryLabel} />
                  </TouchableOpacity>
                </View>
              ))}
            </GroupedList>
          )}

          {/* Empty State */}
          {checklist.items.length === 0 && (
            <View style={styles.emptyState}>
              <Icon name={checklist.icon as any} size={48} color={theme.tertiaryLabel} />
              <Text style={[styles.emptyTitle, { color: theme.secondaryLabel }]}>
                {t('checklist.empty.title')}
              </Text>
              <Text style={[styles.emptyDescription, { color: theme.secondaryLabel }]}>
                {t('checklist.empty.description')}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <PromptModal
        visible={renamePrompt !== null}
        title={t('checklist.rename.title')}
        message={t('checklist.rename.prompt')}
        initialValue={renamePrompt?.initialValue}
        confirmLabel={t('common.save')}
        onCancel={() => setRenamePrompt(null)}
        onConfirm={(value) => {
          setRenamePrompt(null);
          submitRename(value);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 20,
  },
  addItemContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.card,
    gap: Spacing.md,
  },
  addItemInput: {
    fontSize: Typography.fontSize.callout,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  addItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  itemCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: Typography.fontSize.callout,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: Spacing['3xl'],
  },
  emptyTitle: {
    fontSize: Typography.fontSize.title3,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: Typography.fontSize.callout,
    textAlign: 'center',
    lineHeight: 22,
  },
});
