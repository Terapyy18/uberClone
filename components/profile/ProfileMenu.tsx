import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MenuItem {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    sublabel?: string;
    color?: string;
    bg?: string;
    onPress: () => void;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onEditPress: () => void;
    session: any;
}

export default function ProfileMenu({ visible, onClose, onEditPress, session }: Props) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        onClose();
        Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Déconnexion', style: 'destructive',
                onPress: async () => { await supabase.auth.signOut(); },
            },
        ]);
    };

    const navigate = (path: string) => {
        onClose();
        setTimeout(() => router.push(path as any), 200);
    };

    // ── Sections du menu ────────────────────────────────────────────────────
    const accountItems: MenuItem[] = [
        {
            id: 'edit',
            icon: 'person-outline',
            label: 'Modifier mon profil',
            sublabel: session?.user?.user_metadata?.full_name || session?.user?.email || '',
            onPress: () => { onClose(); setTimeout(onEditPress, 200); },
        },
        {
            id: 'payment',
            icon: 'card-outline',
            label: 'Moyens de paiement',
            sublabel: 'Ajouter ou gérer vos cartes',
            onPress: () => { onClose(); },
        },
    ];

    const legalItems: MenuItem[] = [
        {
            id: 'cgu',
            icon: 'document-text-outline',
            label: 'Conditions générales',
            onPress: () => navigate('/(legal)/cgu'),
        },
        {
            id: 'privacy',
            icon: 'shield-checkmark-outline',
            label: 'Politique de confidentialité',
            onPress: () => navigate('/(legal)/privacy-policy'),
        },
        {
            id: 'mentions',
            icon: 'information-circle-outline',
            label: 'Mentions légales',
            onPress: () => navigate('/(legal)/mentions-legales'),
        },
        {
            id: 'tracking',
            icon: 'eye-outline',
            label: 'Suivi publicitaire',
            onPress: () => navigate('/(legal)/tracking'),
        },
    ];

    const dangerItems: MenuItem[] = [
        {
            id: 'logout',
            icon: 'log-out-outline',
            label: 'Se déconnecter',
            color: '#dc2626',
            bg: '#fee2e2',
            onPress: handleLogout,
        },
        {
            id: 'delete',
            icon: 'trash-outline',
            label: 'Supprimer mon compte',
            color: '#7f1d1d',
            bg: '#fef2f2',
            onPress: () => navigate('/(legal)/delete-account'),
        },
    ];

    const renderItem = (item: MenuItem) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.item, item.bg ? { backgroundColor: item.bg } : null]}
            onPress={item.onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.itemIcon, item.bg ? { backgroundColor: `${item.bg}` } : styles.itemIconDefault]}>
                <Ionicons name={item.icon} size={20} color={item.color || '#374151'} />
            </View>
            <View style={styles.itemText}>
                <Text style={[styles.itemLabel, item.color ? { color: item.color } : null]}>
                    {item.label}
                </Text>
                {item.sublabel ? (
                    <Text style={styles.itemSublabel} numberOfLines={1}>{item.sublabel}</Text>
                ) : null}
            </View>
            {!item.color && (
                <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
            )}
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
                {/* Handle */}
                <View style={styles.handle} />

                {/* Header constant */}
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Paramètres</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={20} color="#6b7280" />
                    </TouchableOpacity>
                </View>

                {/* Contenu Scrollable */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    {/* Compte */}
                    {isAuthenticated && (
                        <>
                            <Text style={styles.sectionLabel}>Mon compte</Text>
                            <View style={styles.section}>
                                {accountItems.map(renderItem)}
                            </View>
                        </>
                    )}

                    {/* Légal */}
                    <Text style={styles.sectionLabel}>Légal & confidentialité</Text>
                    <View style={styles.section}>
                        {legalItems.map(renderItem)}
                    </View>

                    {/* Danger zone */}
                    {isAuthenticated && (
                        <>
                            <Text style={styles.sectionLabel}>Zone de danger</Text>
                            <View style={styles.section}>
                                {dangerItems.map(renderItem)}
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 16,
        paddingTop: 12,
        maxHeight: '85%',
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: '#e5e7eb',
        alignSelf: 'center', marginBottom: 16,
    },
    sheetHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, paddingHorizontal: 4,
    },
    sheetTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
    closeBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center', alignItems: 'center',
    },
    sectionLabel: {
        fontSize: 11, fontWeight: '700', color: '#9ca3af',
        textTransform: 'uppercase', letterSpacing: 0.8,
        marginBottom: 8, marginTop: 4, paddingHorizontal: 4,
    },
    section: {
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 13,
        borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
        backgroundColor: '#fff',
    },
    itemIconDefault: { backgroundColor: '#f3f4f6' },
    itemIcon: {
        width: 38, height: 38, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12, flexShrink: 0,
    },
    itemText: { flex: 1 },
    itemLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
    itemSublabel: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
});
