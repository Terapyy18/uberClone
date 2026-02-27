import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      />

      {/* Floating Header */}
      <View style={[styles.header, { top: insets.top || 20 }]}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Options Overlay */}
      <View style={styles.optionsContainer} pointerEvents="box-none">
        <FlatList
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
        />
      </View>
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
    zIndex: 20,
  },
  menuButton: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
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
