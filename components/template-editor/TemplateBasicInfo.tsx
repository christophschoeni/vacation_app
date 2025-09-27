import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormInput } from '@/components/ui/forms';
import { ChecklistCategory } from '@/types';

interface TemplateBasicInfoProps {
  title: string;
  description: string;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  isDark: boolean;
}

export function TemplateBasicInfo({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  isDark,
}: TemplateBasicInfoProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
          GRUNDINFORMATIONEN
        </Text>
        <Text style={[styles.sectionDescription, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
          Name und Beschreibung Ihrer Standard-Liste
        </Text>
      </View>

      <View style={[styles.inputGroup, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <FormInput
          label="Titel"
          value={title}
          onChangeText={onTitleChange}
          placeholder="Name der Standard-Liste"
          required
        />

        <FormInput
          label="Beschreibung"
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Optionale Beschreibung"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
  inputGroup: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});