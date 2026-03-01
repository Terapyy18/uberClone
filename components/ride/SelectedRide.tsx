import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface SelectedRideProps {
    rideInfo: {
        id: string;
        title: string;
        multiplier: number;
        image: any;
        capacity: string;
        price?: number;
    } | null;
}

export default function SelectedRide({ rideInfo }: SelectedRideProps) {
    if (!rideInfo) return null;

    return (
        <View style={styles.rideCard}>
            <Image source={rideInfo.image} style={styles.rideImage} resizeMode="contain" />
            <View style={styles.rideInfoRow}>
                <View style={styles.rideDetails}>
                    <Text style={styles.rideTitle}>{rideInfo.title}</Text>
                    <Text style={styles.rideCapacity}>{rideInfo.capacity}</Text>
                </View>
                <Text style={styles.ridePrice}>
                    {rideInfo.price
                        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(rideInfo.price)
                        : '...'
                    }
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    rideCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 16,
    },
    rideImage: { width: 180, height: 120, marginBottom: 12 },
    rideInfoRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
    rideDetails: { flex: 1 },
    rideTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    rideCapacity: { fontSize: 13, color: '#6b7280', marginTop: 2 },
    ridePrice: { fontSize: 22, fontWeight: '800', color: '#000' },
});
