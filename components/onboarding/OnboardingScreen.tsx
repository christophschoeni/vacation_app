import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import OnboardingSlide from './OnboardingSlide';
import { IconName } from '@/components/design/Icon';
import { useTranslation } from '@/lib/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideData {
  id: string;
  icon: IconName;
  titleKey: string;
  textKey: string;
}

const slides: SlideData[] = [
  { id: '1', icon: 'airplane', titleKey: 'onboarding.slide1.title', textKey: 'onboarding.slide1.text' },
  { id: '2', icon: 'compass', titleKey: 'onboarding.slide2.title', textKey: 'onboarding.slide2.text' },
  { id: '3', icon: 'wallet', titleKey: 'onboarding.slide3.title', textKey: 'onboarding.slide3.text' },
  { id: '4', icon: 'clipboard-list', titleKey: 'onboarding.slide4.title', textKey: 'onboarding.slide4.text' },
  { id: '5', icon: 'settings', titleKey: 'onboarding.slide5.title', textKey: 'onboarding.slide5.text' },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderSlide = ({ item }: { item: SlideData }) => (
    <View style={{ width: SCREEN_WIDTH }}>
      <OnboardingSlide
        icon={item.icon}
        title={t(item.titleKey)}
        text={t(item.textKey)}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
      edges={['top', 'bottom']}
    >
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const animatedStyle = useAnimatedStyle(() => {
              const isActive = currentIndex === index;
              return {
                width: withSpring(isActive ? 32 : 8, { damping: 15 }),
                opacity: withSpring(isActive ? 1 : 0.3, { damping: 15 }),
              };
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: isDark ? '#FFFFFF' : '#007AFF' },
                  animatedStyle,
                ]}
              />
            );
          })}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {currentIndex < slides.length - 1 ? (
            <>
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={[styles.skipText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                  {t('onboarding.skip')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNext}
                style={[styles.nextButton, { backgroundColor: '#007AFF' }]}
              >
                <Text style={styles.nextText}>{t('onboarding.next')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={onComplete}
              style={[styles.getStartedButton, { backgroundColor: '#007AFF' }]}
            >
              <Text style={styles.getStartedText}>{t('onboarding.getStarted')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'System',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  getStartedButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
});