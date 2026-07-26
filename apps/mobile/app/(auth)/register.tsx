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

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [displayName, setDisplayName] = useState('');
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
      await signUp(email.trim(), password, displayName.trim() || undefined);
      router.replace('/(tabs)');
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
        >
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            {t('auth.register.title')}
          </Text>
          <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>

          <View style={styles.form}>
            <FormInput
              label={t('auth.register.display_name')}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('auth.register.display_name_placeholder')}
              autoCapitalize="words"
              textContentType="name"
              returnKeyType="next"
            />
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
              required
            />
            <FormInput
              label={t('auth.login.password')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.login.password_placeholder')}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
              required
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
                <Text style={styles.buttonText}>{t('auth.register.submit')}</Text>
              )}
            </Pressable>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{t('auth.register.have_account')}</Text>
              <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={8}>
                <Text style={styles.switchLink}>{t('auth.register.go_login')}</Text>
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
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  switchText: { color: '#8E8E93', fontSize: 15, fontFamily: 'System' },
  switchLink: { color: '#007AFF', fontSize: 15, fontWeight: '600', fontFamily: 'System' },
});
