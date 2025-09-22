import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { GlassContainer } from '@/components/glass';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
  error?: string;
}

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  required = false,
  error,
}: FormInputProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E' }]}>
        {label}{required && ' *'}
      </Text>

      <GlassContainer intensity="light" style={styles.inputContainer}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colorScheme === 'dark' ? '#8E8E93' : '#6D6D70'}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            {
              color: colorScheme === 'dark' ? '#FFFFFF' : '#1C1C1E',
              height: multiline ? numberOfLines * 22 + 16 : 44,
            }
          ]}
        />
      </GlassContainer>

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
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  input: {
    fontSize: 16,
    fontFamily: 'System',
    textAlignVertical: 'top',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'System',
  },
});