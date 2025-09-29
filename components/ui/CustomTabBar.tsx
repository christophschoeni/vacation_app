import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useSegments } from 'expo-router';
import { Icon } from '@/components/design';
import { useRouteParam } from '@/hooks/use-route-param';
import * as Haptics from 'expo-haptics';

interface TabItem {
  name: string;
  label: string;
  icon: string;
  route: string;
}

interface CustomTabBarProps {
  tabs: TabItem[];
  rightAction?: React.ReactNode;
}

export default function CustomTabBar({ tabs, rightAction }: CustomTabBarProps) {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const vacationId = useRouteParam('id');
  const isDark = colorScheme === 'dark';

  const currentTab = segments[segments.length - 1] || 'index';

  const handleTabPress = async (tab: TabItem) => {
    if (currentTab === tab.name) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(tab.route);
  };

  return (
    <View style={styles.container}>
      <BlurView
        intensity={100}
        tint={isDark ? 'systemUltraThinMaterialDark' : 'systemUltraThinMaterialLight'}
        style={styles.blurView}
      >
        <SafeAreaView
          edges={['bottom']}
          style={[
            styles.tabBarContent,
            {
              borderTopColor: isDark
                ? 'rgba(84, 84, 88, 0.3)'
                : 'rgba(60, 60, 67, 0.12)',
            }
          ]}
        >
          <View style={styles.tabBarInner}>
            {/* Left: Tab Navigation */}
            <View style={styles.tabsContainer}>
              {tabs.map((tab) => {
                const isActive = currentTab === tab.name;

                return (
                  <TouchableOpacity
                    key={tab.name}
                    style={[
                      styles.tabItem,
                      isActive && [
                        styles.activeTab,
                        {
                          backgroundColor: isDark
                            ? 'rgba(10, 132, 255, 0.2)'
                            : 'rgba(0, 122, 255, 0.15)'
                        }
                      ]
                    ]}
                    onPress={() => handleTabPress(tab)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={tab.icon as any}
                      size={20}
                      color={
                        isActive
                          ? '#007AFF'
                          : isDark
                            ? '#8E8E93'
                            : '#6D6D70'
                      }
                    />
                    <Text
                      style={[
                        styles.tabLabel,
                        {
                          color: isActive
                            ? '#007AFF'
                            : isDark
                              ? '#8E8E93'
                              : '#6D6D70',
                          fontWeight: isActive ? '600' : '500'
                        }
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Right: Action Area */}
            {rightAction && (
              <View style={styles.actionArea}>
                {rightAction}
              </View>
            )}
          </View>
        </SafeAreaView>
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
  },
  blurView: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabBarContent: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  activeTab: {
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 13,
    fontFamily: 'System',
  },
  actionArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});