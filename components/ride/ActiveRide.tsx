import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

// ── Types & Constants ───────────────────────────────────────────────────────
export type RidePhase = 'searching' | 'found' | 'nearby' | 'boarded' | 'arrived';
type LatLng = { latitude: number; longitude: number };

const FAKE_DRIVER = {
    name: 'Alexandre M.',
    plate: 'AB-123-CD',
    rating: 4.9,
    avatar: 'https://i.pravatar.cc/150?img=12', // Fake driver picture
};

const SIM_SPEED = 30; // 30x real-time speed

// ── Helpers ────────────────────────────────────────────────────────────────
function randomDriverStart(lat: number, lng: number): LatLng {
    const offset = () => (Math.random() - 0.5) * 0.008; // ~400m
    return { latitude: lat + offset(), longitude: lng + offset() };
}

function decodePolyline(encoded: string): LatLng[] {
    let index = 0, lat = 0, lng = 0;
    const result: LatLng[] = [];
    while (index < encoded.length) {
        let shift = 0, b = 0, byte: number;
        do { byte = encoded.charCodeAt(index++) - 63; b |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
        lat += b & 1 ? ~(b >> 1) : b >> 1;
        shift = 0; b = 0;
        do { byte = encoded.charCodeAt(index++) - 63; b |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
        lng += b & 1 ? ~(b >> 1) : b >> 1;
        result.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return result;
}

async function fetchRoute(
    from: LatLng,
    to: LatLng,
    apiKey: string
): Promise<{ coords: LatLng[]; durationSeconds: number }> {
    try {
        const url =
            `https://maps.googleapis.com/maps/api/directions/json` +
            `?origin=${from.latitude},${from.longitude}` +
            `&destination=${to.latitude},${to.longitude}` +
            `&mode=driving` +
            `&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.routes?.length) throw new Error('No route');
        const leg = data.routes[0].legs[0];
        const coords = decodePolyline(data.routes[0].overview_polyline.points);
        return { coords, durationSeconds: leg.duration.value };
    } catch {
        return { coords: [from, to], durationSeconds: 90 };
    }
}

// ── Component ───────────────────────────────────────────────────────────────
interface LocationData {
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
}

interface ActiveRideProps {
    origin: { location: LocationData } | null;
    destination: { location: LocationData } | null;
    onPhaseChange?: (phase: RidePhase) => void;
}

export default function ActiveRide({ origin, destination, onPhaseChange }: ActiveRideProps) {
    const [phase, setPhase] = useState<RidePhase>('searching');
    const [driverPos, setDriverPos] = useState<LatLng | null>(null);
    const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
    const [etaSeconds, setEtaSeconds] = useState(0);

    const mapRef = useRef<MapView>(null);
    const moveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const etaIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeCardAnim = useRef(new Animated.Value(0)).current;
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    // Initialize searching animations
    useEffect(() => {
        if (phase !== 'searching') return;
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.18, duration: 850, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 850, useNativeDriver: true }),
            ])
        );
        loop.start();

        const anim = (d: Animated.Value, delay: number) =>
            Animated.loop(Animated.sequence([
                Animated.delay(delay),
                Animated.timing(d, { toValue: 1, duration: 380, useNativeDriver: true }),
                Animated.timing(d, { toValue: 0.3, duration: 380, useNativeDriver: true }),
            ]));
        const a1 = anim(dot1, 0); const a2 = anim(dot2, 140); const a3 = anim(dot3, 280);
        a1.start(); a2.start(); a3.start();

        return () => { loop.stop(); a1.stop(); a2.stop(); a3.stop(); };
    }, [phase]);

    const updatePhase = (newPhase: RidePhase) => {
        setPhase(newPhase);
        onPhaseChange?.(newPhase);

        if (newPhase === 'nearby') {
            Notifications.scheduleNotificationAsync({
                content: {
                    title: '🚕 Votre Uber est arrivé !',
                    body: `Détails de la course :\nChauffeur: ${FAKE_DRIVER.name}\nPlaque: ${FAKE_DRIVER.plate}\nNote: ⭐ ${FAKE_DRIVER.rating}`,
                    sound: true,
                },
                trigger: null,
            });
        }
    };

    const startJourneyAnimation = async (
        startPos: LatLng,
        endPos: LatLng,
        onFinishPhase: RidePhase,
        targetMarker: 'user' | 'destination'
    ) => {
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY!;
        const { coords, durationSeconds } = await fetchRoute(startPos, endPos, apiKey);

        setRouteCoords(coords);
        setDriverPos(coords[0]);
        setEtaSeconds(Math.round(durationSeconds / SIM_SPEED));

        // Smooth camera framing
        setTimeout(() => {
            mapRef.current?.fitToCoordinates([coords[0], endPos], {
                edgePadding: { top: 60, bottom: 80, left: 60, right: 60 },
                animated: true,
            });
        }, 600);

        const realDurationMs = (durationSeconds / SIM_SPEED) * 1000;
        const stepMs = Math.max(100, realDurationMs / coords.length);
        let step = 0;

        moveIntervalRef.current = setInterval(() => {
            step++;
            if (step >= coords.length) {
                if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
                if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
                updatePhase(onFinishPhase);
                return;
            }
            setDriverPos(coords[step]);

            // Update camera map gently
            mapRef.current?.fitToCoordinates([coords[step], endPos], {
                edgePadding: { top: 60, bottom: 80, left: 60, right: 60 },
                animated: false,
            });
        }, stepMs);

        const etaTotal = Math.round(durationSeconds / SIM_SPEED);
        let etaLeft = etaTotal;
        const etaStep = Math.max(1000, (etaTotal * 1000) / 30);

        etaIntervalRef.current = setInterval(() => {
            etaLeft = Math.max(0, etaLeft - Math.round(etaStep / 1000));
            setEtaSeconds(etaLeft);
            if (etaLeft <= 0 && etaIntervalRef.current) clearInterval(etaIntervalRef.current);
        }, etaStep);
    };

    // Phase 1: Search for driver -> Fake finding after 3s
    useEffect(() => {
        if (!origin?.location) return;

        if (phase === 'searching') {
            const t = setTimeout(async () => {
                updatePhase('found');
                Animated.timing(fadeCardAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

                const startLat = origin.location.lat ?? origin.location.latitude;
                const startLng = origin.location.lng ?? origin.location.longitude;

                const startPos = randomDriverStart(startLat!, startLng!);
                const userPos: LatLng = { latitude: startLat!, longitude: startLng! };

                await startJourneyAnimation(startPos, userPos, 'nearby', 'user');
            }, 3000);
            return () => clearTimeout(t);
        }
    }, [origin, phase]);

    // Phase 3 to 4: Trigger Active Boarded Ride
    const handleBoarding = async () => {
        updatePhase('boarded');
        if (!driverPos || !destination?.location) return;

        const endLat = destination.location.lat ?? destination.location.latitude;
        const endLng = destination.location.lng ?? destination.location.longitude;

        const endPos: LatLng = { latitude: endLat!, longitude: endLng! };
        await startJourneyAnimation(driverPos, endPos, 'arrived', 'destination');
    };

    // Cleanup timers on tear down
    useEffect(() => {
        return () => {
            if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
            if (etaIntervalRef.current) clearInterval(etaIntervalRef.current);
        };
    }, []);

    const formatEta = (s: number) => {
        if (s <= 0) return phase === 'nearby' ? 'Proche' : 'Arrivé';
        if (s < 60) return `${s} s`;
        return `${Math.floor(s / 60)} min ${s % 60 > 0 ? `${s % 60}s` : ''}`.trim();
    };

    if (phase === 'arrived') {
        return (
            <View style={styles.boardedCard}>
                <Ionicons name="checkmark-circle" size={68} color="#16a34a" />
                <Text style={styles.boardedTitle}>Trajet Terminé ! 🎉</Text>
                <Text style={styles.boardedSub}>Merci d'avoir voyagé avec nous.</Text>
            </View>
        );
    }

    if (phase === 'searching') {
        return (
            <View style={styles.searchingCard}>
                <View style={styles.pulseWrap}>
                    <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
                    <View style={styles.pulseCenter}>
                        <Ionicons name="car" size={28} color="#fff" />
                    </View>
                </View>
                <Text style={styles.searchingTitle}>Recherche d'un chauffeur…</Text>
                <View style={styles.dotsRow}>
                    {[dot1, dot2, dot3].map((d, i) => (
                        <Animated.View key={i} style={[styles.dot3, { opacity: d }]} />
                    ))}
                </View>
                <Text style={styles.searchingSub}>Nous trouvons le chauffeur le plus proche de vous.</Text>
            </View>
        );
    }

    // Phase "found", "nearby" and "boarded"
    return (
        <Animated.View style={{ opacity: fadeCardAnim }}>
            <View style={styles.driverCard}>
                <Image source={{ uri: FAKE_DRIVER.avatar }} style={styles.driverAvatar} />
                <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>{FAKE_DRIVER.name}</Text>
                    <Text style={styles.driverPlate}>{FAKE_DRIVER.plate}</Text>
                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={14} color="#f59e0b" />
                        <Text style={styles.ratingText}>{FAKE_DRIVER.rating}</Text>
                    </View>
                </View>
                {phase === 'boarded' ? (
                    <TouchableOpacity style={styles.optionsBadge}>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.etaBadge}>
                        <Ionicons name="time-outline" size={15} color="#3b82f6" />
                        <Text style={styles.etaText}>
                            {phase === 'nearby' ? 'Proche !' : formatEta(etaSeconds)}
                        </Text>
                    </View>
                )}
            </View>

            {origin?.location && driverPos && (
                <View style={styles.miniMapWrapper}>
                    <MapView
                        ref={mapRef}
                        style={StyleSheet.absoluteFillObject}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        pitchEnabled={false}
                        rotateEnabled={false}
                    >
                        {routeCoords.length > 1 && (
                            <Polyline coordinates={routeCoords} strokeColor="#3b82f6" strokeWidth={3} lineDashPattern={[0]} />
                        )}

                        {/* Target Marker: User or Destination */}
                        {phase === 'boarded' && destination?.location ? (
                            <Marker coordinate={{ latitude: (destination.location.lat ?? destination.location.latitude)!, longitude: (destination.location.lng ?? destination.location.longitude)! }} identifier="target" anchor={{ x: 0.5, y: 0.5 }}>
                                <View style={[styles.userMarker, { backgroundColor: '#111827' }]}>
                                    <Ionicons name="flag" size={14} color="#fff" />
                                </View>
                            </Marker>
                        ) : (
                            <Marker coordinate={{ latitude: (origin.location.lat ?? origin.location.latitude)!, longitude: (origin.location.lng ?? origin.location.longitude)! }} identifier="target" anchor={{ x: 0.5, y: 0.5 }}>
                                <View style={styles.userMarker}>
                                    <Ionicons name="person" size={14} color="#fff" />
                                </View>
                            </Marker>
                        )}

                        {/* Driver Marker */}
                        <Marker coordinate={driverPos} identifier="driver" anchor={{ x: 0.5, y: 0.5 }}>
                            <View style={styles.driverMarker}>
                                <Ionicons name="car" size={16} color="#fff" />
                            </View>
                        </Marker>
                    </MapView>

                    <View style={[styles.mapOverlayLabel, phase === 'nearby' && styles.mapOverlayLabelGreen]}>
                        <Ionicons
                            name={phase === 'nearby' ? 'location' : 'navigate'}
                            size={16}
                            color={phase === 'nearby' ? '#15803d' : '#3b82f6'}
                        />
                        <Text style={[styles.mapOverlayText, phase === 'nearby' && styles.mapOverlayTextGreen]}>
                            {phase === 'nearby'
                                ? 'Votre chauffeur est proche !'
                                : phase === 'boarded'
                                    ? `Arrivée à destination dans ${formatEta(etaSeconds)}`
                                    : `Votre chauffeur arrive dans ${formatEta(etaSeconds)}`}
                        </Text>
                    </View>
                </View>
            )}

            {/* Action button if nearby */}
            {phase === 'nearby' && (
                <TouchableOpacity style={styles.boardBtn} onPress={handleBoarding} activeOpacity={0.85}>
                    <Ionicons name="checkmark-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.boardBtnText}>Je suis monté dans le véhicule</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    searchingCard: {
        backgroundColor: 'white', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
    },
    pulseWrap: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    pulseRing: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(59,130,246,0.15)' },
    pulseCenter: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
    searchingTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
    dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
    dot3: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },
    searchingSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },

    driverCard: {
        backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    },
    driverAvatar: { width: 56, height: 56, borderRadius: 28, marginRight: 12 },
    driverInfo: { flex: 1 },
    driverName: { fontSize: 16, fontWeight: '700', color: '#111827' },
    driverPlate: { fontSize: 13, color: '#6b7280', marginTop: 2, fontWeight: '500' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    ratingText: { fontSize: 13, fontWeight: '700', color: '#f59e0b' },
    etaBadge: { alignItems: 'center', backgroundColor: '#eff6ff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
    etaText: { fontSize: 13, fontWeight: '800', color: '#3b82f6', marginTop: 2 },
    optionsBadge: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: 20, width: 40, height: 40 },

    miniMapWrapper: {
        borderRadius: 16, overflow: 'hidden', marginBottom: 16, height: 230,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
    },
    mapOverlayLabel: {
        position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(239,246,255,0.97)',
        flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 11, paddingHorizontal: 16,
    },
    mapOverlayLabelGreen: { backgroundColor: 'rgba(240,253,244,0.97)' },
    mapOverlayText: { fontSize: 14, fontWeight: '700', color: '#1d4ed8', flex: 1 },
    mapOverlayTextGreen: { color: '#15803d' },

    userMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: '#fff' },
    driverMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: '#fff' },

    boardBtn: {
        backgroundColor: '#16a34a', borderRadius: 14, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
        shadowColor: '#16a34a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    boardBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    boardedCard: { backgroundColor: '#f0fdf4', borderRadius: 20, padding: 36, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#bbf7d0', gap: 12 },
    boardedTitle: { fontSize: 24, fontWeight: '800', color: '#15803d' },
    boardedSub: { fontSize: 15, color: '#166534', textAlign: 'center', lineHeight: 22 },
});
