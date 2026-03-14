import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/store';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ visible, onClose }: Props) {
    const { session } = useAppSelector((state) => state.auth);
    const [displayName, setDisplayName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Sync avec la session quand le modal s'ouvre
    useEffect(() => {
        if (visible) {
            setDisplayName(session?.user?.user_metadata?.full_name || '');
        }
    }, [visible, session]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ data: { full_name: displayName } });
            if (error) throw error;
            Alert.alert('Succès', 'Profil mis à jour !');
            onClose();
        } catch (err: any) {
            Alert.alert('Erreur', err.message || 'Impossible de sauvegarder');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Modifier mon profil</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Nom affiché</Text>
                        <TextInput
                            style={styles.input}
                            value={displayName}
                            onChangeText={setDisplayName}
                            placeholder="Votre prénom et nom"
                            placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputDisabled}>
                            <Text style={styles.inputDisabledText}>{session?.user?.email}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving
                                ? <ActivityIndicator color="white" />
                                : <Text style={styles.saveBtnText}>Enregistrer</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 40,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 20, fontWeight: '700', color: '#111827' },
    label: { fontSize: 13, color: '#6b7280', fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
    input: {
        borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
        padding: 14, fontSize: 16, color: '#111827', marginBottom: 16,
    },
    inputDisabled: {
        borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
        padding: 14, backgroundColor: '#f9fafb', marginBottom: 24,
    },
    inputDisabledText: { fontSize: 16, color: '#9ca3af' },
    saveBtn: { backgroundColor: '#111827', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
