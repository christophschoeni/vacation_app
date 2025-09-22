import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('de-DE', options);
  };

  const handleDatePress = () => {
    setShowPicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
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

      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={handleDateChange}
          themeVariant={colorScheme}
        />
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