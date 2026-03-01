import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RideStatsProps {
    distance: number | null;
    duration: number | null;
}

export default function RideStats({ distance, duration }: RideStatsProps) {
    if (distance === null || duration === null) return null;

    return (
        <View style={styles.statsCard}>
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{distance.toFixed(1)} km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
                <Text style={styles.statLabel}>Temps estimé</Text>
                <Text style={styles.statValue}>
                    {duration > 60
                        ? `${Math.floor(duration / 60)}h ${Math.ceil(duration % 60)}m`
                        : `${Math.ceil(duration)} min`}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    statsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statBox: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, height: 40, backgroundColor: '#e5e7eb' },
    statLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    statValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
});
