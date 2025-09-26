import { Card, Icon } from '@/components/design';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function VacationSettingsScreen() {
  const { id } = useLocalSearchParams();
  const vacationId = Array.isArray(id) ? id[0] : id;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Always show the settings menu, even if vacation is loading
  // The navigation already handles vacation not found cases

  // Settings items configuration - modular and expandable
  const settingsItems = [
    {
      id: 'vacation-details',
      title: 'Ferien Details',
      subtitle: 'Reiseziel, Hotel, Datum und Budget bearbeiten',
      icon: 'settings' as const,
      route: './edit',
    },
    // Future settings items can be added here:
    // {
    //   id: 'notifications',
    //   title: 'Benachrichtigungen',
    //   subtitle: 'Erinnerungen für diese Ferien',
    //   icon: 'bell',
    //   route: `/vacation/${vacationId}/notifications`,
    // },
    // {
    //   id: 'sharing',
    //   title: 'Teilen',
    //   subtitle: 'Ferien mit anderen teilen',
    //   icon: 'share',
    //   route: `/vacation/${vacationId}/sharing`,
    // },
  ];

  const handleSettingsPress = (route: string) => {
    console.log('Settings Debug:', {
      route,
      vacationId,
      id,
      typeof_id: typeof id
    });
    router.push(route as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Allgemein
          </Text>

          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleSettingsPress(item.route)}
              activeOpacity={0.7}
            >
              <Card variant="clean" style={styles.settingsCard}>
                <View style={styles.settingsRow}>
                  <View style={styles.settingsInfo}>
                    <Icon name={item.icon} size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                    <View style={styles.settingsText}>
                      <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.settingsSubtitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    fontFamily: 'System',
  },
  settingsCard: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'System',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'System',
    textAlign: 'center',
  },
});