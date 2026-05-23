import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/colors';
import { useStation } from '../context/StationContext';

export default function PodcastCard({ item, playing, faved, onPlay, onToggleFav, onDownload }) {
  const { logoSource } = useStation();
  const openAudio = async () => {
    const url = item?.audioUrl;
    if (!url) return Alert.alert('Unavailable', 'No audio link for this episode.');
    const can = await Linking.canOpenURL(url).catch(() => false);
    if (!can) return Alert.alert('Unable to open', url);
    return Linking.openURL(url).catch(() => Alert.alert('Unable to open', url));
  };

  return (
    <View style={styles.card}>
      <Image source={item.artwork ? { uri: item.artwork } : logoSource} style={styles.art} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.host}>{item.host} - {item.duration}</Text>
        <Text style={styles.date}>{item.date}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.playBtn} onPress={() => onPlay(item)} disabled={!item?.audioUrl}>
            <Ionicons name={playing ? 'pause' : 'play'} size={16} color="#fff" />
            <Text style={styles.playTxt}>{playing ? 'Playing' : 'Play'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onToggleFav(item)} style={styles.iconBtn}>
            <Ionicons name={faved ? 'heart' : 'heart-outline'} size={22} color={faved ? colors.danger : colors.textDim} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDownload ? onDownload(item) : openAudio()}
            style={styles.iconBtn}
          >
            <Ionicons name="download-outline" size={22} color={colors.textDim} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md, gap: spacing.md,
  },
  art: { width: 90, height: 90, borderRadius: radius.sm, backgroundColor: colors.bgElevated },
  title: { color: colors.text, fontWeight: '700', fontSize: 15 },
  host: { color: colors.textDim, fontSize: 12, marginTop: 4 },
  date: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: spacing.sm + 2 },
  playBtn: {
    flexDirection: 'row', backgroundColor: colors.primary, paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: radius.full, alignItems: 'center', gap: 4,
  },
  playTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  iconBtn: { padding: 4 },
});
