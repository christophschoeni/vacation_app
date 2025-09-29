import React from 'react';
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/design';
import AppHeader from '@/components/ui/AppHeader';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F8F8F8' }]}>
      <AppHeader
        title="Entdecken"
        variant="large"
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="clean" style={[styles.placeholderCard, styles.placeholderContent]}>
          <Text style={styles.placeholderIcon}>🌍</Text>
          <Text style={[styles.placeholderTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Reise-Inspiration
          </Text>
          <Text style={[styles.placeholderText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Entdecke neue Reiseziele, finde Inspiration für deine nächsten Ferien und erhalte Tipps für unvergessliche Erlebnisse.
          </Text>
        </Card>

        <Card variant="clean" style={[styles.placeholderCard, styles.placeholderContent]}>
          <Text style={styles.placeholderIcon}>💡</Text>
          <Text style={[styles.placeholderTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Budget-Tipps
          </Text>
          <Text style={[styles.placeholderText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Erhalte wertvolle Tipps, wie du dein Reisebudget optimal planst und während der Reise im Blick behältst.
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
    paddingTop: 16,
    paddingBottom: 120, // Space for tab bar
  },
  placeholderCard: {
    marginBottom: 16,
  },
  placeholderContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'System',
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    fontFamily: 'System',
  },
});