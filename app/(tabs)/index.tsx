import React from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  View,
  Text,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { insights } from 'expo-insights';

import { FloatingActionButton, Colors } from '@/components/design';
import SwipeableCard from '@/components/ui/SwipeableCard';
import VacationCard from '@/components/ui/cards/VacationCard';
import EmptyState from '@/components/ui/common/EmptyState';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          Meine Ferien
        </Text>
      </View>

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
              onEdit={() => handleVacationEdit(vacation.id)}
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

      <FloatingActionButton
        icon="plus"
        style={styles.fab}
        onPress={handleAddVacation}
        accessible={true}
        accessibilityLabel="Neue Ferien hinzufügen"
        accessibilityHint="Doppeltippen, um neue Ferien zu erstellen"
        accessibilityRole="button"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'System',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 80, // Reduced space for tab bar
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 85, // Above tab bar - adjusted for smaller tab bar
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});