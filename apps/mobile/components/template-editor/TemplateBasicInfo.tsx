import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormInput } from '@/components/ui/forms';
import { GroupedList, GroupedListHeader, GroupedListFooter } from '@/components/design';
import { Spacing } from '@/constants/design';
import { useTranslation } from '@/lib/i18n';

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
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <GroupedListHeader title={t('template.editor.basic_info_title')} />

      <GroupedList style={styles.group}>
        <View style={styles.inputWrapper}>
          <FormInput
            label={t('template.editor.name_label')}
            value={title}
            onChangeText={onTitleChange}
            placeholder={t('template.editor.name_placeholder')}
            required
          />

          <FormInput
            label={t('template.editor.description_label')}
            value={description}
            onChangeText={onDescriptionChange}
            placeholder={t('template.editor.description_placeholder')}
            multiline
            numberOfLines={3}
          />
        </View>
      </GroupedList>

      <GroupedListFooter text={t('template.editor.basic_info_footer')} />
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
