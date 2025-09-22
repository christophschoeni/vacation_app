import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassButton, GlassContainer } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function ChecklistDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  // Sample data based on wireframes
  const checklistTitle = id === '1' ? 'Einpacken' : 'Sonnencreme';

  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', text: 'Socken', completed: true },
    { id: '2', text: 'Unterwäsche', completed: true },
    { id: '3', text: 'Hose', completed: false },
    { id: '4', text: 'T-Shirt', completed: false },
    { id: '5', text: 'Pullover', completed: true },
    { id: '6', text: 'Jacke', completed: false },
    { id: '7', text: 'Schuhe', completed: true },
    { id: '8', text: 'Sonnenbrille', completed: false },
    { id: '9', text: 'Handy-Ladegerät', completed: true },
    { id: '10', text: 'Reisepass', completed: false },
    { id: '11', text: 'Tickets', completed: false },
    { id: '12', text: 'Medikamente', completed: false },
    { id: '13', text: 'Kamera', completed: true },
    { id: '14', text: 'Kopfhörer', completed: false },
    { id: '15', text: 'Buch', completed: false },
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const toggleItem = (itemId: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addNewItem = () => {
    if (!newItemText.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Text ein.');
      return;
    }

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false,
    };

    setItems(prev => [...prev, newItem]);
    setNewItemText('');
  };

  const deleteItem = (itemId: string) => {
    Alert.alert(
      'Item löschen',
      'Möchten Sie dieses Item wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => setItems(prev => prev.filter(item => item.id !== itemId))
        }
      ]
    );
  };

  const completedCount = items.filter(item => item.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  const renderChecklistItem = (item: ChecklistItem) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => toggleItem(item.id)}
      onLongPress={() => deleteItem(item.id)}
      activeOpacity={0.7}
      style={styles.checklistItem}
    >
      <View style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          {
            backgroundColor: item.completed ? '#4CAF50' : 'transparent',
            borderColor: item.completed ? '#4CAF50' : (colorScheme === 'dark' ? '#666' : '#ccc'),
          }
        ]}>
          {item.completed && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
      </View>
      <Text style={[
        styles.itemText,
        {
          color: colorScheme === 'dark' ? '#fff' : '#000',
          textDecorationLine: item.completed ? 'line-through' : 'none',
          opacity: item.completed ? 0.6 : 1,
        }
      ]}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={colorScheme === 'dark'
          ? ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)']
          : ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)']
        }
        style={styles.header}
      >
        <GlassContainer intensity="light" style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.backButton, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
                ← Zurück
              </Text>
            </TouchableOpacity>
            <Text style={[styles.progressText, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              {completedCount}/{items.length}
            </Text>
          </View>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            {checklistTitle}
          </Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: progressPercent === 100 ? '#4CAF50' : '#2196F3'
                  }
                ]}
              />
            </View>
            <Text style={[styles.progressPercentText, { color: colorScheme === 'dark' ? '#aaa' : '#888' }]}>
              {progressPercent}%
            </Text>
          </View>
        </GlassContainer>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colorScheme === 'dark' ? '#fff' : '#000'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <GlassContainer intensity="light" style={styles.itemsCard}>
          <View style={styles.addItemContainer}>
            <TextInput
              style={[styles.addItemInput, {
                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: colorScheme === 'dark' ? '#fff' : '#000',
              }]}
              value={newItemText}
              onChangeText={setNewItemText}
              placeholder="Neues Item hinzufügen..."
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              onSubmitEditing={addNewItem}
              returnKeyType="done"
            />
            <GlassButton
              title="+"
              onPress={addNewItem}
              size="small"
              style={styles.addButton}
            />
          </View>

          <View style={styles.itemsList}>
            {items.map(renderChecklistItem)}
          </View>
        </GlassContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    paddingVertical: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  itemsCard: {
    marginTop: 16,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  addItemInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  itemsList: {
    gap: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});