import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{`${label}${required ? ' *' : ''}`}</Text>

      <DateTimePicker
        testID="dateTimePicker"
        value={value}
        mode="date"
        is24Hour={true}
        display="default"
        onChange={handleDateChange}
        style={styles.picker}
      />

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1C1C1E',
    fontFamily: 'System',
  },
  picker: {
    alignSelf: 'flex-start',
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
});