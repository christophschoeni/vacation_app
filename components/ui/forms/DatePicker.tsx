import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from 'react-native';

interface DatePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  required?: boolean;
  error?: string;
  mode?: 'date' | 'time' | 'datetime';
}

export default function DatePicker({
  label,
  value,
  onChange,
  required = false,
  error,
  mode = 'date',
}: DatePickerProps) {
  const colorScheme = useColorScheme();
  const [show, setShow] = useState(Platform.OS === 'ios'); // iOS: always show, Android: show on demand

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Android: close picker after selection or dismissal
    if (Platform.OS === 'android') {
      setShow(false);
    }

    // Update date only if user selected a date (not dismissed)
    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    }
  };

  const showPicker = () => {
    if (Platform.OS === 'android') {
      setShow(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
        {`${label}${required ? ' *' : ''}`}
      </Text>

      {Platform.OS === 'android' ? (
        <>
          <TouchableOpacity
            style={[
              styles.androidButton,
              {
                backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }
            ]}
            onPress={showPicker}
          >
            <Text style={[styles.androidButtonText, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
              {mode === 'datetime'
                ? value.toLocaleString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : mode === 'time'
                ? value.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
                : value.toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })
              }
            </Text>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={value}
              mode={mode}
              is24Hour={true}
              display="default"
              onChange={handleDateChange}
            />
          )}
        </>
      ) : (
        <DateTimePicker
          testID="dateTimePicker"
          value={value}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
          style={styles.picker}
        />
      )}

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
    fontFamily: 'System',
  },
  picker: {
    alignSelf: 'flex-start',
  },
  androidButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  androidButtonText: {
    fontSize: 16,
    fontFamily: 'System',
  },
  error: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
});