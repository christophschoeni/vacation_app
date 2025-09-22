import React, { useState } from 'react';
import {
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

export default function BudgetScreen() {
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
            Budget
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
        <GlassContainer intensity="light" style={styles.comingSoon}>
          <Text style={[styles.comingSoonTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            Budget-Verwaltung
          </Text>
          <Text style={[styles.comingSoonText, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
            Hier kannst du deine Reiseausgaben verwalten und dein Budget im Blick behalten.
          </Text>
          <Text style={[styles.comingSoonSubtext, { color: colorScheme === 'dark' ? '#aaa' : '#888' }]}>
            Coming Soon...
          </Text>
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