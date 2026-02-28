import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
    session: any;
    isAuthenticated: boolean;
}

export default function ProfileHeader({ session, isAuthenticated }: Props) {
    const initials = session?.user?.user_metadata?.full_name
        ? session.user.user_metadata.full_name[0].toUpperCase()
        : session?.user?.email?.[0].toUpperCase() || '?';

    const displayName = session?.user?.user_metadata?.full_name || 'Utilisateur';
    const email = session?.user?.email || '';

    return (
        <View style={styles.header}>
            <View style={styles.avatarRow}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View>
                    <Text style={styles.name}>{displayName}</Text>
                    <Text style={styles.email}>{email}</Text>
                </View>
            </View>
            <View style={[styles.badge, { backgroundColor: isAuthenticated ? '#dcfce7' : '#fee2e2' }]}>
                <Text style={[styles.badgeText, { color: isAuthenticated ? '#166534' : '#991b1b' }]}>
                    {isAuthenticated ? 'Connecté' : 'Déconnecté'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: {
        width: 52, height: 52, borderRadius: 26,
        backgroundColor: '#111827',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
    name: { fontSize: 17, fontWeight: '700', color: '#111827' },
    email: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: '600' },
});
