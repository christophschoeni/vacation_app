import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Icon } from '@/components/design';
import { useColorScheme } from 'react-native';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  deleteText?: string;
  editText?: string;
}

export default function SwipeableRow({
  children,
  onDelete,
  onEdit,
  deleteText = 'Löschen',
  editText = 'Bearbeiten',
}: SwipeableRowProps) {
  const colorScheme = useColorScheme();

  if (!onDelete && !onEdit) {
    return <>{children}</>;
  }

  const handleMorePress = () => {
    const actions = [];
    if (onEdit) actions.push({ text: editText, onPress: onEdit });
    if (onDelete) actions.push({ text: deleteText, onPress: onDelete, style: 'destructive' });

    Alert.alert('Aktionen', undefined, [
      ...actions,
      { text: 'Abbrechen', style: 'cancel' }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={handleMorePress}
          style={styles.moreButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name="more"
            size={20}
            color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  actionsContainer: {
    marginLeft: 8,
  },
  moreButton: {
    padding: 8,
    borderRadius: 20,
  },
});