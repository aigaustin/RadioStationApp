import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../context/PlayerContext';
import { useStation } from '../context/StationContext';
import { colors, radius, spacing } from '../theme/colors';

export default function MiniPlayer({ onPress }) {
  const { nowPlaying, isPlaying, isLoading, togglePlay, currentSource, isReconnecting, isLive } = usePlayer();
  const { logoSource } = useStation();
  if (!currentSource) return null;
  const artworkSource = logoSource;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.container}>
      <View style={styles.liveBar} />
      <Image source={artworkSource} style={styles.art} />
      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>{nowPlaying.title}</Text>
        <Text numberOfLines={1} style={styles.artist}>
          {isReconnecting ? 'Reconnecting...' : nowPlaying.artist}
        </Text>
      </View>
      <TouchableOpacity onPress={togglePlay} style={styles.playBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, padding: spacing.sm + 2,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  liveBar: { width: 3, height: 44, backgroundColor: colors.primary, borderRadius: 2, marginRight: spacing.sm },
  art: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.bgElevated },
  info: { flex: 1, marginLeft: spacing.md },
  title: { color: colors.text, fontSize: 14, fontWeight: '600' },
  artist: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  playBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
});
