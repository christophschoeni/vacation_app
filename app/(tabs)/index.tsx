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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import insights from 'expo-insights';

import { Colors, Icon } from '@/components/design';
import SwipeableCard from '@/components/ui/SwipeableCard';
import VacationCard from '@/components/ui/cards/VacationCard';
import EmptyState from '@/components/ui/common/EmptyState';
import AppHeader from '@/components/ui/AppHeader';
import { useColorScheme } from 'react-native';
import { useVacations } from '@/hooks/use-vacations';
import { useTranslation } from '@/lib/i18n';

export default function VacationsScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { vacations, loading, refreshVacations, deleteVacation } = useVacations();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const insets = useSafeAreaInsets();

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
      // Analytics tracking failed - silent fail
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
      // Analytics tracking failed - silent fail
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
      t('vacation.delete.title'),
      t('vacation.delete.message', { destination: vacation.destination }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVacation(id);
            } catch {
              Alert.alert(t('common.error'), t('vacation.delete.error'));
            }
          },
        },
      ]
    );
  };

  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]} edges={[]}>
      <AppHeader
        title={t('navigation.vacations')}
        variant="large"
        useSafeAreaPadding={true}
        rightAction={
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleAddVacation}
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel={t('vacation.add.button')}
            accessibilityRole="button"
          >
            <View style={[styles.headerButtonInner, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 122, 255, 0.1)' }]}>
              <Icon name="plus" size={18} color={isDark ? '#FFFFFF' : '#007AFF'} />
            </View>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
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
        accessibilityLabel={t('navigation.vacations')}
        accessibilityHint={t('empty_states.refresh')}
      >

        {vacations.length === 0 ? (
          <EmptyState
            icon="airplane"
            title={t('vacation.empty.title')}
            subtitle={t('vacation.empty.subtitle')}
            buttonTitle={t('vacation.empty.button')}
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
              />
            </SwipeableCard>
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
    // paddingBottom is set dynamically in contentContainerStyle with safe area insets
  },
  headerButton: {
    marginRight: -8,
  },
  headerButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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