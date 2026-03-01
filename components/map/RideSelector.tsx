import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SURGE_CHARGE_RATE = 1.5;
const REDIRECT_DELAY_MS = 3000;

export const uberOptions = [
    {
        id: '1',
        title: 'Classique',
        multiplier: 1,
        capacity: '1-2 places',
        image: require('@/assets/images/car_classique.png'),
    },
    {
        id: '2',
        title: 'Confort',
        multiplier: 1.2,
        capacity: '1-3 places',
        image: require('@/assets/images/car_confort.png'),
    },
    {
        id: '3',
        title: 'Luxe',
        multiplier: 1.75,
        capacity: '1-4 places',
        image: require('@/assets/images/car_luxe.png'),
    },
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
    const [showSuccess, setShowSuccess] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    // Animations pour la popup
    const scaleAnim = useRef(new Animated.Value(0.7)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const checkAnim = useRef(new Animated.Value(0)).current;
    const countdownAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(100)).current; // pourcentage 100→0

    // Lancer les animations quand la popup s'ouvre
    useEffect(() => {
        if (!showSuccess) return;

        // Entrée du modal
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            // Cercle de checkmark
            Animated.spring(checkAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start();
        });

        // Barre de progression (width %, pas de native driver)
        progressAnim.setValue(100);
        Animated.timing(progressAnim, {
            toValue: 0,
            duration: REDIRECT_DELAY_MS,
            useNativeDriver: false,
        }).start();

        // Compte à rebours
        let count = 3;
        setCountdown(count);
        const interval = setInterval(() => {
            count -= 1;
            setCountdown(count);
            // Petite animation de pulsation
            Animated.sequence([
                Animated.timing(countdownAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
                Animated.timing(countdownAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
            if (count <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        // Timer de redirection
        const timer = setTimeout(() => {
            setShowSuccess(false);
            if (pendingCallback) pendingCallback();
        }, REDIRECT_DELAY_MS);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [showSuccess]);

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
            if (initResponse.error) {
                Alert.alert("Erreur d'initialisation", initResponse.error.message);
                return;
            }

            const paymentResponse = await presentPaymentSheet();
            if (paymentResponse.error) {
                if (paymentResponse.error.code !== 'Canceled') {
                    Alert.alert('Échec du paiement', paymentResponse.error.message);
                }
                return;
            }

            // Paiement réussi → on stocke le callback et on affiche la popup
            setPendingCallback(() => () => onPaymentSuccess(selectedOption, calculatedPrice));
            // Reset animations avant d'afficher
            scaleAnim.setValue(0.7);
            opacityAnim.setValue(0);
            checkAnim.setValue(0);
            setShowSuccess(true);

        } catch (err: any) {
            Alert.alert('Erreur', err.message || "Une erreur inattendue s'est produite");
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <>
            {/* ── Panneau principal ── */}
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
                            {duration > 60
                                ? `${Math.floor(duration / 60)} h ${Math.ceil(duration % 60)} min`
                                : `${Math.ceil(duration)} min`}
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
                        const isSelected = selected === item.id;
                        return (
                            <TouchableOpacity
                                onPress={() => setSelected(item.id)}
                                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                            >
                                <View style={styles.imgContainer}>
                                    <Image style={styles.img} source={item.image} resizeMode="contain" />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={[styles.optionTitle, isSelected && styles.textSelected]}>
                                        {item.title}
                                    </Text>
                                    <Text style={[styles.priceText, isSelected && styles.textSelected]}>
                                        {formatPrice(price)}
                                    </Text>
                                    {item.capacity && (
                                        <Text style={styles.capacityText}>{item.capacity}</Text>
                                    )}
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

            {/* ── Popup succès paiement ── */}
            <Modal transparent animationType="none" visible={showSuccess} statusBarTranslucent>
                <View style={styles.modalBackdrop}>
                    <Animated.View
                        style={[
                            styles.modalCard,
                            { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
                        ]}
                    >
                        {/* Cercle checkmark animé */}
                        <Animated.View
                            style={[
                                styles.checkCircle,
                                { transform: [{ scale: checkAnim }] },
                            ]}
                        >
                            <Ionicons name="checkmark" size={44} color="#fff" />
                        </Animated.View>

                        <Text style={styles.successTitle}>Paiement confirmé !</Text>
                        <Text style={styles.successSubtitle}>
                            Merci pour votre réservation.{'\n'}Vous allez être redirigé vers les détails de votre course.
                        </Text>

                        {/* Barre de progression animée */}
                        <View style={styles.progressTrack}>
                            <Animated.View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: progressAnim.interpolate({
                                            inputRange: [0, 100],
                                            outputRange: ['0%', '100%'],
                                        }),
                                    },
                                ]}
                            />
                        </View>

                        <View style={styles.countdownRow}>
                            <Ionicons name="time-outline" size={16} color="#6b7280" />
                            <Text style={styles.countdownText}>
                                Redirection dans{' '}
                                <Animated.Text style={[styles.countdownNum, { transform: [{ scale: countdownAnim }] }]}>
                                    {countdown}
                                </Animated.Text>
                                {' '}s
                            </Text>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    panel: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
        zIndex: 20,
        width: '100%',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    statBox: { flex: 1, alignItems: 'center' },
    divider: { width: 1, height: 40, backgroundColor: '#e5e7eb', marginHorizontal: 16 },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    statValue: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
    chooseText: { fontSize: 16, fontWeight: '600', color: '#374151', marginLeft: 24, marginBottom: 12 },
    listContent: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
    optionCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        width: 110,
        borderWidth: 2,
        borderColor: 'transparent',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
        }),
    },
    optionCardSelected: { borderColor: 'black', backgroundColor: '#f8f9fa' },
    imgContainer: { width: 80, height: 70, justifyContent: 'center', alignItems: 'center' },
    img: { width: '100%', height: '100%' },
    cardContent: { marginTop: 4, alignItems: 'center' },
    optionTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 2 },
    priceText: { fontSize: 15, fontWeight: '700', color: '#111827' },
    capacityText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
    textSelected: { color: 'black' },
    confirmBtn: {
        backgroundColor: 'black',
        marginHorizontal: 24,
        marginTop: 8,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

    /* ── Modal succès ── */
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 28,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 40,
        elevation: 20,
    },
    checkCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#16a34a',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    progressTrack: {
        width: '100%',
        height: 4,
        backgroundColor: '#f3f4f6',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 14,
    },
    progressFill: {
        height: '100%',
        width: '100%',
        backgroundColor: '#16a34a',
        borderRadius: 2,
    },
    countdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    countdownText: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    countdownNum: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111827',
    },
});
