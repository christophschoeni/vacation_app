import React from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { insights } from 'expo-insights';

import { Colors, Icon } from '@/components/design';
import SwipeableCard from '@/components/ui/SwipeableCard';
import VacationCard from '@/components/ui/cards/VacationCard';
import EmptyState from '@/components/ui/common/EmptyState';
import AppHeader from '@/components/ui/AppHeader';
import { useColorScheme } from 'react-native';
import { useVacations } from '@/hooks/use-vacations';

export default function VacationsScreen() {
  const colorScheme = useColorScheme();
  const { vacations, loading, refreshVacations, deleteVacation } = useVacations();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refreshVacations();
    }, [refreshVacations])
  );

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refreshVacations();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshVacations]);

  const handleAddVacation = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (insights && typeof insights.track === 'function') {
        insights.track('vacation_add_started');
      }
    } catch (error) {
      console.warn('Failed to track vacation add:', error);
    }
    router.push('/vacation/add');
  };

  const handleVacationPress = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (insights && typeof insights.track === 'function') {
        insights.track('vacation_viewed');
      }
    } catch (error) {
      console.warn('Failed to track vacation view:', error);
    }
    router.push(`/vacation/${id}`);
  };

  const handleVacationEdit = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/vacation/${id}/settings`);
  };


  const handleVacationDelete = (id: string) => {
    const vacation = vacations.find(v => v.id === id);
    if (!vacation) return;

    Alert.alert(
      'Ferien löschen',
      `Möchten Sie die Ferien "${vacation.destination}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVacation(id);
            } catch {
              Alert.alert('Fehler', 'Ferien konnten nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={['top']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || loading}
            onRefresh={handleRefresh}
            tintColor={isDark ? '#fff' : '#000'}
            colors={[Colors.primary[500]]}
            progressBackgroundColor={isDark ? Colors.dark.surface : Colors.light.surface}
          />
        }
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Liste der Ferien"
        accessibilityHint="Ziehen Sie nach unten, um zu aktualisieren"
      >
        {/* iOS-style large title in content area */}
        <View style={styles.titleSection}>
          <Text style={[styles.largeTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Meine Ferien
          </Text>
        </View>

        {vacations.length === 0 ? (
          <EmptyState
            icon="airplane"
            title="Keine Ferien geplant"
            subtitle="Füge deine erste Reise hinzu und beginne mit der Planung!"
            buttonTitle="Erste Ferien hinzufügen"
            onButtonPress={handleAddVacation}
          />
        ) : (
          vacations.map((vacation) => (
            <SwipeableCard
              key={vacation.id}
              onPress={() => handleVacationPress(vacation.id)}
              onDelete={() => handleVacationDelete(vacation.id)}
            >
              <VacationCard
                vacation={vacation}
                onPress={() => handleVacationPress(vacation.id)}
                onLongPress={() => handleVacationEdit(vacation.id)}
              />
            </SwipeableCard>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button - iOS Style */}
      <TouchableOpacity
        style={[styles.floatingActionButton, { backgroundColor: isDark ? '#1C1C1E' : '#007AFF' }]}
        onPress={handleAddVacation}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Neue Ferien hinzufügen"
        accessibilityHint="Doppeltippen, um neue Ferien zu erstellen"
        accessibilityRole="button"
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 0, // Already has padding from content
    paddingTop: 8,
    paddingBottom: 16,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'System',
    lineHeight: 41,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 85, // Space for native tab bar
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});