import { LocationState } from '@/store/slices/navSlice';
import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

type TravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

interface Props {
    origin: LocationState | null;
    destination: LocationState | null;
    travelMode: TravelMode;
    mapRef: React.RefObject<MapView>;
    onRouteReady: (distance: number, duration: number, coordinates: any[]) => void;
}

export default function MapViewWrapper({ origin, destination, travelMode, mapRef, onRouteReady }: Props) {
    return (
        <MapView
            ref={mapRef}
            style={{ ...require('react-native').StyleSheet.absoluteFillObject }}
            showsUserLocation
            initialRegion={
                origin ? {
                    latitude: origin.location!.lat,
                    longitude: origin.location!.lng,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                } : undefined
            }
        >
            {origin?.location && (
                <Marker
                    coordinate={{ latitude: origin.location.lat, longitude: origin.location.lng }}
                    title="Origin"
                    description={origin.description || 'Current Location'}
                    identifier="origin"
                />
            )}
            {destination?.location && (
                <Marker
                    coordinate={{ latitude: destination.location.lat, longitude: destination.location.lng }}
                    title="Destination"
                    description={destination.description || ''}
                    identifier="destination"
                />
            )}
            {origin && destination && (
                <MapViewDirections
                    origin={{ latitude: origin.location!.lat, longitude: origin.location!.lng }}
                    destination={{ latitude: destination.location!.lat, longitude: destination.location!.lng }}
                    apikey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY!}
                    strokeWidth={3}
                    strokeColor="black"
                    mode={travelMode}
                    onReady={(result) => {
                        onRouteReady(result.distance, result.duration, result.coordinates);
                    }}
                />
            )}
        </MapView>
    );
}
