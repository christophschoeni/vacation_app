import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from '@/components/design';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3;

interface SwipeableCardProps {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit?: () => void;
  onPress: () => void;
}

export default function SwipeableCard({ children, onDelete, onEdit, onPress }: SwipeableCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const panRef = useRef<PanGestureHandler>(null);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;

      if (translationX < -SWIPE_THRESHOLD || velocityX < -1000) {
        // Swiped left enough or fast enough - show action buttons
        const actionWidth = onEdit ? -160 : -80; // 80px per button
        Animated.timing(translateX, {
          toValue: actionWidth,
          duration: 250,
          useNativeDriver: true,
        }).start();
      } else {
        // Reset position with spring animation
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 180,
          friction: 12,
        }).start();
      }
    }
  };

  const handleDelete = () => {
    onDelete();
    // Reset position after delete with spring animation
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 180,
      friction: 12,
    }).start();
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler
        ref={panRef}
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            {children}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>

      {/* Action buttons that appear when swiped */}
      <Animated.View
        style={[
          styles.actionsContainer,
          {
            width: onEdit ? 160 : 80,
            opacity: translateX.interpolate({
              inputRange: onEdit ? [-160, -80, 0] : [-80, -40, 0],
              outputRange: [1, 0.5, 0],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        {onEdit && (
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              onEdit();
              resetPosition();
            }}
            activeOpacity={0.8}
          >
            <Icon name="edit" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Icon name="delete" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 12,
  },
  cardContainer: {
    backgroundColor: 'transparent',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80, // Fixed width for equal sizing
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
});