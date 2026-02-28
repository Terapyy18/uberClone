import EditProfileModal from '@/components/profile/EditProfileModal';
import PaymentSection from '@/components/profile/PaymentSection';
import ProfileHeader from '@/components/profile/ProfileHeader';
import RideHistorySection from '@/components/profile/RideHistorySection';
import { supabase } from '@/lib/supabase';
import { selectRideHistory } from '@/store/slices/navSlice';
import { useAppSelector } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

export default function ProfileScreen() {
  const { session, isAuthenticated } = useAppSelector((state) => state.auth);
  const rideHistory = useSelector(selectRideHistory);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <ProfileHeader session={session} isAuthenticated={isAuthenticated} />

        {isAuthenticated && session?.user ? (
          <View style={styles.content}>
            <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
              <Ionicons name="person-outline" size={18} color="#fff" />
              <Text style={styles.editButtonText}>Modifier mon profil</Text>
            </TouchableOpacity>

            <PaymentSection session={session} />
            <RideHistorySection rideHistory={rideHistory} />

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color="#dc2626" />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="person-circle-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateText}>Aucune donnée utilisateur.</Text>
          </View>
        )}
      </View>

      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        session={session}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, gap: 16 },
  editButton: {
    backgroundColor: '#111827', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 12,
  },
  editButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#fee2e2', paddingVertical: 14,
    borderRadius: 12, marginBottom: 16,
  },
  logoutText: { color: '#dc2626', fontSize: 15, fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyStateText: { color: '#6b7280', fontSize: 16 },
});
