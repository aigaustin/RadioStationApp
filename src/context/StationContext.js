import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { STATION as BASE_STATION } from '../config/station';
import { storage } from '../utils/storage';
import { applyStationTheme } from '../theme/colors';
import * as Notifications from 'expo-notifications';

const StationContext = createContext(null);

const DEFAULT_TIMEOUT_MS = 8000;

function withTimeout(promise, timeoutMs) {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

function pickObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function normalizeRemoteConfig(raw) {
  let obj = pickObject(raw);
  if (!obj) return null;
  if (obj.ok && obj.data) {
    obj = obj.data;
  }
  
  const branding = pickObject(obj.branding) || {};
  const contact = pickObject(obj.contact) || {};
  const features = pickObject(obj.features) || {};
  const app = pickObject(obj.app) || {};
  const social = pickObject(obj.social) || {};
  const streams = Array.isArray(obj.streams) ? obj.streams : [];

  const out = {};
  if (typeof app.name === 'string') out.name = app.name;
  if (typeof app.description === 'string') out.aboutText = app.description;

  // Extract from root if present (legacy fallback)
  if (typeof obj.name === 'string') out.name = obj.name;
  if (typeof obj.tagline === 'string') out.tagline = obj.tagline;
  if (typeof obj.footerText === 'string') out.footerText = obj.footerText;
  if (typeof obj.website === 'string') out.website = obj.website;
  if (typeof obj.aboutText === 'string') out.aboutText = obj.aboutText;

  // Map streams from the new backend
  if (streams.length > 0) {
    const s1 = streams[0];
    if (s1.url) out.streamUrl = s1.url;
    if (s1.domain) {
       out.apiBase = 'https://' + s1.domain;
       out.stationId = 'andradio'; // Could be dynamic if backend provided it
       out.nowPlayingUrl = 'https://' + s1.domain + '/json/stream/andradio';
       out.scheduleEventsUrl = 'https://' + s1.domain + '/controller/Event/1/upcomingEvents';
    }
  }

  // Legacy mappings for urls
  if (typeof obj.streamUrl === 'string') out.streamUrl = obj.streamUrl;
  if (typeof obj.nowPlayingUrl === 'string') out.nowPlayingUrl = obj.nowPlayingUrl;
  if (typeof obj.scheduleUrl === 'string') out.scheduleUrl = obj.scheduleUrl;
  if (typeof obj.scheduleEventsUrl === 'string') out.scheduleEventsUrl = obj.scheduleEventsUrl;
  if (typeof obj.scheduleWeekUrl === 'string') out.scheduleWeekUrl = obj.scheduleWeekUrl;
  if (typeof obj.listenerMapUrl === 'string') out.listenerMapUrl = obj.listenerMapUrl;
  if (typeof obj.countryStatsUrl === 'string') out.countryStatsUrl = obj.countryStatsUrl;

  if (typeof obj.apiBase === 'string') out.apiBase = obj.apiBase;
  if (typeof obj.stationId === 'string') out.stationId = obj.stationId;

  if (typeof contact.email === 'string') out.email = contact.email;
  if (typeof contact.phone === 'string') out.phone = contact.phone;
  if (typeof contact.whatsapp === 'string') out.whatsapp = contact.whatsapp;
  if (typeof contact.website === 'string') out.website = contact.website;

  if (typeof branding.logoUrl === 'string') out.logoUrl = branding.logoUrl;
  if (typeof branding.splashUrl === 'string') out.splashUrl = branding.splashUrl;
  if (typeof branding.primaryColor === 'string') out.primary = branding.primaryColor;
  if (typeof branding.accentColor === 'string') out.accent = branding.accentColor;

  // Features
  if (typeof features.enableNotifications === 'boolean') out.enableNotifications = features.enableNotifications;
  if (typeof features.enableSchedule === 'boolean') out.enableSchedule = features.enableSchedule;
  if (typeof features.enablePodcasts === 'boolean') out.enablePodcasts = features.enablePodcasts;

  return out;
}

function mergeStation(base, remote) {
  if (!remote) return base;
  return {
    ...base,
    ...(remote.name ? { name: remote.name } : null),
    ...(remote.tagline ? { tagline: remote.tagline } : null),
    ...(remote.footerText ? { footerText: remote.footerText } : null),
    ...(remote.website ? { website: remote.website } : null),
    ...(remote.aboutText ? { aboutText: remote.aboutText } : null),
    ...(remote.streamUrl ? { streamUrl: remote.streamUrl } : null),
    ...(remote.nowPlayingUrl ? { nowPlayingUrl: remote.nowPlayingUrl } : null),
    ...(remote.scheduleUrl ? { scheduleUrl: remote.scheduleUrl } : null),
    ...(remote.scheduleEventsUrl ? { scheduleEventsUrl: remote.scheduleEventsUrl } : null),
    ...(remote.scheduleWeekUrl ? { scheduleWeekUrl: remote.scheduleWeekUrl } : null),
    ...(remote.listenerMapUrl ? { listenerMapUrl: remote.listenerMapUrl } : null),
    ...(remote.countryStatsUrl ? { countryStatsUrl: remote.countryStatsUrl } : null),
    ...(remote.apiBase ? { apiBase: remote.apiBase } : null),
    ...(remote.stationId ? { stationId: remote.stationId } : null),
    ...(remote.email ? { email: remote.email } : null),
    ...(remote.phone ? { phone: remote.phone } : null),
    ...(remote.whatsapp ? { whatsapp: remote.whatsapp } : null),
    ...(typeof remote.metadataRefreshMs === 'number' ? { metadataRefreshMs: remote.metadataRefreshMs } : null),
    ...(typeof remote.reconnectMaxDelayMs === 'number' ? { reconnectMaxDelayMs: remote.reconnectMaxDelayMs } : null),
    ...(typeof remote.reconnectBackoff === 'number' ? { reconnectBackoff: remote.reconnectBackoff } : null),
    ...(remote.primary ? { primary: remote.primary } : null),
    ...(remote.accent ? { accent: remote.accent } : null),
    ...(typeof remote.enableNotifications === 'boolean' ? { enableNotifications: remote.enableNotifications } : null),
    ...(typeof remote.enableSchedule === 'boolean' ? { enableSchedule: remote.enableSchedule } : null),
    ...(typeof remote.enablePodcasts === 'boolean' ? { enablePodcasts: remote.enablePodcasts } : null),
    branding: {
      logoUrl: remote.logoUrl || null,
      splashUrl: remote.splashUrl || null,
    },
  };
}

function resolveImageSource(imageValue, fallbackNumber) {
  if (typeof imageValue === 'number') return imageValue;
  if (typeof imageValue === 'string' && imageValue.trim()) return { uri: imageValue.trim() };
  if (fallbackNumber) return fallbackNumber;
  return null;
}

export const useStation = () => {
  const ctx = useContext(StationContext);
  if (!ctx) throw new Error('useStation must be used inside StationProvider');
  return ctx;
};

export function StationProvider({ children }) {
  const [remoteConfig, setRemoteConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastError, setLastError] = useState(null);
  const inflight = useRef(null);

  const station = useMemo(() => mergeStation(BASE_STATION, remoteConfig), [remoteConfig]);
  const baseLogo = BASE_STATION.logo;

  const logoSource = useMemo(() => resolveImageSource(station?.branding?.logoUrl, typeof baseLogo === 'number' ? baseLogo : null), [station?.branding?.logoUrl, baseLogo]);
  const splashSource = useMemo(() => resolveImageSource(station?.branding?.splashUrl, null), [station?.branding?.splashUrl]);

  useEffect(() => {
    applyStationTheme(station);
  }, [station?.primary, station?.accent]);

  useEffect(() => {
    (async () => {
      try {
        const base = BASE_STATION.remoteConfigUrl;
        if (!base) return;
        if (!station?.enableNotifications) return;
        const perm = await Notifications.getPermissionsAsync().catch(() => null);
        if (!perm?.granted) return;
        const tokenRes = await Notifications.getExpoPushTokenAsync().catch(() => null);
        const token = tokenRes?.data;
        if (!token) return;
        const urlObj = new URL(base);
        const basePath = urlObj.pathname.replace(/\/config\/?$/, '');
        const registerUrl = urlObj.origin + basePath + '/api/push/register';
        const deviceId = await storage.getDeviceId();
        await withTimeout(fetch(registerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ token, deviceId }),
        }), DEFAULT_TIMEOUT_MS);
      } catch {}
    })();
  }, [station?.enableNotifications]);

  const refresh = async () => {
    const url = BASE_STATION.remoteConfigUrl;
    if (!url) return;
    if (inflight.current) return inflight.current;
    const req = (async () => {
      try {
        setLastError(null);
        const res = await withTimeout(fetch(url, { headers: { Accept: 'application/json' } }), DEFAULT_TIMEOUT_MS);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        const normalized = normalizeRemoteConfig(json);
        if (!normalized) throw new Error('Invalid config payload');
        setRemoteConfig(normalized);
        await storage.setRemoteConfig(normalized);
      } catch (e) {
        setLastError(e?.message || 'Failed to load config');
      } finally {
        inflight.current = null;
      }
    })();
    inflight.current = req;
    return req;
  };

  useEffect(() => {
    (async () => {
      try {
        const cached = await storage.getRemoteConfig();
        if (cached) setRemoteConfig(cached);
      } finally {
        setIsLoading(false);
      }
      refresh();
    })();
  }, []);

  return (
    <StationContext.Provider value={{ station, logoSource, splashSource, isConfigLoading: isLoading, configError: lastError, refreshConfig: refresh }}>
      {children}
    </StationContext.Provider>
  );
}
