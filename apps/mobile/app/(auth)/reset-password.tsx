import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput } from '@/components/ui/forms';
import { ApiError } from '@/lib/api/client';
import { confirmPasswordReset } from '@/lib/api/auth';
import { authErrorKey } from '@/lib/api/auth-errors';
import { useTranslation } from '@/lib/i18n';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    code.trim().length === 6 && newPassword.length > 0 && !submitting && !!email;

  const handleSubmit = async () => {
    if (!canSubmit || !email) return;
    setError(null);
    setSubmitting(true);
    try {
      await confirmPasswordReset(email, code.trim(), newPassword);
      Alert.alert(t('auth.reset.success'));
      router.replace('/(auth)/login');
    } catch (e) {
      // A bad/expired code is the expected 400 here; anything else falls back
      // to the shared network/general message.
      setError(
        e instanceof ApiError && e.status === 400
          ? t('auth.reset_errors.invalid_code')
          : t(authErrorKey(e)),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('auth.reset.title')}
          </Text>
          <Text style={styles.subtitle}>{t('auth.reset.subtitle')}</Text>

          <View style={styles.form}>
            <FormInput
              label={t('auth.reset.code')}
              value={code}
              onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder={t('auth.reset.code_placeholder')}
              keyboardType="numeric"
              maxLength={6}
              returnKeyType="next"
            />
            <FormInput
              label={t('auth.reset.new_password')}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('auth.reset.new_password_placeholder')}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[styles.button, { opacity: canSubmit ? 1 : 0.5 }]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t('auth.reset.submit')}</Text>
              )}
            </Pressable>

            <View style={styles.switchRow}>
              <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
                <Text style={styles.switchLink}>{t('auth.forgot.back_to_login')}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  title: { fontSize: 34, fontWeight: '700', fontFamily: 'System', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#8E8E93', fontFamily: 'System', marginBottom: 32 },
  form: { marginTop: 8 },
  error: { color: '#FF3B30', fontSize: 14, fontFamily: 'System', marginBottom: 16 },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600', fontFamily: 'System' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchLink: { color: '#007AFF', fontSize: 15, fontWeight: '600', fontFamily: 'System' },
});
