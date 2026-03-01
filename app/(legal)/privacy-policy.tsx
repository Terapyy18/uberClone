import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PrivacyPolicyScreen() {
    return (
        <>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.updated}>Dernière mise à jour : 28 février 2026</Text>

                <Section title="1. Collecte des données">
                    Nous collectons les données que vous nous fournissez lors de votre inscription (nom, adresse
                    e-mail), ainsi que les données d'utilisation de l'application (localisation lors des
                    trajets, historique de commandes).
                </Section>

                <Section title="2. Utilisation des données">
                    Vos données sont utilisées pour :{'\n'}
                    • Fournir et améliorer nos services{'\n'}
                    • Traiter vos paiements de façon sécurisée{'\n'}
                    • Vous envoyer des communications importantes{'\n'}
                    • Respecter nos obligations légales
                </Section>

                <Section title="3. Partage des données">
                    Nous ne vendons jamais vos données personnelles. Elles peuvent être partagées avec nos
                    prestataires techniques (hébergement, paiement) dans la limite strictement nécessaire à
                    l'exécution de nos services.
                </Section>

                <Section title="4. Conservation des données">
                    Vos données sont conservées pendant toute la durée de votre compte, puis pendant 3 ans
                    après sa suppression conformément aux obligations légales françaises.
                </Section>

                <Section title="5. Vos droits (RGPD)">
                    Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
                    Informatique et Libertés, vous disposez des droits suivants :{'\n'}
                    • Droit d'accès{'\n'}
                    • Droit de rectification{'\n'}
                    • Droit à l'effacement («droit à l'oubli»){'\n'}
                    • Droit à la portabilité{'\n'}
                    • Droit d'opposition{'\n\n'}
                    Pour exercer ces droits, contactez-nous à : privacy@votreapp.fr
                </Section>

                <Section title="6. Cookies et traceurs">
                    L'application utilise des identifiants publicitaires (IDFA sur iOS, GAID sur Android)
                    uniquement avec votre consentement explicite. Vous pouvez à tout moment révoquer ce
                    consentement dans les paramètres de l'application.
                </Section>

                <Section title="7. Sécurité">
                    Vos données sont chiffrées en transit (TLS) et au repos. L'accès aux données est soumis
                    à une authentification stricte et journalisé.
                </Section>

                <Section title="8. Contact & DPO">
                    Délégué à la Protection des Données : privacy@votreapp.fr{'\n'}
                    Autorité de contrôle : CNIL — www.cnil.fr
                </Section>
            </ScrollView>
        </>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionText}>{children}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20, paddingBottom: 100 },
    updated: { fontSize: 13, color: '#9ca3af', marginBottom: 24, fontStyle: 'italic' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
    sectionText: { fontSize: 14, color: '#374151', lineHeight: 22 },
});
