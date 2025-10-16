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
  const [currentMode, setCurrentMode] = useState<'date' | 'time'>('date'); // For Android datetime mode
  const [tempDate, setTempDate] = useState(value); // Temporary date for Android datetime mode

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      // Android datetime mode requires two pickers
      if (mode === 'datetime') {
        if (event.type === 'set' && selectedDate) {
          if (currentMode === 'date') {
            // Date selected, now show time picker
            setTempDate(selectedDate);
            setCurrentMode('time');
            setShow(true);
          } else {
            // Time selected, combine with date and finish
            setShow(false);
            setCurrentMode('date');
            onChange(selectedDate);
          }
        } else {
          // User cancelled
          setShow(false);
          setCurrentMode('date');
        }
      } else {
        // Single mode (date or time)
        setShow(false);
        if (event.type === 'set' && selectedDate) {
          onChange(selectedDate);
        }
      }
    } else {
      // iOS: always update the date (inline picker)
      if (selectedDate) {
        onChange(selectedDate);
      }
    }
  };

  const showPicker = () => {
    if (Platform.OS === 'android') {
      setTempDate(value);
      setCurrentMode(mode === 'datetime' ? 'date' : mode);
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
              value={currentMode === 'time' && mode === 'datetime' ? tempDate : value}
              mode={currentMode}
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