import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { router, useSegments } from 'expo-router';
import { Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouteParam } from '@/hooks/use-route-param';
import * as Haptics from 'expo-haptics';

export default function ModernTabBar() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const vacationId = useRouteParam('id');
  const isDark = colorScheme === 'dark';

  const currentTab = segments[segments.length - 1];

  const tabs = [
    { name: 'index', label: 'Budget', icon: 'budget' },
    { name: 'checklists', label: 'Listen', icon: 'checklist' },
    { name: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const handleTabPress = async (tabName: string) => {
    if (currentTab === tabName) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (tabName === 'index') {
      router.push(`/vacation/${vacationId}`);
    } else {
      router.push(`/vacation/${vacationId}/${tabName}`);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView
        intensity={100}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <View style={[
          styles.tabBar,
          {
            backgroundColor: isDark
              ? 'rgba(28, 28, 30, 0.8)'
              : 'rgba(255, 255, 255, 0.8)',
            borderTopColor: isDark
              ? 'rgba(84, 84, 88, 0.3)'
              : 'rgba(60, 60, 67, 0.12)',
          }
        ]}>
          {tabs.map((tab) => {
            const isActive = currentTab === tab.name;

            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tabItem}
                onPress={() => handleTabPress(tab.name)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.tabIconContainer,
                  isActive && {
                    backgroundColor: isDark
                      ? 'rgba(10, 132, 255, 0.15)'
                      : 'rgba(0, 122, 255, 0.15)',
                  }
                ]}>
                  <Icon
                    name={tab.icon as any}
                    size={24}
                    color={
                      isActive
                        ? '#007AFF'
                        : isDark
                          ? '#8E8E93'
                          : '#6D6D70'
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive
                        ? '#007AFF'
                        : isDark
                          ? '#8E8E93'
                          : '#6D6D70',
                    }
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  blurContainer: {
    flex: 1,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: 'System',
    textAlign: 'center',
  },
});