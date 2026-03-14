import { useAppSelector } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    onMenuPress: () => void;
}

export default function ProfileHeader({ onMenuPress }: Props) {
    const { session, isAuthenticated } = useAppSelector((state) => state.auth);

    const initials = session?.user?.user_metadata?.full_name
        ? session.user.user_metadata.full_name[0].toUpperCase()
        : session?.user?.email?.[0].toUpperCase() || '?';

    const displayName = session?.user?.user_metadata?.full_name || 'Utilisateur';
    const email = session?.user?.email || '';

    return (
        <View style={styles.header}>
            {/* Avatar + nom */}
            <View style={styles.avatarRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.nameCol}>
                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.email} numberOfLines={1}>{email}</Text>
                </View>
            </View>

            {/* Droite : badge + bouton menu */}
            <View style={styles.rightCol}>
                <View style={[styles.badge, { backgroundColor: isAuthenticated ? '#dcfce7' : '#fee2e2' }]}>
                    <Text style={[styles.badgeText, { color: isAuthenticated ? '#166534' : '#991b1b' }]}>
                        {isAuthenticated ? 'Connecté' : 'Déconnecté'}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.menuBtn}
                    onPress={onMenuPress}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="menu" size={22} color="#374151" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    avatar: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#111827',
        justifyContent: 'center', alignItems: 'center',
        flexShrink: 0,
    },
    avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
    nameCol: { flex: 1 },
    name: { fontSize: 17, fontWeight: '700', color: '#111827' },
    email: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    rightCol: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    menuBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center', alignItems: 'center',
    },
});
