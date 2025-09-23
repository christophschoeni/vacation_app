import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Card } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useVacations } from '@/lib/database';

export default function VacationChecklistsScreen() {
  const { id } = useLocalSearchParams();
  const vacationId = Array.isArray(id) ? id[0] : id;

  const colorScheme = useColorScheme();
  const { vacations } = useVacations();

  const vacation = vacations.find(v => v.id === vacationId);

  if (!vacation) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.placeholderCard}>
          <Text style={[styles.placeholderTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Checklisten für {vacation.destination}
          </Text>
          <Text style={[styles.placeholderText, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
            Hier können Sie Checklisten für diese Ferien verwalten.
            {'\n\n'}
            Funktionen:
            {'\n'}• Neue Checklisten erstellen
            {'\n'}• Vorlagen verwenden
            {'\n'}• Items abhaken
            {'\n'}• Listen teilen
          </Text>
        </Card>
      </ScrollView>
    </View>
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
    paddingBottom: 85, // Reduced space for compact tab bar
  },
  placeholderCard: {
    marginTop: 16,
    marginBottom: 24,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'System',
    lineHeight: 24,
  },
});