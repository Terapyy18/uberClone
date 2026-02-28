import { supabase } from '@/lib/supabase';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { setSession as setReduxSession } from '@/store/slices/authSlice';
import { store } from '@/store/store';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Provider } from 'react-redux';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      store.dispatch(setReduxSession(session));
      setLoading(false);
    }).catch((e) => {
      console.warn("Erreur Supabase getSession (probablement liée à AsyncStorage):", e);
      // On arrête le chargement même si AsyncStorage échoue
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      store.dispatch(setReduxSession(session));
    });

    return () => subscription.unsubscribe();
  }, []);



  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </StripeProvider>
    </Provider>
  );
}
