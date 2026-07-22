import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormInput } from '@/components/ui/forms';
import { GroupedList, GroupedListHeader, GroupedListFooter } from '@/components/design';
import { Spacing } from '@/constants/design';

interface TemplateBasicInfoProps {
  title: string;
  description: string;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
}

export function TemplateBasicInfo({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
}: TemplateBasicInfoProps) {
  return (
    <View style={styles.section}>
      {/* TODO i18n: GRUNDINFORMATIONEN */}
      <GroupedListHeader title="Grundinformationen" />

      <GroupedList style={styles.group}>
        <View style={styles.inputWrapper}>
          <FormInput
            // TODO i18n: Titel
            label="Titel"
            value={title}
            onChangeText={onTitleChange}
            // TODO i18n: Name der Standard-Liste
            placeholder="Name der Standard-Liste"
            required
          />

          <FormInput
            // TODO i18n: Beschreibung
            label="Beschreibung"
            value={description}
            onChangeText={onDescriptionChange}
            // TODO i18n: Optionale Beschreibung
            placeholder="Optionale Beschreibung"
            multiline
            numberOfLines={3}
          />
        </View>
      </GroupedList>

      {/* TODO i18n: Name und Beschreibung Ihrer Standard-Liste */}
      <GroupedListFooter text="Name und Beschreibung Ihrer Standard-Liste" />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.md,
  },
  group: {
    marginTop: Spacing.xs,
  },
  inputWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
});
