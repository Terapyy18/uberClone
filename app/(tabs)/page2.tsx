import RideHistoryCard from '@/components/RideHistoryCard';
import { selectDestination, selectDistance, selectDuration, selectOrigin, selectRideHistory, selectRideInfo } from '@/store/slices/navSlice';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

export default function Page2Screen() {
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const rideInfo = useSelector(selectRideInfo);
  const distance = useSelector(selectDistance);
  const duration = useSelector(selectDuration);
  const rideHistory = useSelector(selectRideHistory);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Détails de votre course</Text>

        {/* Route card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Votre Trajet</Text>
          <View style={styles.locationRow}>
            <View style={styles.dot} />
            <Text style={styles.locationText} numberOfLines={2}>
              {origin?.description || 'Position actuelle'}
            </Text>
          </View>
          <View style={styles.line} />
          <View style={styles.locationRow}>
            <View style={[styles.dot, { backgroundColor: 'black' }]} />
            <Text style={styles.locationText} numberOfLines={2}>
              {destination?.description || 'Destination inconnue'}
            </Text>
          </View>
        </View>

        {/* Stats card */}
        {distance !== null && duration !== null && (
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
        )}

        {/* Current ride info */}
        {rideInfo ? (
          <View style={styles.rideCard}>
            <Image source={{ uri: rideInfo.image }} style={styles.rideImage} resizeMode="contain" />
            <View style={styles.rideDetails}>
              <Text style={styles.rideTitle}>{rideInfo.title}</Text>
              <Text style={styles.rideCapacity}>{rideInfo.capacity}</Text>
            </View>
            <Text style={styles.ridePrice}>
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(rideInfo.price)}
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={{ textAlign: 'center', color: '#6b7280' }}>
              Veuillez sélectionner une course depuis la carte.
            </Text>
          </View>
        )}

        {/* Ride history — uses shared component */}
        {rideHistory && rideHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.headerTitle}>Historique des courses</Text>
            {rideHistory.map((ride, index) => (
              <RideHistoryCard key={index} ride={ride} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 24, marginTop: 10 },
  card: {
    backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3b82f6', marginRight: 12 },
  line: { width: 2, height: 24, backgroundColor: '#e5e7eb', marginLeft: 4, marginVertical: 4 },
  locationText: { flex: 1, fontSize: 15, color: '#1f2937', fontWeight: '500' },
  statsCard: {
    backgroundColor: 'white', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20,
    marginBottom: 16, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: '100%', backgroundColor: '#e5e7eb', marginHorizontal: 16 },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  rideCard: {
    backgroundColor: 'white', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  rideImage: { width: 80, height: 60 },
  rideDetails: { flex: 1, marginLeft: 16 },
  rideTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  rideCapacity: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  ridePrice: { fontSize: 20, fontWeight: '800', color: '#000' },
  historyContainer: { marginTop: 24 },
});
