import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface RideHistoryItem {
    origin: string;
    destination: string;
    price: number;
    title: string;
    date: string;
    distance: number;
}

interface Props {
    ride: RideHistoryItem;
}

const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

const rideTypeIcon = (title: string): keyof typeof Ionicons.glyphMap => {
    if (title === 'Luxe') return 'diamond';
    if (title === 'Confort') return 'star';
    return 'car';
};

const formatCO2 = (distance: number) => {
    if (!distance) return '—';
    const grams = distance * 120;
    return grams >= 1000
        ? `${(distance * 0.12).toFixed(2)} kg CO₂`
        : `${Math.round(grams)} g CO₂`;
};

export default function RideHistoryCard({ ride }: Props) {
    return (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons name={rideTypeIcon(ride.title)} size={22} color="#111827" />
            </View>
            <View style={styles.info}>
                <View style={styles.header}>
                    <Text style={styles.title}>{ride.title}</Text>
                    <Text style={styles.price}>{formatPrice(ride.price)}</Text>
                </View>
                <View style={styles.routeRow}>
                    <View style={styles.dot} />
                    <Text style={styles.location} numberOfLines={1}>{ride.origin}</Text>
                </View>
                <View style={styles.routeRow}>
                    <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.location} numberOfLines={1}>{ride.destination}</Text>
                </View>
                <Text style={styles.date}>{formatDate(ride.date)}</Text>
                <View style={styles.co2Row}>
                    <Ionicons name="leaf-outline" size={12} color="#16a34a" />
                    <Text style={styles.co2Text}>{formatCO2(ride.distance)}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    iconContainer: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center', alignItems: 'center',
    },
    info: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    title: { fontSize: 15, fontWeight: '700', color: '#111827' },
    price: { fontSize: 15, fontWeight: '700', color: '#111827' },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
    location: { fontSize: 13, color: '#6b7280', flex: 1 },
    date: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
    co2Row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
    co2Text: { fontSize: 12, color: '#16a34a', fontWeight: '600' },
});
