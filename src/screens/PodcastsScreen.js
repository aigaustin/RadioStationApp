import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Linking, Alert, ActivityIndicator, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createApi } from '../api/mediacp';
import { colors } from '../theme/colors';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../hooks/useFavorites';
import PodcastCard from '../components/PodcastCard';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import { useStation } from '../context/StationContext';

export default function PodcastsScreen() {
  const { station } = useStation();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { playPodcast, togglePlay, currentPodcast, isPlaying } = usePlayer();
  const { isFavorite, toggle } = useFavorites();

  const load = useCallback(async (mode = 'initial') => {
    if (mode === 'refresh') setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await createApi(station).getPodcasts();
      if (!res?.ok) {
        setPodcasts([]);
        setError(res?.error || 'Could not load podcasts.');
        return;
      }
      const list = Array.isArray(res.data) ? res.data : [];
      setPodcasts(list);
      if (!list.length && !res.mocked) setError('No podcasts available.');
    } catch (e) {
      setPodcasts([]);
      setError(e?.message || 'Could not load podcasts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [station]);

  useEffect(() => { load('initial'); }, [load]);

  const downloadEpisode = async (item) => {
    const url = item?.audioUrl;
    if (!url) return Alert.alert('Unavailable', 'No audio link for this episode.');
    const can = await Linking.canOpenURL(url).catch(() => false);
    if (!can) return Alert.alert('Unable to open', url);
    return Linking.openURL(url).catch(() => Alert.alert('Unable to open', url));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <SectionHeader title="Podcasts" subtitle="Listen anytime, anywhere" />
      <FlatList
        data={podcasts}
        keyExtractor={(i, idx) => String(i.id || i.audioUrl || idx)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load('refresh')} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80, flexGrow: 1 }}
        renderItem={({ item }) => (
          <PodcastCard
            item={item}
            playing={currentPodcast && currentPodcast.id === item.id && isPlaying}
            faved={isFavorite(item.id)}
            onPlay={(p) => {
              if (currentPodcast && currentPodcast.id === p.id) return togglePlay();
              return playPodcast(p);
            }}
            onToggleFav={toggle}
            onDownload={downloadEpisode}
          />
        )}
        ListEmptyComponent={
          loading || refreshing ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <EmptyState
              icon="mic-outline"
              title={error ? 'Podcasts unavailable' : 'No podcasts'}
              subtitle={error || 'Check back later for new episodes.'}
            />
          )
        }
      />
    </SafeAreaView>
  );
}
