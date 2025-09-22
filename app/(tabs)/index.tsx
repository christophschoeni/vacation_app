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

import { Header, Card, Button, FloatingActionButton, Colors } from '@/components/design';
import SwipeableCard from '@/components/ui/SwipeableCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations } from '@/lib/database';

export default function VacationsScreen() {
  const colorScheme = useColorScheme();
  const { vacations, loading, refresh, deleteVacation } = useVacations();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const handleAddVacation = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/vacation/add');
  };

  const handleVacationPress = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
      <Header title="Meine Ferien" />

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
      >
        {vacations.length === 0 ? (
          <Card style={styles.emptyState}>
            <View style={styles.emptyContent}>
              <Text style={styles.emptyIcon}>✈️</Text>
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Keine Ferien geplant
              </Text>
              <Text style={[styles.emptySubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Füge deine erste Reise hinzu und beginne mit der Planung!
              </Text>
              <Button
                title="Erste Ferien hinzufügen"
                onPress={handleAddVacation}
                style={styles.emptyButton}
              />
            </View>
          </Card>
        ) : (
          vacations.map((vacation) => (
            <SwipeableCard
              key={vacation.id}
              onPress={() => handleVacationPress(vacation.id)}
              onEdit={() => handleVacationEdit(vacation.id)}
              onDelete={() => handleVacationDelete(vacation.id)}
            >
              <Card style={styles.vacationCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.destinationContainer}>
                    <Text style={[styles.destination, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {vacation.destination}
                    </Text>
                    <Text style={[styles.country, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                      {vacation.country}
                    </Text>
                  </View>
                  <Text style={[styles.dates, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                    {vacation.startDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })} - {vacation.endDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <View style={styles.hotelContainer}>
                  <Text style={styles.hotelIcon}>🏨</Text>
                  <Text style={[styles.hotel, { color: isDark ? '#D1D1D6' : '#48484A' }]}>
                    {vacation.hotel}
                  </Text>
                </View>
              </Card>
            </SwipeableCard>
          ))
        )}
      </ScrollView>

      <FloatingActionButton
        icon="plus"
        style={styles.fab}
        onPress={handleAddVacation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 120, // Space for new tab bar
  },
  emptyState: {
    marginTop: 60,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    maxWidth: 280,
    fontFamily: 'System',
  },
  emptyButton: {
    minWidth: 200,
  },
  vacationCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  destinationContainer: {
    flex: 1,
  },
  destination: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'System',
  },
  country: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'System',
  },
  dates: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
    fontFamily: 'System',
  },
  hotelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hotelIcon: {
    fontSize: 16,
  },
  hotel: {
    fontSize: 15,
    fontWeight: '400',
    flex: 1,
    fontFamily: 'System',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 100, // Above tab bar
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});