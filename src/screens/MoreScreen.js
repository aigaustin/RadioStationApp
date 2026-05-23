import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors, radius, spacing } from '../theme/colors';
import { useStation } from '../context/StationContext';
import ContactScreen from './ContactScreen';
import NotificationsScreen from './NotificationsScreen';
import AboutScreen from './AboutScreen';

const Stack = createNativeStackNavigator();

const MENU = [
  { key: 'contact', icon: 'chatbubbles-outline', label: 'Contact Us', screen: 'ContactInner' },
  { key: 'notif', icon: 'notifications-outline', label: 'Notifications', screen: 'NotificationsInner' },
  { key: 'about', icon: 'information-circle-outline', label: 'About', screen: 'AboutInner' },
];

function MoreHome() {
  const nav = useNavigation();
  const { station, logoSource } = useStation();
  const open = async (url) => {
    const v = url && !String(url).startsWith('http') ? `https://${url}` : url;
    const can = await Linking.canOpenURL(v).catch(() => false);
    if (!can) return Alert.alert('Unable to open', v);
    return Linking.openURL(v).catch(() => Alert.alert('Unable to open', v));
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }}>
        <View style={styles.brand}>
          <Image source={logoSource} style={styles.logo} />
          <Text style={styles.name}>{station.name}</Text>
          <Text style={styles.tagline}>{station.tagline}</Text>
        </View>

        {MENU.map((m) => (
          <TouchableOpacity key={m.key} style={styles.row} onPress={() => nav.navigate(m.screen)}>
            <Ionicons name={m.icon} size={22} color={colors.primary} />
            <Text style={styles.rowLabel}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        {!!station.listenerMapUrl && (
          <TouchableOpacity style={styles.row} onPress={() => open(station.listenerMapUrl)}>
            <Ionicons name="map-outline" size={22} color={colors.primary} />
            <Text style={styles.rowLabel}>Listener Map</Text>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {!!station.countryStatsUrl && (
          <TouchableOpacity style={styles.row} onPress={() => open(station.countryStatsUrl)}>
            <Ionicons name="flag-outline" size={22} color={colors.primary} />
            <Text style={styles.rowLabel}>Top Countries</Text>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.row} onPress={() => open(station.website)}>
          <Ionicons name="globe-outline" size={22} color={colors.primary} />
          <Text style={styles.rowLabel}>Visit Website</Text>
          <Ionicons name="open-outline" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <Text style={styles.version}>{station.footerText || 'v1.0.0 - Powered by Streamo Core'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function MoreScreen() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.bgElevated },
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '800' },
    }}>
      <Stack.Screen name="MoreHome" component={MoreHome} options={{ headerShown: false }} />
      <Stack.Screen name="ContactInner" component={ContactScreen} options={{ title: 'Contact' }} />
      <Stack.Screen name="NotificationsInner" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="AboutInner" component={AboutScreen} options={{ title: 'About' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginBottom: spacing.xxl },
  logo: { width: 90, height: 90, borderRadius: radius.lg, marginBottom: spacing.md },
  name: { color: colors.text, fontSize: 22, fontWeight: '800' },
  tagline: { color: colors.textDim, fontSize: 13, marginTop: 4 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.card, padding: 16, borderRadius: radius.md,
    marginBottom: spacing.sm + 2,
  },
  rowLabel: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
  version: { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl, fontSize: 12 },
});
