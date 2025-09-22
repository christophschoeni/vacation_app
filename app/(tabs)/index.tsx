import React from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '@/components/ui/layout/AppHeader';
import VacationCard from '@/components/ui/cards/VacationCard';
import EmptyState from '@/components/ui/common/EmptyState';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations } from '@/lib/database';

export default function VacationsScreen() {
  const colorScheme = useColorScheme();
  const { vacations, loading, refresh } = useVacations();

  const handleAddVacation = () => {
    router.push('/vacation/add');
  };

  const handleVacationPress = (id: string) => {
    router.push(`/vacation/${id}`);
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#f5f5f5' }]}>
      <AppHeader
        title="Meine Ferien"
        rightButton={{
          title: "Hinzufügen",
          icon: "+",
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
            tintColor={colorScheme === 'dark' ? '#fff' : '#000'}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {vacations.length === 0 ? (
          <EmptyState
            icon="✈️"
            title="Keine Ferien geplant"
            subtitle="Füge deine erste Reise hinzu und beginne mit der Planung!"
            buttonTitle="Erste Ferien hinzufügen"
            onButtonPress={handleAddVacation}
          />
        ) : (
          vacations.map((vacation) => (
            <VacationCard
              key={vacation.id}
              vacation={vacation}
              onPress={handleVacationPress}
            />
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
    paddingBottom: 100,
  },
});