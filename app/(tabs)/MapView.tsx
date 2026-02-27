import { GOOGLE_MAPS_APIKEY } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import * as Location from 'expo-location';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { selectDestination, selectDistance, selectDuration, selectOrigin, selectTravelMode, setDestination, setDistance, setDuration, setOrigin, setTravelMode } from '../../store/slices/navSlice';

const uberOptions = [
  {
    id: '1',
    title: 'UberX',
    multiplier: 1,
    image: 'https://raw.githubusercontent.com/sonnysangha/Uber-Clone/master/frontend/assets/Images/UberX.webp',
  },
  {
    id: '2',
    title: 'UberXL',
    multiplier: 1.2,
    image: 'https://raw.githubusercontent.com/sonnysangha/Uber-Clone/master/frontend/assets/Images/UberXL.webp',
  },
  {
    id: '3',
    title: 'LUX',
    multiplier: 1.75,
    image: 'https://raw.githubusercontent.com/sonnysangha/Uber-Clone/master/frontend/assets/Images/Lux.webp',
  },
];

export default function MapsViewScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = React.useState<string | null>(null);

  const dispatch = useDispatch();
  const origin = useSelector(selectOrigin);
  const destination = useSelector(selectDestination);
  const distance = useSelector(selectDistance);
  const duration = useSelector(selectDuration);
  const travelMode = useSelector(selectTravelMode);

  const mapRef = React.useRef<MapView>(null);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      dispatch(setOrigin({
        location: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
        description: 'Current Location'
      }));
    })();
  }, []);

  React.useEffect(() => {
    if (!origin || !destination) return;
    // Route calculation will be handled by MapViewDirections
  }, [origin, destination]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        initialRegion={
          origin ? {
            latitude: origin.location.lat,
            longitude: origin.location.lng,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          } : undefined
        }
      >
        {origin?.location && (
          <Marker
            coordinate={{
              latitude: origin.location.lat,
              longitude: origin.location.lng,
            }}
            title="Origin"
            description={origin.description || "Current Location"}
            identifier="origin"
          />
        )}
        {destination?.location && (
          <Marker
            coordinate={{
              latitude: destination.location.lat,
              longitude: destination.location.lng,
            }}
            title="Destination"
            description={destination.description || ""}
            identifier="destination"
          />
        )}
        {origin && destination && (
          <MapViewDirections
            origin={{
              latitude: origin.location.lat,
              longitude: origin.location.lng,
            }}
            destination={{
              latitude: destination.location.lat,
              longitude: destination.location.lng,
            }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="black"
            mode={travelMode}
            onReady={(result) => {
              dispatch(setDistance(result.distance));
              dispatch(setDuration(result.duration));
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { right: 50, bottom: 50, left: 50, top: 150 },
              });
            }}
          />
        )}
      </MapView>

      {/* Travel Mode Selector */}
      <View style={[styles.travelModeContainer, { top: insets.top ? insets.top + 70 : 90 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.travelModeScroll}>
          {(['DRIVING', 'WALKING', 'BICYCLING', 'TRANSIT'] as const).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeButton, travelMode === mode && styles.modeButtonSelected]}
              onPress={() => dispatch(setTravelMode(mode))}
            >
              <Ionicons
                name={mode === 'DRIVING' ? 'car' : mode === 'WALKING' ? 'walk' : mode === 'BICYCLING' ? 'bicycle' : 'bus'}
                size={20}
                color={travelMode === mode ? '#fff' : '#000'}
              />
              <Text style={[styles.modeText, travelMode === mode && styles.modeTextSelected]}>
                {mode === 'DRIVING' ? 'Voiture' : mode === 'WALKING' ? 'Marche' : mode === 'BICYCLING' ? 'Vélo' : 'Commun'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>



      {/* Floating Header */}
      <View style={[styles.header, { top: insets.top || 20 }]}>
        <GlassContainer style={StyleSheet.absoluteFillObject} spacing={0}>
          <GlassView style={styles.glassBackground} glassEffectStyle="clear" />
        </GlassContainer>
        <View style={styles.searchContainerInner}>
          <Ionicons name="search" size={22} color="#ffffffff" style={styles.searchIcon} />

          <GooglePlacesAutocomplete
            fetchDetails={true}
            onPress={(data, details = null) => {
              if (details) {
                dispatch(setDestination({
                  location: {
                    lat: details.geometry.location.lat,
                    lng: details.geometry.location.lng,
                  },
                  description: data.description,
                }));
              }
            }}
            placeholder="Saisissez une destination"
            nearbyPlacesAPI="GooglePlacesSearch"
            debounce={200}
            enablePoweredByContainer={false}
            renderRow={(rowData) => {
              return (
                <View style={styles.glassRowContainer}>
                  <GlassContainer style={StyleSheet.absoluteFillObject} spacing={0}>
                    <GlassView style={styles.glassRowBackground} glassEffectStyle="clear" />
                  </GlassContainer>
                  <Text style={styles.rowText}>{rowData.description}</Text>
                </View>
              );
            }}
            query={{
              key: GOOGLE_MAPS_APIKEY,
              language: 'fr', // or 'en'
            }}
            styles={{
              container: {
                flex: 1,
                // Make sure the dropdown can go beyond the search container
                overflow: 'visible',
              },
              textInputContainer: { backgroundColor: 'transparent' },
              textInput: [
                styles.searchInput,
                { backgroundColor: 'transparent' }
              ],
              listView: {
                // Remove the solid background so the glass rows show
                backgroundColor: 'transparent',
                elevation: 0,
                position: 'absolute',
                top: 50,
                left: 0,
                right: 0,
              },
              row: {
                // Background must be transparent here because we handle it in renderRow
                backgroundColor: 'transparent',
                padding: 0, // Padding handled inside renderRow's container
                height: 48,
              },
              separator: {
                height: 0,
                backgroundColor: 'transparent',
              },
              description: {
                // Fallback, not used since we use renderRow
                color: '#ffffff',
                fontSize: 15,
                fontWeight: '500',
              },
            }}
            textInputProps={{
              placeholderTextColor: '#ffffffff'
            }}
          />
        </View>
      </View>



      {/* Options Overlay */}
      <View style={styles.optionsContainer} pointerEvents="box-none">
        {/* <FlatList
          // ... (rest of commented code)
        /> */}
      </View>

      {/* Bottom Info Panel */}
      {distance !== null && duration !== null && (
        <View style={[styles.bottomInfoPanel, { bottom: 100 }]}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{distance.toFixed(1)} km</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Temps estimé</Text>
            <Text style={styles.infoValue}>
              {duration > 60
                ? `${Math.floor(duration / 60)} h ${Math.ceil(duration % 60)} min`
                : `${Math.ceil(duration)} min`
              }
            </Text>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  searchContainerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    fontSize: 16,
    fontWeight: '600',
    color: "#ffffffff",
    backgroundColor: "transparent"
  },
  glassRowContainer: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 13,
    marginBottom: 4, // Space between rows
  },
  glassRowBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12, // Slightly round the row edges
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rowText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 100, // Leave space for custom tab bar
    left: 0,
    right: 0,
    zIndex: 10,
  },
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    width: 110,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  optionCardSelected: {
    borderColor: 'black',
    backgroundColor: '#f8f9fa',
  },
  imageContainer: {
    width: 80,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    marginTop: 4,
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capacityText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  textSelected: {
    color: 'black',
  },
  travelModeContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 15,
  },
  travelModeScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modeButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  modeTextSelected: {
    color: '#fff',
  },
  bottomInfoPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 20,
  },
  infoBox: {
    flex: 1,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
});
