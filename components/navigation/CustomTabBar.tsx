import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabItem = {
  name: string;
  title: string;
  icon: string;
};

type CustomTabBarProps = {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabName: string) => void;
  position?: 'bottom' | 'top';
};

export default function CustomTabBar({ tabs, activeTab, onTabPress, position = 'bottom' }: CustomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const activeTintColor = '#007AFF';
  const inactiveTintColor = isDark ? '#8E8E93' : '#8E8E93';

  return (
    <View
      style={[
        styles.container,
        position === 'bottom' ? styles.bottomContainer : styles.topContainer,
        position === 'bottom' && { paddingBottom: insets.bottom || 20 },
      ]}
    >
      <BlurView
        intensity={100}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          const color = isActive ? activeTintColor : inactiveTintColor;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => onTabPress(tab.name)}
              activeOpacity={0.7}
            >
              {Platform.OS === 'ios' ? (
                <SymbolView
                  name={tab.icon}
                  size={24}
                  tintColor={color}
                  type="hierarchical"
                  weight={isActive ? 'semibold' : 'regular'}
                />
              ) : (
                <SymbolView
                  name={tab.icon}
                  size={24}
                  tintColor={color}
                />
              )}
              <Text
                style={[
                  styles.tabLabel,
                  { color },
                  isActive && styles.tabLabelActive,
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    elevation: 0,
  },
  bottomContainer: {
    bottom: 0,
    height: 85,
  },
  topContainer: {
    top: 0,
    height: 85,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    flex: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'System',
    fontWeight: '500',
    marginTop: 4,
  },
  tabLabelActive: {
    fontWeight: '600',
  },
});
