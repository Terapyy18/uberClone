import { Ionicons } from '@expo/vector-icons';
import { GlassContainer, GlassView } from 'expo-glass-effect';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface PlaceResult {
    location: { lat: number; lng: number };
    description: string;
}

interface Props {
    onSelectPlace: (place: PlaceResult) => void;
    topOffset: number;
}

export default function SearchBar({ onSelectPlace, topOffset }: Props) {
    return (
        <View style={[styles.container, { top: topOffset }]}>
            <GlassContainer style={StyleSheet.absoluteFillObject} spacing={0}>
                <GlassView style={styles.glass} glassEffectStyle="clear" />
            </GlassContainer>
            <View style={styles.inner}>
                <Ionicons name="search" size={22} color="#ffffffff" style={styles.icon} />
                <GooglePlacesAutocomplete
                    fetchDetails
                    onPress={(data, details = null) => {
                        if (details) {
                            onSelectPlace({
                                location: {
                                    lat: details.geometry.location.lat,
                                    lng: details.geometry.location.lng,
                                },
                                description: data.description,
                            });
                        }
                    }}
                    placeholder="Saisissez une destination"
                    nearbyPlacesAPI="GooglePlacesSearch"
                    debounce={200}
                    enablePoweredByContainer={false}
                    renderRow={(rowData) => (
                        <View style={styles.rowContainer}>
                            <GlassContainer style={StyleSheet.absoluteFillObject} spacing={0}>
                                <GlassView style={styles.rowGlass} glassEffectStyle="clear" />
                            </GlassContainer>
                            <Text style={styles.rowText}>{rowData.description}</Text>
                        </View>
                    )}
                    query={{
                        key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY!,
                        language: 'fr',
                    }}
                    styles={{
                        container: { flex: 1, overflow: 'visible' },
                        textInputContainer: { backgroundColor: 'transparent' },
                        textInput: [styles.textInput, { backgroundColor: 'transparent' }],
                        listView: {
                            backgroundColor: 'transparent', elevation: 0,
                            position: 'absolute', top: 50, left: 0, right: 0,
                        },
                        row: { backgroundColor: 'transparent', padding: 0, height: 48 },
                        separator: { height: 0, backgroundColor: 'transparent' },
                        description: { color: '#ffffff', fontSize: 15, fontWeight: '500' },
                    }}
                    textInputProps={{ placeholderTextColor: '#ffffffff' }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute', left: 16, right: 16, zIndex: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
    },
    glass: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
    inner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6 },
    icon: { marginRight: 12 },
    textInput: { fontSize: 16, fontWeight: '600', color: '#fff' },
    rowContainer: { flex: 1, height: 48, justifyContent: 'center', paddingHorizontal: 13, marginBottom: 4 },
    rowGlass: { ...StyleSheet.absoluteFillObject, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    rowText: { color: '#fff', fontSize: 15, fontWeight: '500' },
});
