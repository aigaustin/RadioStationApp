import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { useFavorites } from '../hooks/useFavorites';
import { usePlayer } from '../context/PlayerContext';
import { useStation } from '../context/StationContext';
import { colors, radius, spacing } from '../theme/colors';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';

export default function FavoritesScreen() {
  const { favorites, toggle, reload } = useFavorites();
  const { playPodcast, togglePlay, currentPodcast, isPlaying } = usePlayer();
  const { logoSource } = useStation();

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  if (!favorites.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <SectionHeader title="Favorites" />
        <EmptyState
          icon="heart-outline"
          title="No favorites yet"
          subtitle="Tap the heart on any podcast to save it here."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <SectionHeader title="Favorites" subtitle={favorites.length + ' saved'} />
      <FlatList
        data={favorites}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              if (currentPodcast && currentPodcast.id === item.id && isPlaying) return togglePlay();
              return playPodcast(item);
            }}
            activeOpacity={0.85}
          >
            <Image source={item.artwork ? { uri: item.artwork } : logoSource} style={styles.art} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.sub}>{item.host} - {item.duration}</Text>
            </View>
            <TouchableOpacity onPress={() => toggle(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="heart" size={22} color={colors.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.sm + 2, alignItems: 'center', gap: spacing.md,
  },
  art: { width: 54, height: 54, borderRadius: radius.sm },
  title: { color: colors.text, fontWeight: '700' },
  sub: { color: colors.textDim, fontSize: 12, marginTop: 2 },
});
