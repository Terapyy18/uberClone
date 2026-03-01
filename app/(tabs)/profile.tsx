import RideHistoryCard from '@/components/RideHistoryCard';
import EditProfileModal from '@/components/profile/EditProfileModal';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileMenu from '@/components/profile/ProfileMenu';
import { selectRideHistory } from '@/store/slices/navSlice';
import { fetchProfile } from '@/store/slices/profileSlice';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

/**
 * Page Profil — layout minimaliste
 * Affiche le ProfileHeader et délègue toutes les actions au ProfileMenu.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, session } = useAppSelector((state) => state.auth);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const rideHistory = useSelector(selectRideHistory);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader onMenuPress={() => setMenuVisible(true)} />

      {!isAuthenticated || !session?.user ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Vous devez être connecté pour pouvoir commander et afficher vos commandes
          </Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.historyScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.historyTitle}>Historique de vos courses</Text>
          {rideHistory && rideHistory.length > 0 ? (
            rideHistory.map((ride: any, index: number) => (
              <RideHistoryCard key={index} ride={ride} />
            ))
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.infoText}>Aucune course récente effectuée.</Text>
            </View>
          )}
        </ScrollView>
      )}

      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
      />

      <ProfileMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onEditPress={() => setEditModalVisible(true)}
        session={session}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  infoText: { color: '#9ca3af', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, paddingHorizontal: 32 },
  emptyStateText: { color: '#6b7280', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  loginBtn: { backgroundColor: '#111827', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  historyScroll: { paddingHorizontal: 20, paddingBottom: 100 },
  historyTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginVertical: 20 },
  emptyHistory: { alignItems: 'center', marginTop: 40 },
});
