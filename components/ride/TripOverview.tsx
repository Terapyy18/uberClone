import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TripOverviewProps {
    originDescription?: string;
    destinationDescription?: string;
}

export default function TripOverview({ originDescription, destinationDescription }: TripOverviewProps) {
    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Votre Trajet</Text>
            <View style={styles.locationRow}>
                <View style={styles.dot} />
                <Text style={styles.locationText} numberOfLines={2}>
                    {originDescription || 'Position actuelle'}
                </Text>
            </View>
            <View style={styles.line} />
            <View style={styles.locationRow}>
                <View style={[styles.dot, { backgroundColor: '#111827' }]} />
                <Text style={styles.locationText} numberOfLines={2}>
                    {destinationDescription || 'Destination inconnue'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 16 },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3b82f6', marginRight: 12 },
    line: { width: 2, height: 24, backgroundColor: '#e5e7eb', marginLeft: 4, marginVertical: 4 },
    locationText: { flex: 1, fontSize: 15, color: '#1f2937', fontWeight: '500' },
});
