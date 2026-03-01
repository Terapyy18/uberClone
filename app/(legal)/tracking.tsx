import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TrackingStatus = 'granted' | 'denied' | 'restricted' | 'unavailable' | 'undetermined';

const STATUS_CONFIG: Record<TrackingStatus, { label: string; color: string; icon: string }> = {
    'granted': { label: 'Autorisé ✓', color: '#16a34a', icon: 'checkmark-circle' },
    'denied': { label: 'Refusé', color: '#dc2626', icon: 'close-circle' },
    'restricted': { label: 'Restreint', color: '#f59e0b', icon: 'alert-circle' },
    'unavailable': { label: 'Non disponible', color: '#9ca3af', icon: 'remove-circle' },
    'undetermined': { label: 'Non défini', color: '#6b7280', icon: 'help-circle' },
};

export default function TrackingScreen() {
    // ATT requiert un build natif iOS — en Expo Go le statut est indisponible
    const [status] = useState<TrackingStatus>(Platform.OS === 'ios' ? 'undetermined' : 'unavailable');

    const openSettings = () => Linking.openSettings();

    const config = STATUS_CONFIG[status] || STATUS_CONFIG['undetermined'];


    return (
        <>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {/* Status actuel */}
                <View style={styles.statusCard}>
                    <Ionicons name={config.icon as any} size={48} color={config.color} />
                    <Text style={styles.statusLabel}>Statut actuel</Text>
                    <Text style={[styles.statusValue, { color: config.color }]}>{config.label}</Text>
                </View>

                {/* Explication */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Pourquoi ce suivi ?</Text>
                    <Text style={styles.cardText}>
                        L'identifiant publicitaire (IDFA) nous permet de mesurer l'efficacité de nos
                        publicités et de vous proposer des contenus plus pertinents.{'\n\n'}
                        Conformément à la politique d'App Tracking Transparency (ATT) d'Apple,
                        nous vous demandons explicitement votre accord avant tout suivi publicitaire.
                    </Text>
                </View>

                {/* Ce qu'on collecte */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Ce que nous suivons :</Text>
                    {[
                        'Mesure de performance des campagnes publicitaires',
                        'Attribution des installations de l\'application',
                        'Personnalisation des publicités affichées',
                    ].map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Ionicons name="ellipse" size={6} color="#6b7280" />
                            <Text style={styles.listText}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Ce qu'on ne fait pas */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Nous ne faisons jamais :</Text>
                    {[
                        'Vendre vos données à des tiers',
                        'Suivre votre activité sur d\'autres apps',
                        'Accéder à vos contacts ou messages',
                    ].map((item, i) => (
                        <View key={i} style={styles.listItem}>
                            <Ionicons name="close" size={14} color="#dc2626" />
                            <Text style={styles.listText}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Bouton demande */}
                {Platform.OS === 'ios' && (
                    <TouchableOpacity
                        style={styles.btn}
                        onPress={openSettings}
                    >
                        <Ionicons name="settings-outline" size={20} color="#fff" />
                        <Text style={styles.btnText}>Ouvrir les Réglages</Text>
                    </TouchableOpacity>
                )}

                {Platform.OS !== 'ios' && (
                    <View style={styles.androidNote}>
                        <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
                        <Text style={styles.androidText}>
                            La demande ATT est disponible uniquement sur iOS. Sur Android, le suivi
                            est géré via les paramètres Google de votre appareil.
                        </Text>
                    </View>
                )}

                <Text style={styles.note}>
                    Vous pouvez modifier cette autorisation à tout moment dans Réglages → Confidentialité
                    et sécurité → Suivi.
                </Text>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    content: { padding: 20, paddingBottom: 100, gap: 16 },
    statusCard: {
        backgroundColor: '#fff', borderRadius: 20, padding: 24,
        alignItems: 'center', gap: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
    },
    statusLabel: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
    statusValue: { fontSize: 18, fontWeight: '800' },
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
    cardText: { fontSize: 14, color: '#374151', lineHeight: 22 },
    listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
    listText: { fontSize: 14, color: '#374151', flex: 1 },
    btn: {
        backgroundColor: '#111827', paddingVertical: 15, borderRadius: 14,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    androidNote: {
        backgroundColor: '#f0f9ff', borderRadius: 12, padding: 14,
        flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: '#bae6fd',
    },
    androidText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 20 },
    note: { fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 18, fontStyle: 'italic' },
});
