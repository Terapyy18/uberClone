import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/store';
import React from 'react';
import { Button, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { session, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', padding: 24 }}>
      <View>
        <Text>Mon Profil</Text>

        <Text>
          Statut Redux : {isAuthenticated ? 'Connecté 🟢' : 'Déconnecté 🔴'}
        </Text>

        {isAuthenticated && session?.user ? (
          <View>
            <Text>Email: {session.user.email}</Text>
            <Text>ID: {session.user.id}</Text>

            <Button title="Se déconnecter" onPress={handleLogout} color="red" />
          </View>
        ) : (
          <Text>Aucune donnée utilisateur.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}
