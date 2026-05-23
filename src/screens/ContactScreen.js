import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Linking, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/colors';
import { useStation } from '../context/StationContext';
import { createApi } from '../api/mediacp';
import SectionHeader from '../components/SectionHeader';

export default function ContactScreen() {
  const { station } = useStation();
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);

  const openLink = async (url) => {
    const can = await Linking.canOpenURL(url).catch(() => false);
    if (!can) {
      Alert.alert('Unable to open', url);
      return false;
    }
    const opened = await Linking.openURL(url).then(() => true).catch(() => false);
    if (!opened) Alert.alert('Unable to open', url);
    return opened;
  };

  const submit = async () => {
    if (!name.trim() || !msg.trim()) return Alert.alert('Please fill in all fields');
    setSending(true);
    try {
      const canUseServer = !!station.apiBase && !!station.stationId;
      const res = canUseServer
        ? await createApi(station).sendContactMessage({ name: name.trim(), message: msg.trim() })
        : { ok: false, error: 'Server contact is not configured' };
      const body = encodeURIComponent('From: ' + name.trim() + '\n\n' + msg.trim());
      if (station.email) {
        const mailto = 'mailto:' + station.email + '?subject=Message from App&body=' + body;
        const ok = await openLink(mailto);
        if (!ok) return;
      }
      if (!station.email && !res?.ok) {
        Alert.alert('Contact unavailable', res?.error || 'Contact is not configured for this station.');
        return;
      }
      Alert.alert(
        'Message ready',
        station.email
          ? (res?.ok
            ? 'Thank you! Your email app will send the message.'
            : 'We could not send via server. Your email app will send the message.')
          : 'Thank you! Your message was sent.'
      );
      setName(''); setMsg('');
    } catch (e) {
      Alert.alert('Could not send', e?.message || 'Please try again.');
    } finally { setSending(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <SectionHeader title="Contact Us" subtitle="Reach out via your favorite channel" />

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.quick, { backgroundColor: '#25D366' }]}
              onPress={() => openLink('https://wa.me/' + station.whatsapp)}
              disabled={!station.whatsapp}
            >
              <Ionicons name="logo-whatsapp" size={22} color="#fff" />
              <Text style={styles.quickTxt}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quick, { backgroundColor: colors.primary }]}
              onPress={() => openLink('tel:' + station.phone)}
              disabled={!station.phone}
            >
              <Ionicons name="call" size={22} color="#fff" />
              <Text style={styles.quickTxt}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quick, { backgroundColor: colors.accent }]}
              onPress={() => openLink('mailto:' + station.email)}
              disabled={!station.email}
            >
              <Ionicons name="mail" size={22} color="#fff" />
              <Text style={styles.quickTxt}>Email</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
            value={msg}
            onChangeText={setMsg}
            placeholder="Your message or song request..."
            placeholderTextColor={colors.textMuted}
            multiline
          />

          <TouchableOpacity style={styles.submit} onPress={submit} disabled={sending}>
            <Text style={styles.submitTxt}>{sending ? 'Sending...' : 'Send Message'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginBottom: spacing.xl, paddingHorizontal: spacing.xl },
  quick: { flex: 1, padding: 14, borderRadius: radius.md, alignItems: 'center', gap: 6 },
  quickTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  label: { color: colors.textDim, marginBottom: 6, marginTop: spacing.sm, fontSize: 13, marginHorizontal: spacing.xl },
  input: {
    backgroundColor: colors.card, borderRadius: radius.md, padding: 14,
    color: colors.text, borderWidth: 1, borderColor: colors.border,
    marginHorizontal: spacing.xl,
  },
  submit: {
    backgroundColor: colors.primary, padding: 16, borderRadius: radius.md,
    alignItems: 'center', marginTop: spacing.xl, marginHorizontal: spacing.xl,
  },
  submitTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
