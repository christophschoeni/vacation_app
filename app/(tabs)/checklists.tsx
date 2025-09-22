import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard, GlassButton, GlassContainer } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ChecklistsScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);

  // Sample data matching wireframe
  const [checklists] = useState([
    {
      id: '1',
      title: 'Einpacken',
      category: 'general',
      itemCount: 15,
      completedCount: 8,
      items: [
        { id: '1', text: 'Socken', completed: true },
        { id: '2', text: 'Unterwäsche', completed: true },
        { id: '3', text: 'T-Shirt', completed: false },
        // ... more items
      ]
    },
    {
      id: '2',
      title: 'Sonnencreme',
      category: 'beach',
      itemCount: 5,
      completedCount: 2,
      items: [
        { id: '1', text: 'LSF 30+', completed: true },
        { id: '2', text: 'After Sun', completed: false },
        // ... more items
      ]
    }
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleAddChecklist = () => {
    console.log('Add checklist pressed');
  };

  const handleChecklistPress = (id: string) => {
    router.push(`/checklist/${id}`);
  };

  const renderChecklistCard = (checklist: any) => {
    const progressPercent = Math.round((checklist.completedCount / checklist.itemCount) * 100);

    return (
      <GlassCard
        key={checklist.id}
        onPress={() => handleChecklistPress(checklist.id)}
        style={styles.checklistCard}
        intensity="light"
      >
        <View style={styles.checklistHeader}>
          <Text style={[styles.checklistTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            {checklist.title}
          </Text>
          <Text style={[styles.checklistProgress, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
            {checklist.completedCount}/{checklist.itemCount}
          </Text>
        </View>

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
          <Text style={[styles.progressText, { color: colorScheme === 'dark' ? '#aaa' : '#888' }]}>
            {progressPercent}%
          </Text>
        </View>
      </GlassCard>
    );
  };

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
            <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Checklisten
            </Text>
            <GlassButton
              title="+"
              onPress={handleAddChecklist}
              size="small"
              style={styles.addButton}
            />
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
        {checklists.map(renderChecklistCard)}
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  checklistCard: {
    marginBottom: 16,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  checklistProgress: {
    fontSize: 14,
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
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },
});