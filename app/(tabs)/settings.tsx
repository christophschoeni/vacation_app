import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassContainer } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Einstellungen
          </Text>
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
        {/* App Einstellungen */}
        <GlassContainer intensity="light" style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            App Einstellungen
          </Text>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Standard-Währung
            </Text>
            <Text style={[styles.settingValue, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              CHF
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Sprache
            </Text>
            <Text style={[styles.settingValue, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              Deutsch
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Theme
            </Text>
            <Text style={[styles.settingValue, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              Automatisch
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Benachrichtigungen
            </Text>
            <Text style={[styles.settingValue, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              Ein
            </Text>
          </View>
        </GlassContainer>

        {/* Daten Verwaltung */}
        <GlassContainer intensity="light" style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Daten Verwaltung
          </Text>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Daten exportieren
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme === 'dark' ? '#aaa' : '#888' }]}>
              Alle Ferien und Checklisten exportieren
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Backup wiederherstellen
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme === 'dark' ? '#aaa' : '#888' }]}>
              Daten aus Backup importieren
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: '#ff4444' }]}>
              Alle Daten löschen
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme === 'dark' ? '#aaa' : '#888' }]}>
              App komplett zurücksetzen
            </Text>
          </View>
        </GlassContainer>

        {/* Template Verwaltung */}
        <GlassContainer intensity="light" style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Template Verwaltung
          </Text>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Standard Templates
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme === 'dark' ? '#aaa' : '#888' }]}>
              Vordefinierte Checklisten verwalten
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Eigene Templates
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme === 'dark' ? '#aaa' : '#888' }]}>
              Benutzerdefinierte Listen bearbeiten
            </Text>
          </View>
        </GlassContainer>

        {/* App Info */}
        <GlassContainer intensity="light" style={styles.settingsCard}>
          <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            App Information
          </Text>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Version
            </Text>
            <Text style={[styles.settingValue, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              1.0.0
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Entwickler
            </Text>
            <Text style={[styles.settingValue, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
              Vacation Assist Team
            </Text>
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
              Support
            </Text>
            <Text style={[styles.settingDescription, { color: colorScheme === 'dark' ? '#aaa' : '#888' }]}>
              Hilfe und Kontakt
            </Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  settingsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  settingDescription: {
    flex: 1,
    fontSize: 12,
    marginTop: 2,
  },
  comingSoon: {
    alignItems: 'center',
    marginTop: 60,
    paddingVertical: 40,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  comingSoonSubtext: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});