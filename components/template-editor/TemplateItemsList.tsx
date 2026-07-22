import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Icon, GroupedListHeader } from '@/components/design';
import { FormInput } from '@/components/ui/forms';
import { BorderRadius, Spacing, Typography } from '@/constants/design';
import { useIOSTheme } from '@/constants/ios-theme';
import { ChecklistItem } from '@/types';

interface TemplateItemsListProps {
  items: ChecklistItem[];
  onAddItem: (text: string) => void;
  onUpdateItem: (itemId: string, text: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export function TemplateItemsList({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: TemplateItemsListProps) {
  const theme = useIOSTheme();
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  const handleAddItem = () => {
    if (newItemText.trim()) {
      onAddItem(newItemText.trim());
      setNewItemText('');
    }
  };

  const handleEditItem = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const handleSaveEdit = () => {
    if (editingItemId && editingItemText.trim()) {
      onUpdateItem(editingItemId, editingItemText.trim());
      setEditingItemId(null);
      setEditingItemText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemText('');
  };

  const handleDeleteItem = (item: ChecklistItem) => {
    Alert.alert(
      // TODO i18n: Element löschen
      'Element löschen',
      // TODO i18n: Möchten Sie "..." wirklich löschen?
      `Möchten Sie "${item.text}" wirklich löschen?`,
      [
        // TODO i18n: Abbrechen
        { text: 'Abbrechen', style: 'cancel' },
        {
          // TODO i18n: Löschen
          text: 'Löschen',
          style: 'destructive',
          onPress: () => onDeleteItem(item.id),
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      {/* TODO i18n: ELEMENTE (n) */}
      <GroupedListHeader title={`Elemente (${items.length})`} />

      <View style={[styles.itemsContainer, { backgroundColor: theme.groupedBackground }]}>
        {/* Add new item */}
        <View style={styles.addItemContainer}>
          <View style={styles.addInput}>
            <FormInput
              value={newItemText}
              onChangeText={setNewItemText}
              // TODO i18n: Neues Element hinzufügen...
              placeholder="Neues Element hinzufügen..."
              onSubmitEditing={handleAddItem}
              returnKeyType="done"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.addButton,
              { opacity: newItemText.trim() ? 1 : 0.5 }
            ]}
            onPress={handleAddItem}
            disabled={!newItemText.trim()}
          >
            <Icon name="plus" size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>

        {/* Items list */}
        {items.length > 0 ? (
          <View style={styles.itemsList}>
            {items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.itemRow,
                  { borderBottomColor: theme.separator }
                ]}
              >
                <View style={styles.itemNumber}>
                  <Text style={[styles.itemNumberText, { color: theme.secondaryLabel }]}>
                    {index + 1}
                  </Text>
                </View>

                <View style={styles.itemContent}>
                  {editingItemId === item.id ? (
                    <View style={styles.editingContainer}>
                      <View style={styles.editInput}>
                        <FormInput
                          value={editingItemText}
                          onChangeText={setEditingItemText}
                          onSubmitEditing={handleSaveEdit}
                          autoFocus
                          returnKeyType="done"
                        />
                      </View>
                      <View style={styles.editingActions}>
                        <TouchableOpacity onPress={handleSaveEdit} style={styles.editAction}>
                          <Icon name="check" size={16} color={theme.success} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCancelEdit} style={styles.editAction}>
                          <Icon name="x" size={16} color={theme.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.itemTextContainer}
                      onPress={() => handleEditItem(item)}
                    >
                      <Text style={[styles.itemText, { color: theme.label }]}>
                        {item.text}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {editingItemId !== item.id && (
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      onPress={() => handleEditItem(item)}
                      style={styles.actionButton}
                    >
                      <Icon name="edit-2" size={16} color={theme.secondaryLabel} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item)}
                      style={styles.actionButton}
                    >
                      <Icon name="trash-2" size={16} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            {/* TODO i18n: Noch keine Elemente hinzugefügt. */}
            <Text style={[styles.emptyText, { color: theme.secondaryLabel }]}>
              Noch keine Elemente hinzugefügt.
            </Text>
            {/* TODO i18n: Fügen Sie Elemente hinzu, die in jeder neuen Checklist aus dieser Vorlage erscheinen sollen. */}
            <Text style={[styles.emptySubtext, { color: theme.tertiaryLabel }]}>
              Fügen Sie Elemente hinzu, die in jeder neuen Checklist aus dieser Vorlage erscheinen sollen.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.md,
  },
  itemsContainer: {
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    marginTop: Spacing.xs,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
  },
  addButton: {
    marginLeft: Spacing.md,
    marginBottom: Spacing.xl,
    padding: Spacing.sm,
  },
  itemsList: {
    marginTop: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemNumber: {
    width: 32,
    alignItems: 'center',
  },
  itemNumberText: {
    fontSize: Typography.fontSize.footnote,
    fontWeight: '500',
  },
  itemContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: Typography.fontSize.callout,
    lineHeight: 22,
  },
  itemActions: {
    flexDirection: 'row',
    marginLeft: Spacing.md,
  },
  actionButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
  },
  editingActions: {
    flexDirection: 'row',
    marginLeft: Spacing.md,
  },
  editAction: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    fontSize: Typography.fontSize.callout,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.footnote,
    textAlign: 'center',
    lineHeight: 20,
  },
});
