import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon } from '@/components/design';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleTabPress = async (route: any, isFocused: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const getIconName = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'airplane';
      case 'explore':
        return 'compass';
      case 'settings':
        return 'settings';
      default:
        return 'circle';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.unifiedPillWrapper}>
        <BlurView
          intensity={100}
          tint={isDark ? 'dark' : 'light'}
          style={styles.unifiedPillBlur}
        />
        <View
          style={[
            styles.unifiedPillOverlay,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.15)'
                : 'rgba(255, 255, 255, 0.8)',
            },
          ]}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const iconName = getIconName(route.name);

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => handleTabPress(route, isFocused)}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <Icon
                  name={iconName}
                  size={24}
                  color={
                    isFocused
                      ? '#007AFF' // iOS Blue
                      : isDark
                        ? '#8E8E93'
                        : '#6D6D70'
                  }
                />
                {/* Optional: Add label under icon */}
                {/* <Text style={[styles.tabLabel, { color: isFocused ? '#007AFF' : isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {route.name === 'index' ? 'Home' : route.name === 'settings' ? 'Settings' : route.name}
                </Text> */}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  unifiedPillWrapper: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  unifiedPillBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  unifiedPillOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 16,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 56,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});