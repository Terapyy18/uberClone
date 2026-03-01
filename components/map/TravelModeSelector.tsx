import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

const MODES: { key: TravelMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'DRIVING', label: 'Uber', icon: 'car' },
    { key: 'WALKING', label: 'Marche', icon: 'walk' },
    { key: 'BICYCLING', label: 'Vélo', icon: 'bicycle' },
];

interface Props {
    travelMode: TravelMode;
    onSelect: (mode: TravelMode) => void;
    topOffset: number;
}

export default function TravelModeSelector({ travelMode, onSelect, topOffset }: Props) {
    return (
        <View style={[styles.container, { top: topOffset }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {MODES.map((mode) => (
                    <TouchableOpacity
                        key={mode.key}
                        style={[styles.btn, travelMode === mode.key && styles.btnSelected]}
                        onPress={() => onSelect(mode.key)}
                    >
                        <Ionicons name={mode.icon} size={20} color={travelMode === mode.key ? '#fff' : '#000'} />
                        <Text style={[styles.label, travelMode === mode.key && styles.labelSelected]}>{mode.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { position: 'absolute', left: 0, right: 0, zIndex: 15 },
    scroll: { paddingHorizontal: 16, gap: 8 },
    btn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6,
        borderRadius: 20, gap: 8, borderWidth: 1, borderColor: '#e5e7eb',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    btnSelected: { backgroundColor: '#000', borderColor: '#000' },
    label: { fontSize: 14, fontWeight: '600', color: '#000' },
    labelSelected: { color: '#fff' },
});
