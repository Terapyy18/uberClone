import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PlaceResult {
    location: { lat: number; lng: number };
    description: string;
}

interface Props {
    onSelectPlace: (place: PlaceResult) => void;
    topOffset: number;
    onFocusChange?: (focused: boolean) => void;
}

export default function SearchBar({ onSelectPlace, topOffset, onFocusChange }: Props) {
    const insets = useSafeAreaInsets();
    const [isFocused, setIsFocused] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-20)).current;
    const placesRef = useRef<any>(null);

    const handleFocus = () => {
        setIsFocused(true);
        onFocusChange?.(true);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        ]).start();
    };

    const handleBlur = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -20, duration: 180, useNativeDriver: true }),
        ]).start(() => {
            setIsFocused(false);
            onFocusChange?.(false);
        });
    };

    const handleDismiss = () => {
        Keyboard.dismiss();
        placesRef.current?.setAddressText('');
        placesRef.current?.blur();
        handleBlur();
    };

    return (
        <>
            {/* ── Pill collapsed sur la carte ── */}
            {!isFocused && (
                <TouchableOpacity
                    style={[styles.pill, { top: topOffset }]}
                    onPress={handleFocus}
                    activeOpacity={0.9}
                >
                    <Ionicons name="search" size={20} color="#6b7280" style={styles.pillIcon} />
                    <Text style={styles.pillText}>Saisissez une destination</Text>
                </TouchableOpacity>
            )}

            {/* ── Overlay plein écran ── */}
            {isFocused && (
                <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                    <KeyboardAvoidingView
                        style={styles.flex}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={0}
                    >
                        {/*
                         * GooglePlacesAutocomplete doit être à la RACINE de la hiérarchie,
                         * pas imbriqué dans un View row, pour que sa listView s'affiche
                         * correctement en dessous de l'input.
                         */}
                        <Animated.View
                            style={[
                                styles.autocompleteContainer,
                                { paddingTop: insets.top + 8, transform: [{ translateY: slideAnim }] },
                            ]}
                        >
                            {/* Ligne : bouton retour + input */}
                            <View style={styles.searchRow}>
                                <TouchableOpacity
                                    onPress={handleDismiss}
                                    style={styles.backBtn}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons name="arrow-back" size={22} color="#111827" />
                                </TouchableOpacity>

                                <GooglePlacesAutocomplete
                                    ref={placesRef}
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
                                            handleDismiss();
                                        }
                                    }}
                                    placeholder="Saisissez une destination"
                                    nearbyPlacesAPI="GooglePlacesSearch"
                                    debounce={200}
                                    enablePoweredByContainer={false}
                                    query={{
                                        key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_APIKEY!,
                                        language: 'fr',
                                    }}
                                    textInputProps={{
                                        placeholderTextColor: '#9ca3af',
                                        autoFocus: true,
                                        onFocus: handleFocus,
                                        clearButtonMode: 'while-editing',
                                    }}
                                    styles={{
                                        // Le container doit être flex:1 pour prendre toute la largeur restante
                                        container: {
                                            flex: 1,
                                        },
                                        textInputContainer: {
                                            backgroundColor: '#f9fafb',
                                            borderRadius: 12,
                                            borderWidth: 1,
                                            borderColor: '#e5e7eb',
                                            paddingHorizontal: 4,
                                            height: 46,
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                        },
                                        textInput: {
                                            flex: 1,
                                            fontSize: 16,
                                            color: '#111827',
                                            fontWeight: '500',
                                            backgroundColor: 'transparent',
                                            marginBottom: 0,
                                            height: 44,
                                            paddingHorizontal: 8,
                                        },
                                        // La liste s'affiche sous l'input via le layout naturel du composant
                                        listView: {
                                            backgroundColor: '#ffffff',
                                            borderTopWidth: 1,
                                            borderTopColor: '#f3f4f6',
                                            // Pas de position absolute → flux normal
                                        },
                                        row: {
                                            backgroundColor: 'transparent',
                                            padding: 0,
                                            height: undefined,
                                            minHeight: 64,
                                        },
                                        separator: {
                                            height: 1,
                                            backgroundColor: '#f3f4f6',
                                            marginHorizontal: 16,
                                        },
                                        poweredContainer: { display: 'none' },
                                        description: { color: '#111827' },
                                    }}
                                    renderRow={(rowData) => (
                                        <View style={styles.rowItem}>
                                            <View style={styles.rowIconWrap}>
                                                <Ionicons name="location-outline" size={18} color="#6b7280" />
                                            </View>
                                            <View style={styles.rowTextWrap}>
                                                <Text style={styles.rowMain} numberOfLines={1}>
                                                    {rowData.structured_formatting?.main_text || rowData.description}
                                                </Text>
                                                {rowData.structured_formatting?.secondary_text ? (
                                                    <Text style={styles.rowSub} numberOfLines={1}>
                                                        {rowData.structured_formatting.secondary_text}
                                                    </Text>
                                                ) : null}
                                            </View>
                                        </View>
                                    )}
                                    renderLeftButton={() => (
                                        <Ionicons name="search" size={18} color="#9ca3af" style={styles.searchIcon} />
                                    )}
                                />
                            </View>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </Animated.View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },

    /* ── Pill ── */
    pill: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 13,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
    },
    pillIcon: { marginRight: 10 },
    pillText: { fontSize: 15, color: '#9ca3af', fontWeight: '500', flex: 1 },

    /* ── Overlay blanc plein écran ── */
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
        backgroundColor: '#ffffff',
    },

    /* ── Zone de l'autocomplete : header + liste en flux normal ── */
    autocompleteContainer: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },

    /* ── Ligne bouton retour + input ── */
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 10,
        gap: 10,
    },

    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },

    searchIcon: {
        marginLeft: 4,
        marginRight: 2,
    },

    /* ── Rows de résultats ── */
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    rowIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        flexShrink: 0,
    },
    rowTextWrap: { flex: 1 },
    rowMain: { fontSize: 15, fontWeight: '600', color: '#111827' },
    rowSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
});
