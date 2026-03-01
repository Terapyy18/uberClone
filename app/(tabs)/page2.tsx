import RideHistoryCard from '@/components/RideHistoryCard';
import ActiveRide, { RidePhase } from '@/components/ride/ActiveRide';
import RideStats from '@/components/ride/RideStats';
import SelectedRide from '@/components/ride/SelectedRide';
import TripOverview from '@/components/ride/TripOverview';
import {
  selectDestination,
  selectDistance,
  selectDuration,
  selectOrigin,
  selectRideHistory,
  selectRideInfo,
} from '@/store/slices/navSlice';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

export default function RideDetailsScreen() {
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const rideInfo = useSelector(selectRideInfo);
  const distance = useSelector(selectDistance);
  const duration = useSelector(selectDuration);
  const rideHistory = useSelector(selectRideHistory);

  const [phase, setPhase] = useState<RidePhase>('searching');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={phase !== 'found'}>
        <Text style={styles.headerTitle}>Détails de votre course</Text>

        {/* 1. Résumé du trajet départ/arrivée */}
        <TripOverview
          originDescription={origin?.description}
          destinationDescription={destination?.description}
        />

        {/* 2. Simulation et suivi chauffeur/trajet EN PREMIER (demande client) */}
        {rideInfo ? (
          <ActiveRide
            origin={origin}
            destination={destination}
            onPhaseChange={setPhase}
          />
        ) : (
          <View style={styles.card}>
            <Text style={{ textAlign: 'center', color: '#6b7280' }}>
              Veuillez sélectionner une course depuis la carte.
            </Text>
          </View>
        )}

        {/* 3. Statistiques et option choisie EN DESSOUS */}
        <RideStats distance={distance} duration={duration} />
        <SelectedRide rideInfo={rideInfo} />

        {/* 4. Historique des courses */}
        {rideHistory && rideHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.headerTitle}>Historique des courses</Text>
            {rideHistory.map((ride: any, index: number) => (
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
  historyContainer: { marginTop: 24 },
});
