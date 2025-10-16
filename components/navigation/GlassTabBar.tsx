import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

interface GlassTabBarProps extends BottomTabBarProps {
  activeTintColor?: string;
  inactiveTintColor?: string;
}

export default function GlassTabBar({
  state,
  descriptors,
  navigation,
  activeTintColor = '#007AFF',
  inactiveTintColor = '#8E8E93',
}: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[
      styles.container,
      {
        paddingBottom: insets.bottom,
        borderTopColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
        // Android fallback: solid background with transparency
        backgroundColor: Platform.OS === 'android'
          ? isDark
            ? 'rgba(28, 28, 30, 0.95)'  // iOS systemBackground dark
            : 'rgba(255, 255, 255, 0.95)' // iOS systemBackground light
          : 'transparent',
      }
    ]}>
      {Platform.OS === 'ios' && (
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = async () => {
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

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Get icon names from options
          const iconConfig = options.tabBarIcon as any;
          const sfSymbol = iconConfig?.sfSymbol || 'circle';
          const ioniconName = iconConfig?.ionicon || 'ellipse-outline';

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {Platform.OS === 'ios' ? (
                <SymbolView
                  name={sfSymbol}
                  size={24}
                  tintColor={isFocused ? activeTintColor : inactiveTintColor}
                  type="hierarchical"
                  weight={isFocused ? 'semibold' : 'regular'}
                  style={styles.icon}
                />
              ) : (
                <Ionicons
                  name={ioniconName as any}
                  size={24}
                  color={isFocused ? activeTintColor : inactiveTintColor}
                  style={styles.icon}
                />
              )}
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? activeTintColor : inactiveTintColor,
                    fontWeight: isFocused ? '600' : '400',
                  },
                ]}
              >
                {label}
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
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor is set dynamically in component for dark mode support
    overflow: 'hidden',
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 49,
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontFamily: 'System',
  },
});
