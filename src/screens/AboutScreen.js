import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme/colors';
import { useStation } from '../context/StationContext';

export default function AboutScreen() {
  const { station, logoSource } = useStation();
  const aboutText = station.aboutText || (
    'Welcome to ' + station.name + '! We broadcast 24/7 bringing you the best shows, music and ' +
    'conversations. Tune in live, catch up on podcasts, and stay connected with our community.'
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <View style={styles.center}>
          <Image source={logoSource} style={styles.logo} />
          <Text style={styles.name}>{station.name}</Text>
          <Text style={styles.tagline}>{station.tagline}</Text>
        </View>

        <Text style={styles.body}>{aboutText}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact</Text>
          {!!station.email && <Text style={styles.cardLine}>Email: {station.email}</Text>}
          {!!station.phone && <Text style={styles.cardLine}>Phone: {station.phone}</Text>}
          {!!station.website && <Text style={styles.cardLine}>Web: {station.website}</Text>}
        </View>

        <Text style={styles.footer}>(c) {new Date().getFullYear()} {station.name}. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { width: 100, height: 100, borderRadius: radius.lg, marginBottom: spacing.md },
  name: { color: colors.text, fontSize: 24, fontWeight: '800' },
  tagline: { color: colors.textDim, fontSize: 14, marginTop: 4 },
  body: { color: colors.textDim, lineHeight: 22, marginBottom: spacing.xl },
  card: { backgroundColor: colors.card, padding: spacing.lg, borderRadius: radius.md },
  cardTitle: { color: colors.text, fontWeight: '800', marginBottom: spacing.sm, fontSize: 16 },
  cardLine: { color: colors.textDim, fontSize: 14, marginVertical: 3 },
  footer: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl, fontSize: 12 },
});
