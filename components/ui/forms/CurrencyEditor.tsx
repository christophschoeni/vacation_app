import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Button, Icon } from '@/components/design';
import { useColorScheme } from 'react-native';
import { useTranslation } from '@/lib/i18n';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface CurrencyEditorProps {
  visible: boolean;
  onSave: (currency: Currency) => void;
  onCancel: () => void;
}

export default function CurrencyEditor({
  visible,
  onSave,
  onCancel,
}: CurrencyEditorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useTranslation();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [flag, setFlag] = useState('');

  const handleSave = () => {
    if (code.trim() && name.trim() && symbol.trim() && flag.trim()) {
      const currency: Currency = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        symbol: symbol.trim(),
        flag: flag.trim(),
      };
      onSave(currency);

      // Reset form
      setCode('');
      setName('');
      setSymbol('');
      setFlag('');
    }
  };

  const handleCancel = () => {
    setCode('');
    setName('');
    setSymbol('');
    setFlag('');
    onCancel();
  };

  // Reset form when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setCode('');
      setName('');
      setSymbol('');
      setFlag('');
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            },
          ]}
        >
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: isDark ? '#FFFFFF' : '#1C1C1E' },
              ]}
            >
              {t('components.currency_editor.title')}
            </Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Icon name="close" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.formGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? '#FFFFFF' : '#1C1C1E' },
                ]}
              >
                {t('components.currency_editor.code_label')}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: isDark ? '#FFFFFF' : '#1C1C1E',
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                  },
                ]}
                placeholder={t('components.currency_editor.code_placeholder')}
                placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
                maxLength={5}
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? '#FFFFFF' : '#1C1C1E' },
                ]}
              >
                {t('components.currency_editor.name_label')}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: isDark ? '#FFFFFF' : '#1C1C1E',
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                  },
                ]}
                placeholder={t('components.currency_editor.name_placeholder')}
                placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? '#FFFFFF' : '#1C1C1E' },
                ]}
              >
                {t('components.currency_editor.symbol_label')}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: isDark ? '#FFFFFF' : '#1C1C1E',
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                  },
                ]}
                placeholder={t('components.currency_editor.symbol_placeholder')}
                placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                value={symbol}
                onChangeText={setSymbol}
                maxLength={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text
                style={[
                  styles.label,
                  { color: isDark ? '#FFFFFF' : '#1C1C1E' },
                ]}
              >
                {t('components.currency_editor.flag_label')}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: isDark ? '#FFFFFF' : '#1C1C1E',
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                    borderColor: isDark ? '#3A3A3C' : '#E5E5EA',
                  },
                ]}
                placeholder={t('components.currency_editor.flag_placeholder')}
                placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                value={flag}
                onChangeText={setFlag}
                maxLength={4}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              title={t('common.cancel')}
              variant="outline"
              onPress={handleCancel}
              style={styles.actionButton}
            />
            <Button
              title={t('common.add')}
              variant="primary"
              onPress={handleSave}
              disabled={!code.trim() || !name.trim() || !symbol.trim() || !flag.trim()}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    borderRadius: 16,
    paddingTop: 24,
    paddingBottom: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'System',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 24,
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'System',
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    fontFamily: 'System',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});