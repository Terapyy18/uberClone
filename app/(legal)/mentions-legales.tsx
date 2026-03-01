import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MentionsLegalesScreen() {
    return (
        <>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.subtitle}>
                    Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la
                    confiance en l'économie numérique (LCEN), il est précisé aux utilisateurs de
                    l'application mobile les présentes mentions légales.
                </Text>

                <Section title="Éditeur de l'application">
                    <Row label="Société" value="Votre Société SAS" />
                    <Row label="Forme juridique" value="Société par Actions Simplifiée (SAS)" />
                    <Row label="Capital social" value="1 000 €" />
                    <Row label="SIREN" value="000 000 000" />
                    <Row label="Siège social" value="1 rue de la Paix, 75001 Paris, France" />
                    <Row label="Directeur de publication" value="Prénom NOM" />
                    <Row label="Contact" value="contact@votreapp.fr" />
                </Section>

                <Section title="Hébergement">
                    <Row label="Hébergeur" value="Supabase Inc." />
                    <Row label="Adresse" value="970 Toa Payoh North, Singapour" />
                    <Row label="Site" value="supabase.com" />
                </Section>

                <Section title="Propriété intellectuelle">
                    <Text style={styles.text}>
                        L'ensemble des contenus présents sur l'application (textes, images, vidéos,
                        icônes, logo) sont protégés par le Code de la Propriété Intellectuelle.
                        Toute reproduction, même partielle, est interdite sans autorisation préalable
                        écrite de l'éditeur.
                    </Text>
                </Section>

                <Section title="Protection des données personnelles">
                    <Text style={styles.text}>
                        Les données personnelles collectées sont traitées conformément au Règlement
                        Général sur la Protection des Données (RGPD – UE 2016/679) et à la loi
                        Informatique et Libertés.{'\n\n'}
                        Responsable du traitement :{'\n'}
                        Votre Société SAS — privacy@votreapp.fr{'\n\n'}
                        Autorité de contrôle compétente :{'\n'}
                        Commission Nationale de l'Informatique et des Libertés (CNIL){'\n'}
                        3 Place de Fontenoy, TSA 80715, 75334 PARIS CEDEX 07{'\n'}
                        www.cnil.fr
                    </Text>
                </Section>

                <Section title="Droit applicable">
                    <Text style={styles.text}>
                        Les présentes mentions légales sont soumises au droit français. En cas de
                        litige, les tribunaux français seront seuls compétents.
                    </Text>
                </Section>

                <Text style={styles.version}>Version 1.0 — 28 février 2026</Text>
            </ScrollView>
        </>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20, paddingBottom: 100 },
    subtitle: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 24, fontStyle: 'italic' },
    section: {
        marginBottom: 24, backgroundColor: '#f9fafb', borderRadius: 14,
        padding: 16, borderWidth: 1, borderColor: '#f3f4f6',
    },
    sectionTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 12 },
    sectionContent: { gap: 6 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    rowLabel: { fontSize: 14, fontWeight: '600', color: '#374151', minWidth: 130 },
    rowValue: { fontSize: 14, color: '#6b7280', flex: 1 },
    text: { fontSize: 14, color: '#374151', lineHeight: 22 },
    version: { fontSize: 12, color: '#d1d5db', textAlign: 'center', marginTop: 8 },
});
