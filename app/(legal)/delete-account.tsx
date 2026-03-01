import { supabase } from '@/lib/supabase';
import { clearSession } from '@/store/slices/authSlice';
import { clearProfile } from '@/store/slices/profileSlice';
import { useAppDispatch } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DeleteAccountScreen() {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = () => {
        Alert.alert(
            '⚠️ Supprimer mon compte',
            'Cette action est irréversible. Toutes vos données (profil, historique, moyens de paiement) seront définitivement supprimées.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Confirmer la suppression',
                    style: 'destructive',
                    onPress: confirmDelete,
                },
            ],
        );
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            // Supprime le profil dans la table profiles
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non connecté');

            // Appel à la RPC — supprime les données ET le compte auth
            const { error } = await supabase.rpc('delete_user_account');
            if (error) {
                console.warn('RPC delete_user_account échouée:', error.message);
            }

            // Nettoie le store local et déconnecte
            dispatch(clearProfile());
            dispatch(clearSession());
            await supabase.auth.signOut();

            // Attendre que le Root Layout se remonte avant de naviguer
            setTimeout(() => {
                router.replace('/(auth)/sign-in' as any);
            }, 300);
        } catch (err: any) {
            Alert.alert('Erreur', err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Icône d'avertissement */}
                <View style={styles.warningBox}>
                    <Ionicons name="warning-outline" size={40} color="#dc2626" />
                    <Text style={styles.warningTitle}>Attention</Text>
                    <Text style={styles.warningText}>
                        La suppression de votre compte est {' '}
                        <Text style={styles.bold}>définitive et irréversible</Text>.
                    </Text>
                </View>

                {/* Ce qui sera supprimé */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Ce qui sera supprimé :</Text>
                    {[
                        'Votre profil et informations personnelles',
                        'Votre historique de commandes',
                        'Vos moyens de paiement enregistrés',
                        'Toutes vos préférences et paramètres',
                    ].map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Ionicons name="close-circle" size={18} color="#dc2626" />
                            <Text style={styles.listText}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Alternatives */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Alternatives :</Text>
                    <Text style={styles.cardText}>
                        Si vous souhaitez simplement faire une pause, vous pouvez vous déconnecter
                        sans supprimer votre compte. Vos données resteront intactes.
                    </Text>
                </View>

                {/* RGPD */}
                <Text style={styles.rgpd}>
                    Conformément au RGPD, vos données seront définitivement effacées dans un délai
                    de 30 jours suivant votre demande.
                </Text>

                {/* Bouton de suppression */}
                <TouchableOpacity
                    style={[styles.deleteBtn, loading && styles.deleteBtnDisabled]}
                    onPress={handleDeleteAccount}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="trash-outline" size={20} color="#fff" />
                            <Text style={styles.deleteBtnText}>Supprimer définitivement mon compte</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    content: { padding: 20, paddingBottom: 100, gap: 16 },
    warningBox: {
        backgroundColor: '#fef2f2', borderRadius: 16, padding: 24,
        alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#fecaca',
    },
    warningTitle: { fontSize: 20, fontWeight: '800', color: '#dc2626' },
    warningText: { fontSize: 15, color: '#7f1d1d', textAlign: 'center', lineHeight: 22 },
    bold: { fontWeight: '700' },
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
    cardText: { fontSize: 14, color: '#374151', lineHeight: 22 },
    listItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    listText: { fontSize: 14, color: '#374151', flex: 1 },
    rgpd: { fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 18, fontStyle: 'italic' },
    deleteBtn: {
        backgroundColor: '#dc2626', paddingVertical: 15, borderRadius: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    deleteBtnDisabled: { opacity: 0.6 },
    deleteBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
