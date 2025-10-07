import { Colors, Icon } from '@/components/design';
import React, { useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3;

interface SwipeableCardProps {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit: () => void;
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
        const actionWidth = -128; // 2 buttons à 56px + 2x 8px gap = 128px
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

  const handleEdit = () => {
    onEdit();
    // Reset position after edit with spring animation
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
      {/* Action buttons that appear when swiped - positioned behind the card */}
      <Animated.View
        style={[
          styles.actionsContainer,
          {
            width: 128, // 2 buttons à 56px + 2x 8px gap = 128px
            opacity: translateX.interpolate({
              inputRange: [-128, -64, 0],
              outputRange: [1, 0.5, 0],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleEdit}
          activeOpacity={0.8}
        >
          <Icon name="edit" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Icon name="delete" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  cardContainer: {
    backgroundColor: 'transparent',
    zIndex: 1, // Ensure card appears above action buttons
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 16, // Match the marginBottom of the VacationCard
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 0, // Behind the card
    paddingLeft: 8, // 8px gap between card and button
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: '100%',
    marginHorizontal: 0,
    marginLeft: 8, // 8px gap between buttons
    borderRadius: 12,
  },
  editButton: {
    backgroundColor: '#007AFF', // iOS System Blue for edit actions
  },
  deleteButton: {
    backgroundColor: '#FF3B30', // iOS System Red for destructive actions
  },
});