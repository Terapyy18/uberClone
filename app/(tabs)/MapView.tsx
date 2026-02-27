import { GOOGLE_MAPS_APIKEY } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import * as Location from 'expo-location';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { selectDestination, selectDistance, selectOrigin, setDestination, setDistance, setOrigin } from '../../store/slices/navSlice';

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

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  React.useEffect(() => {
    if (!origin || !destination) return;
    const dist = calculateDistance(
      origin.location.lat,
      origin.location.lng,
      destination.location.lat,
      destination.location.lng
    );
    dispatch(setDistance(dist));
  }, [origin, destination]);

  return (
    <View style={styles.container}>
      <MapView
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
      </MapView>



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
        {distance !== null && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              Distance: {distance.toFixed(2)} km
            </Text>
          </View>
        )}
      </View>



      {/* Options Overlay */}
      <View style={styles.optionsContainer} pointerEvents="box-none">
        {/* <FlatList
          data={uberOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContent}
          renderItem={({ item }) => {
            const isSelected = selected === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelected(item.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.imageContainer}>
                  <Image
                    style={styles.optionImage}
                    source={{ uri: item.image }}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.optionTitle, isSelected && styles.textSelected]}>
                    {item.title}
                  </Text>
                  <View style={styles.priceRow}>
                    <Ionicons name="person" size={12} color={isSelected ? 'black' : '#6b7280'} />
                    <Text style={[styles.capacityText, isSelected && styles.textSelected]}>
                      {item.id === '2' ? '6' : '4'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  distanceContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  distanceText: {
    color: '#fff',
    fontWeight: 'bold',
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
});
