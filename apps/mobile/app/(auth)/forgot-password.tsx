import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput } from '@/components/ui/forms';
import { requestPasswordReset } from '@/lib/api/auth';
import { authErrorKey } from '@/lib/api/auth-errors';
import { useTranslation } from '@/lib/i18n';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      // The backend always returns 200 (no account enumeration), so we always
      // move on to the code-entry screen, carrying the email along.
      router.replace({ pathname: '/(auth)/reset-password', params: { email: email.trim() } });
    } catch (e) {
      setError(t(authErrorKey(e)));
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
            {t('auth.forgot.title')}
          </Text>
          <Text style={styles.subtitle}>{t('auth.forgot.subtitle')}</Text>

          <View style={styles.form}>
            <FormInput
              label={t('auth.login.email')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.login.email_placeholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
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
                <Text style={styles.buttonText}>{t('auth.forgot.submit')}</Text>
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
