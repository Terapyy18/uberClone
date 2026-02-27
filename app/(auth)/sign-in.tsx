import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [resetStep, setResetStep] = React.useState<'email' | 'code'>('email');
  const [resetEmail, setResetEmail] = React.useState('');
  const [resetCode, setResetCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [resetLoading, setResetLoading] = React.useState(false);
  const [resetError, setResetError] = React.useState('');

  const onSignInPress = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailAddress,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect. Veuillez réessayer.');
        } else {
          setError(error.message);
        }
      } else {
        router.replace('/(tabs)/profile' as any);
      }
    } catch (err: any) {
      setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onResetStep1 = async () => {
    if (!resetEmail) {
      setResetError('Veuillez entrer votre email');
      return;
    }

    setResetLoading(true);
    setResetError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
      if (error) throw error;

      setResetStep('code');
    } catch (err: any) {
      console.error(err);
      setResetError(err.message || 'Une erreur est survenue.');
    } finally {
      setResetLoading(false);
    }
  };

  const onResetStep2 = async () => {
    if (!resetCode || !newPassword) {
      setResetError('Veuillez remplir tous les champs');
      return;
    }

    setResetLoading(true);
    setResetError('');
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: resetCode,
        type: 'recovery',
      });

      if (error) throw error;

      if (data.session) {
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (updateError) throw updateError;

        setShowForgotPassword(false);
        router.replace('/(tabs)' as any);
      } else {
        setResetError('La vérification a échoué. Code invalide ?');
      }
    } catch (err: any) {
      console.error(err);
      setResetError(err.message || 'Code incorrect ou expiré.');
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setResetStep('email');
    setResetError('');
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Bienvenue</Text>
        <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>

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

          <View>
            <Input
              label="Mot de passe"
              value={password}
              placeholder="••••••••"
              isPassword
              autoComplete="password"
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
            />
            <TouchableOpacity onPress={() => setShowForgotPassword(true)} style={styles.forgotPassword}>
              <Text style={styles.linkText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Se connecter"
            onPress={onSignInPress}
            loading={loading}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <Link href="/(auth)/sign-up">
            <Text style={styles.linkText}>S'inscrire</Text>
          </Link>
        </View>
      </View>

      <Modal
        visible={showForgotPassword}
        animationType="slide"
        transparent={true}
        onRequestClose={closeForgotPassword}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {resetStep === 'email' ? 'Mot de passe oublié' : 'Vérification'}
              </Text>
              <TouchableOpacity onPress={closeForgotPassword}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {resetStep === 'email'
                ? "Entrez votre email pour recevoir un code de réinitialisation."
                : "Entrez le code reçu par email et votre nouveau mot de passe."}
            </Text>

            {resetError ? <Text style={styles.mainError}>{resetError}</Text> : null}

            {resetStep === 'email' ? (
              <View>
                <Input
                  label="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={resetEmail}
                  placeholder="exemple@email.com"
                  onChangeText={setResetEmail}
                />
                <Button
                  title="Envoyer le code"
                  onPress={onResetStep1}
                  loading={resetLoading}
                  style={styles.modalButton}
                />
              </View>
            ) : (
              <View>
                <Input
                  label="Code de vérification"
                  value={resetCode}
                  placeholder="123456"
                  keyboardType="number-pad"
                  onChangeText={setResetCode}
                />

                <Input
                  label="Nouveau mot de passe"
                  value={newPassword}
                  placeholder="••••••••"
                  isPassword
                  onChangeText={setNewPassword}
                />

                <Button
                  title="Réinitialiser"
                  onPress={onResetStep2}
                  loading={resetLoading}
                  style={styles.modalButton}
                />
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 8,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  modalButton: {
    marginTop: 16,
  },
});
