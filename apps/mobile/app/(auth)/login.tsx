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
import { useAuth } from '@/contexts/AuthContext';
import { authErrorKey } from '@/lib/api/auth-errors';
import { useTranslation } from '@/lib/i18n';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      // No manual navigation: signing in flips isAuthenticated, and the auth
      // guard in the root layout swaps the (auth) group for the app.
      await signIn(email.trim(), password);
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
            {t('auth.login.title')}
          </Text>
          <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>

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
              returnKeyType="next"
            />
            <FormInput
              label={t('auth.login.password')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.login.password_placeholder')}
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
                <Text style={styles.buttonText}>{t('auth.login.submit')}</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              hitSlop={8}
              style={styles.forgotRow}
            >
              <Text style={styles.switchLink}>{t('auth.forgot_link')}</Text>
            </Pressable>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{t('auth.login.no_account')}</Text>
              <Pressable onPress={() => router.replace('/(auth)/register')} hitSlop={8}>
                <Text style={styles.switchLink}>{t('auth.login.go_register')}</Text>
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
  error: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: 'System',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '600', fontFamily: 'System' },
  forgotRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  switchText: { color: '#8E8E93', fontSize: 15, fontFamily: 'System' },
  switchLink: { color: '#007AFF', fontSize: 15, fontWeight: '600', fontFamily: 'System' },
});
