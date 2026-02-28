import RideHistoryCard, { RideHistoryItem } from '@/components/RideHistoryCard';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface Props {
    rideHistory: RideHistoryItem[];
}

export default function RideHistorySection({ rideHistory }: Props) {
    return (
        <View style={styles.section}>
            <Text style={styles.title}>
                Historique des courses
                {rideHistory.length > 0 && (
                    <Text style={styles.count}> ({rideHistory.length})</Text>
                )}
            </Text>

            {rideHistory.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="car-outline" size={40} color="#d1d5db" />
                    <Text style={styles.emptyText}>Aucune course pour le moment</Text>
                </View>
            ) : (
                <FlatList
                    data={rideHistory}
                    keyExtractor={(_, i) => i.toString()}
                    scrollEnabled={false}
                    renderItem={({ item }) => <RideHistoryCard ride={item} />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    title: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
    count: { color: '#6b7280', fontWeight: '500' },
    empty: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    emptyText: { color: '#9ca3af', fontSize: 14 },
});
