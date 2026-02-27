import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

export default function SignUpScreen() {
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSignUpPress = async () => {
    setError('');
    setLoading(true);

    try {
      const { error, data } = await supabase.auth.signUp({
        email: emailAddress,
        password,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Cette adresse email est déjà utilisée. Connectez-vous.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user && !data.session) {
        setPendingVerification(true);
      } else if (data.session) {
        router.replace('/(tabs)' as any);
      }

    } catch (err: any) {
      setError('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: emailAddress,
        token: code,
        type: 'signup'
      });

      if (error) {
        setError('Le code de vérification est incorrect ou a expiré.');
        return;
      }

      if (data.session) {
        router.replace('/(tabs)' as any);
      } else {
        setError('Vérification réussie mais session non active. Connectez-vous.');
        setTimeout(() => router.replace('/(auth)/sign-in' as any), 2000);
      }
    } catch (err: any) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>
            Nous avons envoyé un code de vérification à votre adresse email
          </Text>

          <View style={styles.formContainer}>
            {error ? <Text style={styles.mainError}>{error}</Text> : null}

            <Input
              label="Code de vérification"
              value={code}
              placeholder="Entrez le code à 6 chiffres"
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(text) => {
                setCode(text);
                setError('');
              }}
            />

            <Button
              title="Vérifier"
              onPress={onVerifyPress}
              loading={loading}
              style={styles.submitButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez-nous dès aujourd'hui</Text>

        <View style={styles.formContainer}>
          {error ? <Text style={styles.mainError}>{error}</Text> : null}

          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={emailAddress}
            placeholder="exemple@email.com"
            onChangeText={(text) => {
              setEmailAddress(text);
              setError('');
            }}
          />

          <Input
            label="Mot de passe"
            value={password}
            placeholder="••••••••"
            isPassword
            autoComplete="password-new"
            onChangeText={(text) => {
              setPassword(text);
              setError('');
            }}
          />

          <Button
            title="Créer un compte"
            onPress={onSignUpPress}
            loading={loading}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <Link href="/(auth)/sign-in">
            <Text style={styles.linkText}>Se connecter</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  formContainer: {
    gap: 8,
  },
  mainError: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitButton: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  linkText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  }
});
