import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    session: any;
}

export default function PaymentSection({ session }: Props) {
    const { initPaymentSheet, presentPaymentSheet } = useStripe();
    const [isSettingUp, setIsSettingUp] = useState(false);

    const handleAddCard = async () => {
        if (!session?.user?.email) return;
        setIsSettingUp(true);
        try {
            const existingCustomerId = session.user.user_metadata?.stripe_customer_id;

            const { data, error } = await supabase.functions.invoke('stripe-payment', {
                body: { type: 'setup_intent', email: session.user.email, customerId: existingCustomerId },
            });

            if (error) throw new Error(data?.error || error.message);
            if (!data?.clientSecret || !data?.ephemeralKey || !data?.customer) {
                throw new Error(`Données manquantes: ${JSON.stringify(data)}`);
            }

            if (data.customer !== existingCustomerId) {
                await supabase.auth.updateUser({ data: { stripe_customer_id: data.customer } });
            }

            const initResponse = await initPaymentSheet({
                merchantDisplayName: 'Uber Clone',
                customerId: data.customer,
                customerEphemeralKeySecret: data.ephemeralKey,
                setupIntentClientSecret: data.clientSecret,
                allowsDelayedPaymentMethods: true,
                returnURL: 'uberclone://stripe-redirect',
            });

            if (initResponse.error) {
                Alert.alert('Erreur', initResponse.error.message);
                return;
            }

            const presentResponse = await presentPaymentSheet();
            if (presentResponse.error) {
                if (presentResponse.error.code !== 'Canceled') {
                    Alert.alert('Erreur', presentResponse.error.message);
                }
            } else {
                Alert.alert('Succès', 'Moyen de paiement enregistré ! 🎉');
            }
        } catch (err: any) {
            Alert.alert('Erreur', err.message || 'Une erreur est survenue');
        } finally {
            setIsSettingUp(false);
        }
    };

    return (
        <View style={styles.section}>
            <Text style={styles.title}>Paiement</Text>
            <TouchableOpacity style={styles.btn} onPress={handleAddCard} disabled={isSettingUp}>
                {isSettingUp ? (
                    <ActivityIndicator color="white" size="small" />
                ) : (
                    <>
                        <Ionicons name="card-outline" size={20} color="#fff" />
                        <Text style={styles.btnText}>+ Ajouter une carte bancaire</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    title: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
    btn: {
        backgroundColor: '#000', paddingVertical: 13, borderRadius: 12,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    btnText: { color: 'white', fontSize: 15, fontWeight: '600' },
});
