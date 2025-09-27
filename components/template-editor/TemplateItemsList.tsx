import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Icon } from '@/components/design';
import { FormInput } from '@/components/ui/forms';
import { ChecklistItem } from '@/types';

interface TemplateItemsListProps {
  items: ChecklistItem[];
  onAddItem: (text: string) => void;
  onUpdateItem: (itemId: string, text: string) => void;
  onDeleteItem: (itemId: string) => void;
  isDark: boolean;
}

export function TemplateItemsList({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  isDark,
}: TemplateItemsListProps) {
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
      'Element löschen',
      `Möchten Sie "${item.text}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => onDeleteItem(item.id),
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          ELEMENTE ({items.length})
        </Text>
        <Text style={[styles.sectionDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
          Erstellen Sie Elemente für Ihre Standard-Liste
        </Text>
      </View>

      <View style={[styles.itemsContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        {/* Add new item */}
        <View style={styles.addItemContainer}>
          <FormInput
            value={newItemText}
            onChangeText={setNewItemText}
            placeholder="Neues Element hinzufügen..."
            onSubmitEditing={handleAddItem}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              { opacity: newItemText.trim() ? 1 : 0.5 }
            ]}
            onPress={handleAddItem}
            disabled={!newItemText.trim()}
          >
            <Icon name="plus" size={20} color="#007AFF" />
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
                  { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5E5' }
                ]}
              >
                <View style={styles.itemNumber}>
                  <Text style={[styles.itemNumberText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    {index + 1}
                  </Text>
                </View>

                <View style={styles.itemContent}>
                  {editingItemId === item.id ? (
                    <View style={styles.editingContainer}>
                      <FormInput
                        value={editingItemText}
                        onChangeText={setEditingItemText}
                        onSubmitEditing={handleSaveEdit}
                        autoFocus
                        returnKeyType="done"
                      />
                      <View style={styles.editingActions}>
                        <TouchableOpacity onPress={handleSaveEdit} style={styles.editAction}>
                          <Icon name="check" size={16} color="#34C759" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCancelEdit} style={styles.editAction}>
                          <Icon name="x" size={16} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.itemTextContainer}
                      onPress={() => handleEditItem(item)}
                    >
                      <Text style={[styles.itemText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
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
                      <Icon name="edit-2" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteItem(item)}
                      style={styles.actionButton}
                    >
                      <Icon name="trash-2" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
              Noch keine Elemente hinzugefügt.
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#6D6D70' : '#8E8E93' }]}>
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
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
  itemsContainer: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    marginLeft: 12,
    padding: 8,
  },
  itemsList: {
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  itemNumber: {
    width: 32,
    alignItems: 'center',
  },
  itemNumberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    lineHeight: 22,
  },
  itemActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editingActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  editAction: {
    padding: 8,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});