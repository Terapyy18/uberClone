import { Stack, useRouter } from 'expo-router';

/**
 * Stack layout pour les pages légales.
 * Navigation depuis le profil → fond blanc, bouton retour natif.
 */
export default function LegalLayout() {
    const router = useRouter();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#111827',
                headerTitleStyle: { fontWeight: '700', fontSize: 17 },
                headerShadowVisible: false,
            }}
        />
    );
}
