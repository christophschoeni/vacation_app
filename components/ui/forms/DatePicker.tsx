import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GlassContainer } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  required?: boolean;
  error?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  required = false,
  error,
}: DatePickerProps) {
  const colorScheme = useColorScheme();

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('de-DE', options);
  };

  const handleDatePress = () => {
    // TODO: Implement native date picker
    // For now, just increment by one day for demo
    const newDate = new Date(value);
    newDate.setDate(newDate.getDate() + 1);
    onChange(newDate);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
        {label}{required && ' *'}
      </Text>

      <TouchableOpacity onPress={handleDatePress}>
        <GlassContainer intensity="light" style={styles.dateContainer}>
          <Text style={[styles.dateText, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
            {formatDate(value)}
          </Text>
          <Text style={[styles.chevron, { color: colorScheme === 'dark' ? '#8E8E93' : '#6D6D70' }]}>
            ›
          </Text>
        </GlassContainer>
      </TouchableOpacity>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
  },
  dateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'System',
  },
  chevron: {
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'System',
  },
});