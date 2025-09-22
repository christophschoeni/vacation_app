import React from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  View,
  Text,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header, Card, Button } from '@/components/ui/modern';
import VacationCard from '@/components/ui/cards/VacationCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations } from '@/lib/database';

export default function VacationsScreen() {
  const colorScheme = useColorScheme();
  const { vacations, loading, refresh, deleteVacation } = useVacations();

  const handleAddVacation = () => {
    router.push('/vacation/add');
  };

  const handleVacationPress = (id: string) => {
    router.push(`/vacation/${id}`);
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
            } catch (error) {
              Alert.alert('Fehler', 'Ferien konnten nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F8F8F8' }]}>
      <Header
        title="Meine Ferien"
        rightButton={{
          title: "Hinzufügen",
          onPress: handleAddVacation,
          variant: "primary"
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor={isDark ? '#fff' : '#000'}
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
            <Card
              key={vacation.id}
              onPress={() => handleVacationPress(vacation.id)}
              onLongPress={() => handleVacationDelete(vacation.id)}
              style={styles.vacationCard}
            >
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
          ))
        )}
      </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 100,
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
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
});