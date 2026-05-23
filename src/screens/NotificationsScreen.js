import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Switch, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '../utils/storage';
import { colors, radius, spacing } from '../theme/colors';
import SectionHeader from '../components/SectionHeader';
import { requestNotificationPermission } from '../utils/notifications';
import { useStation } from '../context/StationContext';
import EmptyState from '../components/EmptyState';
import * as Notifications from 'expo-notifications';

export default function NotificationsScreen() {
  const { station } = useStation();
  const [settings, setSettings] = useState({ shows: true, announcements: true, newPodcasts: true });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [busy, setBusy] = useState(false);

  const pushRegisterUrl = useMemo(() => {
    try {
      const base = station?.remoteConfigUrl;
      if (!base) return null;
      const urlObj = new URL(base);
      const basePath = urlObj.pathname.replace(/\/config\/?$/, '');
      return urlObj.origin + basePath + '/api/push/register';
    } catch {
      return null;
    }
  }, [station?.remoteConfigUrl]);

  useEffect(() => {
    storage.getNotifSettings().then(setSettings);
    Notifications.getPermissionsAsync()
      .then((p) => setPermissionGranted(!!p?.granted))
      .catch(() => setPermissionGranted(false));
  }, []);

  const registerPushToken = async () => {
    if (!pushRegisterUrl) return false;
    const tokenRes = await Notifications.getExpoPushTokenAsync().catch(() => null);
    const token = tokenRes?.data;
    if (!token) return false;
    const deviceId = await storage.getDeviceId();
    const res = await fetch(pushRegisterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ token, deviceId }),
    }).catch(() => null);
    return !!res?.ok;
  };

  const handleRequestPermission = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const granted = await requestNotificationPermission();
      setPermissionGranted(!!granted);
      if (!granted) {
        Alert.alert('Permission not granted', 'Enable notifications in system settings to receive alerts.');
        return;
      }
      await registerPushToken();
      Alert.alert('Enabled', 'Notifications are enabled on this device.');
    } finally {
      setBusy(false);
    }
  };

  const handleTestNotification = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const granted = await requestNotificationPermission();
      setPermissionGranted(!!granted);
      if (!granted) {
        Alert.alert('Permission not granted', 'Enable notifications in system settings to test notifications.');
        return;
      }
      await registerPushToken();
      await Notifications.scheduleNotificationAsync({
        content: { title: station?.name || 'Radio App', body: 'Test notification received successfully.' },
        trigger: { seconds: 1 },
      });
      Alert.alert('Sent', 'A test notification will appear shortly.');
    } catch {
      Alert.alert('Oops', 'Could not send a test notification.');
    } finally {
      setBusy(false);
    }
  };

  const update = async (key, value) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert('Notifications disabled', 'Please enable notifications in system settings.');
        const next = { ...settings, [key]: false };
        setSettings(next);
        storage.setNotifSettings(next);
        return;
      }
    }
    const next = { ...settings, [key]: value };
    setSettings(next);
    storage.setNotifSettings(next);
  };

  const Row = ({ title, subtitle, value, onChange }) => (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sub}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} thumbColor="#fff" />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <SectionHeader title="Notifications" subtitle="Manage your alerts" />
      {!station.enableNotifications ? (
        <EmptyState
          icon="notifications-off-outline"
          title="Disabled"
          subtitle="This station has turned off notifications in the app configuration."
        />
      ) : (
        <View style={{ padding: spacing.xl }}>
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={styles.title}>Device Permission</Text>
              <Text style={styles.badge}>{permissionGranted ? 'Granted' : 'Not granted'}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleRequestPermission} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Request Permission</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={handleTestNotification} disabled={busy}>
                <Text style={styles.btnGhostText}>Test Notification</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Row title="Show Reminders" subtitle="Get notified before your favorite shows."
            value={settings.shows} onChange={v => update('shows', v)} />
          <Row title="Station Updates" subtitle="Announcements and special events."
            value={settings.announcements} onChange={v => update('announcements', v)} />
          <Row title="New Podcasts" subtitle="When a new episode is published."
            value={settings.newPodcasts} onChange={v => update('newPodcasts', v)} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', backgroundColor: colors.card, padding: 16,
    borderRadius: radius.md, marginBottom: 12, alignItems: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 12,
  },
  title: { color: colors.text, fontWeight: '700', fontSize: 15 },
  sub: { color: colors.textDim, fontSize: 12, marginTop: 4 },
  badge: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.bgElevated,
  },
  btn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  btnGhost: {
    backgroundColor: colors.bgElevated,
  },
  btnGhostText: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 13,
  },
});
