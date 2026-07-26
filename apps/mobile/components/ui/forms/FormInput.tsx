import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Card, Icon } from '@/components/design';

type PassthroughTextInputProps = Pick<
  TextInputProps,
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'autoFocus'
  | 'maxLength'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'onBlur'
  | 'onFocus'
  | 'editable'
  | 'secureTextEntry'
  | 'textContentType'
>;

interface FormInputProps extends PassthroughTextInputProps {
  label?: string;
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
  secureTextEntry,
  ...textInputProps
}: FormInputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Password fields start hidden and can be revealed with the eye toggle.
  const [revealed, setRevealed] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          {label}{required && ' *'}
        </Text>
      ) : null}

      <Card style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
            secureTextEntry={isPassword && !revealed}
            {...textInputProps}
            style={[
              styles.input,
              {
                color: isDark ? '#FFFFFF' : '#1C1C1E',
                height: multiline ? numberOfLines * 22 + 16 : 44,
              },
            ]}
          />

          {isPassword ? (
            <Pressable
              onPress={() => setRevealed((v) => !v)}
              hitSlop={10}
              accessibilityRole="button"
              style={styles.eyeButton}
            >
              <Icon
                name={revealed ? 'eye-off' : 'eye'}
                size={20}
                color={isDark ? '#8E8E93' : '#6D6D70'}
              />
            </Pressable>
          ) : null}
        </View>
      </Card>

      {error && <Text style={styles.error}>{error}</Text>}
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'System',
    textAlignVertical: 'top',
  },
  eyeButton: {
    paddingLeft: 12,
    height: 44,
    justifyContent: 'center',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'System',
  },
});
