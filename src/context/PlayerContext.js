import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { STATION } from '../config/station';
import { createApi } from '../api/streamo';
import { storage } from '../utils/storage';
import { useStation } from './StationContext';

const PlayerContext = createContext(null);
export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
};

export function PlayerProvider({ children }) {
  const { station } = useStation();
  const soundRef = useRef(null);
  const reconnectTimer = useRef(null);
  const metaTimer = useRef(null);
  const retryCount = useRef(0);
  const currentSourceRef = useRef(null);
  const isReconnectingRef = useRef(false);
  const lastErrorRef = useRef(null);
  const apiRef = useRef(createApi(station || STATION));

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [volume, setVolume] = useState(1.0);
  const [rate, setRate] = useState(1.0);
  const [currentSource, setCurrentSource] = useState(null);
  const [currentPodcast, setCurrentPodcast] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [nowPlaying, setNowPlaying] = useState(() => ({
    title: station?.name || STATION.name,
    artist: 'Live Stream',
    dj: '',
    artwork: '',
  }));

  useEffect(() => { currentSourceRef.current = currentSource; }, [currentSource]);
  useEffect(() => { lastErrorRef.current = lastError; }, [lastError]);
  useEffect(() => { apiRef.current = createApi(station || STATION); }, [station]);

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        });
        const v = await storage.getVolume();
        setVolume(v);
      } catch (e) {}
    })();

    refreshMetadata();
    clearInterval(metaTimer.current);
    metaTimer.current = setInterval(refreshMetadata, (station?.metadataRefreshMs || STATION.metadataRefreshMs || 15000));

    return () => {
      clearInterval(metaTimer.current);
      clearTimeout(reconnectTimer.current);
      unload();
    };
  }, [station?.metadataRefreshMs]);

  const refreshMetadata = async () => {
    try {
      const res = await apiRef.current.getNowPlaying();
      if (!res?.ok) return;
      if (!currentSourceRef.current || currentSourceRef.current === 'live') setNowPlaying(res.data);
    } catch {}
  };

  const unload = async () => {
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch {}
      soundRef.current = null;
    }
    setIsBuffering(false);
  };

  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) {
      if (status.error) setLastError('Playback error: ' + status.error);
      if (status.error && currentSourceRef.current === 'live') scheduleReconnect();
      return;
    }
    if (lastErrorRef.current) setLastError(null);
    setIsPlaying(status.isPlaying);
    setIsBuffering(!!status.isBuffering);
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    if (status.didJustFinish && currentSourceRef.current === 'live') scheduleReconnect();
  };

  const isStreamConfigured = () => {
    const url = station?.streamUrl || STATION.streamUrl;
    if (!url) return false;
    const v = String(url).toLowerCase();
    return !v.includes('streaming.example.com') && !v.includes('example.com');
  };

  const scheduleReconnect = () => {
    if (isReconnectingRef.current) return;
    isReconnectingRef.current = true;
    setIsReconnecting(true);
    retryCount.current += 1;
    const base = station?.reconnectBackoff || STATION.reconnectBackoff || 1.5;
    const max = station?.reconnectMaxDelayMs || STATION.reconnectMaxDelayMs || 10000;
    const delay = Math.min(1000 * Math.pow(base, retryCount.current), max);
    clearTimeout(reconnectTimer.current);
    reconnectTimer.current = setTimeout(() => playLive(), delay);
  };

  const playLive = async () => {
    try {
      if (!isStreamConfigured()) {
        setLastError('Stream URL is not configured.');
        clearTimeout(reconnectTimer.current);
        isReconnectingRef.current = false;
        setIsReconnecting(false);
        setIsPlaying(false);
        setCurrentSource(null);
        return;
      }
      setIsLoading(true);
      await unload();
      setRate(1.0);
      const { sound } = await Audio.Sound.createAsync(
        { uri: station?.streamUrl || STATION.streamUrl },
        { shouldPlay: true, volume, isLooping: false, progressUpdateIntervalMillis: 500, rate: 1.0 },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setCurrentSource('live');
      setCurrentPodcast(null);
      setIsPlaying(true);
      setLastError(null);
      setIsReconnecting(false);
      isReconnectingRef.current = false;
      retryCount.current = 0;
      refreshMetadata();
    } catch (e) {
      if (__DEV__) console.log('[playLive]', e.message);
      scheduleReconnect();
    } finally {
      setIsLoading(false);
    }
  };

  const playPodcast = async (podcast) => {
    try {
      if (!podcast?.audioUrl) {
        setLastError('This podcast is missing an audio URL.');
        return;
      }
      setIsLoading(true);
      await unload();
      const { sound } = await Audio.Sound.createAsync(
        { uri: podcast.audioUrl },
        { shouldPlay: true, volume, progressUpdateIntervalMillis: 500, rate },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setCurrentSource(podcast.id);
      setCurrentPodcast(podcast);
      setNowPlaying({
        title: podcast.title,
        artist: podcast.host,
        dj: 'Podcast',
        artwork: podcast.artwork,
      });
      setIsPlaying(true);
      setLastError(null);
      storage.addRecent(podcast);
    } catch (e) {
      if (__DEV__) console.log('[playPodcast]', e.message);
      setLastError(e?.message || 'Could not play podcast.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = async () => {
    if (!soundRef.current) return playLive();
    try {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (e) {
      setLastError(e?.message || 'Playback failed.');
    }
  };

  const stop = async () => {
    clearTimeout(reconnectTimer.current);
    isReconnectingRef.current = false;
    setIsReconnecting(false);
    await unload();
    setIsPlaying(false);
    setCurrentSource(null);
  };

  const changeVolume = async (v) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolume(clamped);
    storage.setVolume(clamped);
    if (soundRef.current) {
      try { await soundRef.current.setVolumeAsync(clamped); } catch {}
    }
  };

  const seek = async (seconds) => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    if (status.isLoaded) {
      const newPos = Math.max(0, status.positionMillis + seconds * 1000);
      await soundRef.current.setPositionAsync(newPos);
    }
  };

  const seekTo = async (ms) => {
    if (!soundRef.current) return;
    try { await soundRef.current.setPositionAsync(Math.max(0, ms)); } catch {}
  };

  const setPlaybackRate = async (nextRate) => {
    const v = Number(nextRate);
    const clamped = v >= 0.5 && v <= 2.0 ? v : 1.0;
    setRate(clamped);
    if (!soundRef.current) return;
    if (currentSourceRef.current === 'live') return;
    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) return;
      await soundRef.current.setRateAsync(clamped, true);
    } catch {}
  };

  return (
    <PlayerContext.Provider value={{
      isPlaying, isLoading, isBuffering, isReconnecting, lastError, volume,
      currentSource, currentPodcast, nowPlaying,
      position, duration, rate,
      isLive: currentSource === 'live',
      playLive, playPodcast, togglePlay, stop,
      changeVolume, seek, seekTo, setPlaybackRate, refreshMetadata,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}
