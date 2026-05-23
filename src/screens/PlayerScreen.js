import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator, Share, Alert, ScrollView, Dimensions,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { usePlayer } from '../context/PlayerContext';
import { useStation } from '../context/StationContext';
import { colors, radius, spacing } from '../theme/colors';

const { width, height } = Dimensions.get('window');

function formatTime(ms) {
  if (typeof ms !== 'number' || ms < 0 || isNaN(ms)) return '0:00';
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return String(h) + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  return String(m) + ':' + String(s).padStart(2, '0');
}

export default function PlayerScreen() {
  const { station, logoSource } = useStation();
  const {
    isPlaying, isBuffering, isReconnecting, togglePlay,
    nowPlaying, position, duration, rate, setPlaybackRate,
    seek, seekTo, currentPodcast, lastError, isLive,
    playLive
  } = usePlayer();
  
  const progressWidthRef = useRef(0);
  
  const onShare = async () => {
    try {
      const msg = `I'm listening to ${nowPlaying.title} on ${station.name}! Tune in now.`;
      await Share.share({ message: msg });
    } catch (err) {
      Alert.alert('Share Error', err.message);
    }
  };

  const hasArtwork = nowPlaying?.artwork && typeof nowPlaying.artwork === 'string';
  const artworkSource = hasArtwork ? { uri: nowPlaying.artwork } : logoSource;
  
  const canSeek = !!currentPodcast && duration > 0;
  const progress = canSeek ? Math.max(0, Math.min(1, position / duration)) : 0;
  const isLoading = isBuffering || isReconnecting;
  
  // Use vibrant gradients for the background
  const bgGradient = [colors.bgElevated, colors.bg];
  const primaryColor = colors.primary !== '#000000' && colors.primary !== '#ffffff' ? colors.primary : '#3B82F6';
  const overlayGradient = [`${primaryColor}66`, `${primaryColor}11`, 'transparent', '#000'];

  return (
    <LinearGradient colors={bgGradient} style={styles.container}>
      <ImageBackground source={artworkSource} style={StyleSheet.absoluteFillObject} blurRadius={80} opacity={0.4}>
        <LinearGradient colors={overlayGradient} style={StyleSheet.absoluteFillObject} />
      </ImageBackground>
      
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          
          <View style={styles.header}>
            <View style={styles.liveWrap}>
              <View style={[styles.liveDot, { backgroundColor: isLive ? colors.danger : colors.textMuted }]} />
              <Text style={styles.liveText}>{isLive ? 'LIVE' : (currentPodcast ? 'PODCAST' : 'OFF AIR')}</Text>
            </View>
            <TouchableOpacity onPress={onShare} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.shareBtn}>
              <Ionicons name="share-social-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.artworkWrap}>
            <View style={styles.artworkShadow}>
              <Image source={artworkSource} style={styles.artwork} />
            </View>
            {(isReconnecting || isBuffering) && (
              <View style={styles.reconnectOverlay}>
                <BlurView intensity={60} tint="dark" style={styles.reconnectBlur}>
                  <ActivityIndicator color="#fff" size="large" />
                  <Text style={styles.reconnectText}>{isReconnecting ? 'Reconnecting...' : 'Buffering...'}</Text>
                </BlurView>
              </View>
            )}
          </View>

          <View style={styles.metaData}>
            <Text style={styles.titleText} numberOfLines={2}>{nowPlaying.title}</Text>
            <Text style={styles.artistText} numberOfLines={1}>{nowPlaying.artist}</Text>
            {!!nowPlaying.dj && (
              <Text style={styles.djText} numberOfLines={1}>Host: {nowPlaying.dj}</Text>
            )}
          </View>

          {/* Glassmorphic Controls Panel */}
          <BlurView intensity={80} tint="dark" style={styles.controlsGlass}>
            
            {currentPodcast && (
              <View style={styles.progressWrap}>
                <TouchableOpacity
                  activeOpacity={1}
                  onLayout={e => { progressWidthRef.current = e.nativeEvent.layout.width; }}
                  onPress={e => {
                    if (!canSeek) return;
                    const w = progressWidthRef.current || 1;
                    const x = e.nativeEvent.locationX || 0;
                    const next = Math.max(0, Math.min(1, x / w));
                    seekTo(Math.floor(next * duration));
                  }}
                  style={styles.progressBar}
                >
                  <View style={[styles.progressFill, { width: (progress * 100) + '%' }]} />
                </TouchableOpacity>
                <View style={styles.progressMeta}>
                  <Text style={styles.progressTime}>{formatTime(position)}</Text>
                  <TouchableOpacity onPress={() => setPlaybackRate(rate === 1 ? 1.5 : 1)} style={styles.rateBtn} activeOpacity={0.85}>
                    <Text style={styles.rateTxt}>{rate.toFixed(1)}x</Text>
                  </TouchableOpacity>
                  <Text style={styles.progressTime}>{formatTime(duration)}</Text>
                </View>
              </View>
            )}

            <View style={styles.controls}>
              <TouchableOpacity
                onPress={() => currentPodcast ? seek(-15000) : null}
                style={[styles.ctrlBtn, { opacity: currentPodcast ? 1 : 0.3 }]}
                disabled={!currentPodcast}
              >
                <Ionicons name="play-back" size={28} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlay}
                style={styles.playBtn}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.primary} size="large" />
                ) : (
                  <LinearGradient colors={[colors.primary, colors.accent]} style={styles.playBtnGradient} start={{x:0, y:0}} end={{x:1, y:1}}>
                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={38} color="#fff" style={{ marginLeft: isPlaying ? 0 : 4 }} />
                  </LinearGradient>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => currentPodcast ? seek(15000) : playLive()}
                style={[styles.ctrlBtn, { opacity: (currentPodcast || !isLive) ? 1 : 0.3 }]}
              >
                <Ionicons name={currentPodcast ? "play-forward" : "radio"} size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {lastError && (
              <Text style={styles.errorText}>{lastError}</Text>
            )}

          </BlurView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  liveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveDot: {
    width: 8, height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  artworkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  artworkShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  artwork: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  reconnectOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    overflow: 'hidden',
  },
  reconnectBlur: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reconnectText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  metaData: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  titleText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  artistText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  djText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  controlsGlass: {
    borderRadius: 32,
    padding: spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  progressWrap: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  rateBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rateTxt: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  ctrlBtn: {
    padding: spacing.sm,
  },
  playBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  playBtnGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF453A',
    textAlign: 'center',
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: '600',
  },
});
