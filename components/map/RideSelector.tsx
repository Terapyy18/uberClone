import { supabase } from '@/lib/supabase';
import { useStripe } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SURGE_CHARGE_RATE = 1.5;

export const uberOptions = [
    { id: '1', title: 'Classique', multiplier: 1, capacity: '1-2 places', image: 'https://raw.githubusercontent.com/sonnysangha/Uber-Clone/master/frontend/assets/Images/UberX.webp' },
    { id: '2', title: 'Confort', multiplier: 1.2, capacity: '1-3 places', image: 'https://raw.githubusercontent.com/sonnysangha/Uber-Clone/master/frontend/assets/Images/UberXL.webp' },
    { id: '3', title: 'Luxe', multiplier: 1.75, capacity: '1-4 places', image: 'https://raw.githubusercontent.com/sonnysangha/Uber-Clone/master/frontend/assets/Images/Lux.webp' },
];

interface Props {
    distance: number;
    duration: number;
    session: any;
    origin: string;
    destination: string;
    onPaymentSuccess: (option: typeof uberOptions[0], price: number) => void;
}

const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);

const formatCO2 = (dist: number) => {
    const g = dist * 120;
    return g >= 1000 ? `${(dist * 0.12).toFixed(2)} kg` : `${Math.round(g)} g`;
};

export default function RideSelector({ distance, duration, session, origin, destination, onPaymentSuccess }: Props) {
    const insets = useSafeAreaInsets();
    const [selected, setSelected] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState(false);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    const handleConfirm = async () => {
        const selectedOption = uberOptions.find(opt => opt.id === selected);
        if (!selectedOption || !duration) return;
        setIsPaying(true);
        try {
            const calculatedPrice = (duration * SURGE_CHARGE_RATE * selectedOption.multiplier) / 10;
            const { data, error } = await supabase.functions.invoke('stripe-payment', {
                body: { type: 'payment_intent', amount: calculatedPrice },
            });
            if (error) throw new Error(data?.error || error.message);
            if (!data?.clientSecret) throw new Error(`Client secret manquant: ${JSON.stringify(data)}`);

            const initResponse = await initPaymentSheet({
                merchantDisplayName: 'Uber Clone',
                paymentIntentClientSecret: data.clientSecret,
                returnURL: 'uberclone://stripe-redirect',
            });
            if (initResponse.error) { Alert.alert("Erreur d'initialisation", initResponse.error.message); return; }

            const paymentResponse = await presentPaymentSheet();
            if (paymentResponse.error) {
                if (paymentResponse.error.code !== 'Canceled') Alert.alert('Échec du paiement', paymentResponse.error.message);
                return;
            }
            onPaymentSuccess(selectedOption, calculatedPrice);
        } catch (err: any) {
            Alert.alert('Erreur', err.message || "Une erreur inattendue s'est produite");
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <View style={[styles.panel, { paddingBottom: insets.bottom + 90 }]}>
            {/* Stats row */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Distance</Text>
                    <Text style={styles.statValue}>{distance.toFixed(1)} km</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Temps estimé</Text>
                    <Text style={styles.statValue}>
                        {duration > 60 ? `${Math.floor(duration / 60)} h ${Math.ceil(duration % 60)} min` : `${Math.ceil(duration)} min`}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>CO₂</Text>
                    <Text style={[styles.statValue, { color: '#16a34a' }]}>{formatCO2(distance)}</Text>
                </View>
            </View>

            <Text style={styles.chooseText}>Choisissez un trajet</Text>

            <FlatList
                data={uberOptions}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    const price = (duration * SURGE_CHARGE_RATE * item.multiplier) / 10;
                    return (
                        <TouchableOpacity
                            onPress={() => setSelected(item.id)}
                            style={[styles.optionCard, selected === item.id && styles.optionCardSelected]}
                        >
                            <View style={styles.imgContainer}>
                                <Image style={styles.img} source={{ uri: item.image }} resizeMode="contain" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.optionTitle, selected === item.id && styles.textSelected]}>{item.title}</Text>
                                <Text style={[styles.priceText, selected === item.id && styles.textSelected]}>{formatPrice(price)}</Text>
                                {item.capacity && <Text style={styles.capacityText}>{item.capacity}</Text>}
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            {selected && (
                <TouchableOpacity
                    style={[styles.confirmBtn, isPaying && { opacity: 0.7 }]}
                    disabled={isPaying}
                    onPress={handleConfirm}
                >
                    {isPaying ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.confirmBtnText}>
                            Confirmer {uberOptions.find(opt => opt.id === selected)?.title}
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    panel: {
        backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingVertical: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1, shadowRadius: 8, elevation: 10, zIndex: 20, width: '100%',
    },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
    statBox: { flex: 1, alignItems: 'center' },
    divider: { width: 1, height: 40, backgroundColor: '#e5e7eb', marginHorizontal: 16 },
    statLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4, fontWeight: '500', textTransform: 'uppercase' },
    statValue: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
    chooseText: { fontSize: 16, fontWeight: '600', color: '#374151', marginLeft: 24, marginBottom: 12 },
    listContent: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
    optionCard: {
        backgroundColor: 'white', borderRadius: 20, padding: 12, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12,
        elevation: 8, width: 110, borderWidth: 2, borderColor: 'transparent',
        ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 } }),
    },
    optionCardSelected: { borderColor: 'black', backgroundColor: '#f8f9fa' },
    imgContainer: { width: 80, height: 70, justifyContent: 'center', alignItems: 'center' },
    img: { width: '100%', height: '100%' },
    cardContent: { marginTop: 4, alignItems: 'center' },
    optionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 2 },
    priceText: { fontSize: 15, fontWeight: '700', color: '#111827' },
    capacityText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
    textSelected: { color: 'black' },
    confirmBtn: { backgroundColor: 'black', marginHorizontal: 24, marginTop: 8, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    confirmBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
