import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CGUScreen() {
    return (
        <>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.updated}>Dernière mise à jour : 28 février 2026</Text>

                <Text style={styles.intro}>
                    Les présentes Conditions Générales d'Utilisation (CGU) et Conditions Générales de Vente
                    (CGV) régissent l'accès et l'utilisation de l'application mobile.
                </Text>

                <Section title="1. Objet">
                    L'application met en relation des utilisateurs avec des prestataires de services. En
                    téléchargeant et utilisant l'application, vous acceptez sans réserve les présentes
                    conditions.
                </Section>

                <Section title="2. Inscription">
                    L'utilisation des services nécessite la création d'un compte. Vous vous engagez à fournir
                    des informations exactes et à maintenir la confidentialité de vos identifiants. Vous êtes
                    responsable de toute activité effectuée depuis votre compte.
                </Section>

                <Section title="3. Services et tarifs">
                    Les tarifs applicables sont affichés avant toute confirmation de commande. Toute commande
                    validée constitue une vente ferme. Les prix sont exprimés en euros TTC.
                </Section>

                <Section title="4. Paiement">
                    Les paiements sont sécurisés par Stripe. Nous acceptons les cartes bancaires Visa,
                    Mastercard et American Express. Le débit s'effectue à la validation de la commande.
                </Section>

                <Section title="5. Annulation et remboursement">
                    Toute commande peut être annulée sans frais dans les 2 minutes suivant sa validation.
                    Au-delà, des frais d'annulation peuvent s'appliquer selon les conditions du prestataire.
                </Section>

                <Section title="6. Responsabilité">
                    L'application est fournie «telle quelle». Nous ne pouvons être tenus responsables des
                    dommages indirects résultant de l'utilisation du service. Notre responsabilité est limitée
                    au montant de la dernière transaction effectuée.
                </Section>

                <Section title="7. Propriété intellectuelle">
                    L'ensemble des contenus de l'application (logo, design, code) sont protégés par le droit
                    d'auteur. Toute reproduction sans autorisation est interdite.
                </Section>

                <Section title="8. Résiliation">
                    Vous pouvez supprimer votre compte à tout moment depuis la section «Supprimer mon
                    compte» dans les paramètres du profil. La résiliation prend effet immédiatement.
                </Section>

                <Section title="9. Droit applicable">
                    Les présentes CGU/CGV sont soumises au droit français. Tout litige relève de la
                    compétence exclusive des tribunaux compétents de Paris.
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
    updated: { fontSize: 13, color: '#9ca3af', marginBottom: 12, fontStyle: 'italic' },
    intro: { fontSize: 14, color: '#374151', lineHeight: 22, marginBottom: 24, fontStyle: 'italic' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
    sectionText: { fontSize: 14, color: '#374151', lineHeight: 22 },
});
