import MapViewWrapper from '@/components/map/MapViewWrapper';
import RideSelector from '@/components/map/RideSelector';
import SearchBar from '@/components/map/SearchBar';
import TravelModeSelector from '@/components/map/TravelModeSelector';
import {
  addRideToHistory,
  selectDestination,
  selectDistance,
  selectDuration,
  selectOrigin,
  selectTravelMode,
  setDestination,
  setDistance,
  setDuration,
  setOrigin,
  setRideInfo,
  setTravelMode,
} from '@/store/slices/navSlice';
import { useAppSelector } from '@/store/store';
import * as Location from 'expo-location';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RNMapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function MapViewScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const mapRef = useRef<RNMapView>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { session } = useAppSelector((state) => state.auth);
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const distance = useSelector(selectDistance);
  const duration = useSelector(selectDuration);
  const travelMode = useSelector(selectTravelMode);

  // Get current location on mount + reverse geocode pour l'adresse réelle
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Reverse geocoding pour récupérer l'adresse lisible
      let description = 'Position actuelle';
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place) {
          const parts = [place.streetNumber, place.street, place.city].filter(Boolean);
          description = parts.length > 0 ? parts.join(' ') : (place.name || 'Position actuelle');
        }
      } catch (_) {
        // En cas d'erreur de geocodage, on garde le fallback
      }

      dispatch(setOrigin({
        location: { lat: latitude, lng: longitude },
        description,
      }));
    })();
  }, []);

  // Re-center map on tab icon press
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress' as any, () => {
      if (origin?.location) {
        mapRef.current?.animateToRegion({
          latitude: origin.location.lat,
          longitude: origin.location.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 600);
      }
    });
    return unsubscribe;
  }, [navigation, origin]);

  return (
    <View style={styles.container}>
      <MapViewWrapper
        origin={origin}
        destination={destination}
        travelMode={travelMode}
        mapRef={mapRef}
        onRouteReady={(dist, dur, coords) => {
          dispatch(setDistance(dist));
          dispatch(setDuration(dur));
          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { right: 50, bottom: 350, left: 50, top: 150 },
          });
        }}
      />

      {!isSearchFocused && (
        <TravelModeSelector
          travelMode={travelMode}
          onSelect={(mode) => dispatch(setTravelMode(mode))}
          topOffset={insets.top ? insets.top + 70 : 90}
        />
      )}

      <SearchBar
        topOffset={insets.top || 20}
        onSelectPlace={(place) => dispatch(setDestination(place))}
        onFocusChange={setIsSearchFocused}
      />

      {/* Bouton pour vider la recherche */}
      {destination && !isSearchFocused && (
        <TouchableOpacity
          style={[
            styles.clearBtn,
            { top: (insets.top || 20) + 110 },
          ]}
          onPress={() => {
            dispatch(setDestination(null));
            dispatch(setDistance(null));
            dispatch(setDuration(null));
            if (origin?.location) {
              mapRef.current?.animateToRegion({
                latitude: origin.location.lat,
                longitude: origin.location.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }, 500);
            }
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.clearBtnText}>✕ Effacer la destination</Text>
        </TouchableOpacity>
      )}

      {distance !== null && duration !== null && !isSearchFocused && (
        <View style={styles.bottomOverlay} pointerEvents="box-none">
          <RideSelector
            distance={distance}
            duration={duration}
            session={session}
            origin={origin?.description || ''}
            destination={destination?.description || ''}
            onPaymentSuccess={(option, price) => {
              dispatch(setRideInfo({ ...option, price }));
              dispatch(addRideToHistory({
                origin: origin?.description || 'Lieu de départ',
                destination: destination?.description || 'Destination inconnue',
                price,
                title: option.title,
                date: new Date().toISOString(),
                distance: distance ?? 0,
              }));
              router.push('/(tabs)/page2');
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  bottomOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10 },
  clearBtn: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 20,
    backgroundColor: '#111827',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  clearBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
});
