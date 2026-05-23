import { STATION } from '../config/station';

const DEFAULT_TIMEOUT_MS = 8000;

function isPlaceholder(value) {
  if (!value) return true;
  const v = String(value).toLowerCase().trim();
  return (
    v.includes('your-station-id') ||
    v.includes('streaming.example.com') ||
    v.includes('example.com') ||
    v.includes('yourstation.com') ||
    v === 'radio name'
  );
}

function isApiConfigured(station) {
  return !!station?.apiBase && !isPlaceholder(station.apiBase) && !!station?.stationId && !isPlaceholder(station.stationId);
}

function isNowPlayingUrlConfigured(station) {
  return !!station?.nowPlayingUrl && !isPlaceholder(station.nowPlayingUrl);
}

function isScheduleUrlConfigured(station) {
  return !!station?.scheduleUrl && !isPlaceholder(station.scheduleUrl);
}

function isScheduleEventsUrlConfigured(station) {
  return !!station?.scheduleEventsUrl && !isPlaceholder(station.scheduleEventsUrl);
}

async function safeFetchJson(url, options = {}) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const hint = text && text.length < 160 ? ` - ${text}` : '';
      return { ok: false, error: 'HTTP ' + res.status + hint };
    }
    const text = await res.text().catch(() => '');
    if (!text) return { ok: true, data: null };
    try {
      return { ok: true, data: JSON.parse(text) };
    } catch {
      return { ok: false, error: 'Invalid JSON response' };
    }
  } catch (e) {
    if (__DEV__) console.log('[API]', url, e.message);
    return { ok: false, error: e?.name === 'AbortError' ? 'Request timed out' : (e?.message || 'Network error') };
  }
}

function parseNowPlayingFromString(text, stationName) {
  if (!text) return null;
  const raw = String(text).trim();
  if (!raw) return null;
  const parts = raw.split(' - ');
  if (parts.length >= 2) {
    const artist = parts[0].trim();
    let title = parts.slice(1).join(' - ').trim();
    if (title.toLowerCase().startsWith((artist + ' - ').toLowerCase())) {
      title = title.slice(artist.length + 3).trim();
    }
    if (artist && title) return { title, artist };
  }
  return { title: raw, artist: stationName || STATION.name };
}

function mapMediaCpNowPlayingPayload(payload, stationName) {
  if (!payload || typeof payload !== 'object') return null;
  const directTitle =
    payload.title ||
    payload.song ||
    payload.streamtitle ||
    payload.songtitle ||
    payload.now_playing ||
    payload.nowplaying ||
    payload.nowPlaying;
  const directArtist =
    payload.artist ||
    payload.dj ||
    payload.show ||
    payload.program;
  const parsedFromTitle = parseNowPlayingFromString(directTitle, stationName);
  const title = parsedFromTitle?.title || stationName || STATION.name;
  const artist = directArtist || parsedFromTitle?.artist || 'Live Stream';

  const artwork =
    payload.artwork ||
    payload.albumArt ||
    payload.coverart ||
    payload.cover ||
    payload.image ||
    payload.album_cover ||
    payload.albumCover ||
    null;

  const dj =
    payload.dj ||
    payload.show ||
    payload.presenter ||
    payload.host ||
    '';

  return {
    title,
    artist,
    dj,
    artwork,
    startedAt: payload.startedAt || payload.started_at || Date.now(),
  };
}

function toTimeHHMM(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    const s = value.trim();
    if (/^\d{1,2}:\d{2}$/.test(s)) return s.padStart(5, '0');
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
  }
  if (typeof value === 'number') {
    const d = new Date(value > 1e12 ? value : value * 1000);
    if (!Number.isNaN(d.getTime())) {
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${hh}:${mm}`;
    }
  }
  return null;
}

function mapSchedulePayload(payload) {
  const list = Array.isArray(payload)
    ? payload
    : (Array.isArray(payload?.schedule) ? payload.schedule : (Array.isArray(payload?.events) ? payload.events : null));
  if (!Array.isArray(list)) return null;

  const mapped = list.map((item, idx) => {
    const startDate =
      (typeof item?.start === 'string' && item.start) ||
      (typeof item?.startTime === 'string' && item.startTime) ||
      (typeof item?.start_time === 'string' && item.start_time) ||
      (typeof item?.startsAt === 'string' && item.startsAt) ||
      (typeof item?.starts_at === 'string' && item.starts_at);
    const endDate =
      (typeof item?.end === 'string' && item.end) ||
      (typeof item?.endTime === 'string' && item.endTime) ||
      (typeof item?.end_time === 'string' && item.end_time) ||
      (typeof item?.endsAt === 'string' && item.endsAt) ||
      (typeof item?.ends_at === 'string' && item.ends_at);

    const startAt = startDate ? new Date(startDate).getTime() : null;
    const endAt = endDate ? new Date(endDate).getTime() : null;

    const start =
      toTimeHHMM(item?.time) ||
      toTimeHHMM(item?.start) ||
      toTimeHHMM(item?.startTime) ||
      toTimeHHMM(item?.start_time) ||
      toTimeHHMM(item?.startsAt) ||
      toTimeHHMM(item?.starts_at) ||
      (startAt ? toTimeHHMM(startAt) : null);
    const end =
      toTimeHHMM(item?.endTime) ||
      toTimeHHMM(item?.end_time) ||
      toTimeHHMM(item?.end) ||
      toTimeHHMM(item?.endsAt) ||
      toTimeHHMM(item?.ends_at) ||
      (endAt ? toTimeHHMM(endAt) : null);

    const title = item?.title || item?.name || item?.show || item?.program || 'Show';
    const host = item?.host || item?.presenter || item?.dj || item?.artist || '';
    const description = item?.description || item?.desc || item?.summary || '';
    const id = String(item?.id || item?._id || item?.uuid || `${start || 't'}-${title}-${idx}`);

    return {
      id,
      time: start || '00:00',
      endTime: end || '00:00',
      title,
      host,
      description,
      startAt: startAt && !Number.isNaN(startAt) ? startAt : undefined,
      endAt: endAt && !Number.isNaN(endAt) ? endAt : undefined,
    };
  });

  return mapped.filter(x => !!x && typeof x === 'object');
}

function formatDateYMD(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  const y = String(dt.getFullYear()).padStart(4, '0');
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function withQuery(url, params) {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    u.searchParams.set(k, String(v));
  });
  return u.toString();
}

export function createApi(station) {
  const cfg = station || STATION;
  return {
    async getNowPlaying() {
      if (isNowPlayingUrlConfigured(cfg)) {
        const res = await safeFetchJson(cfg.nowPlayingUrl);
        if (!res.ok) {
          return { ok: false, error: res.error };
        }
        const mapped = mapMediaCpNowPlayingPayload(res.data, cfg.name);
        if (!mapped) {
          return { ok: false, error: 'Invalid now playing payload' };
        }
        return { ok: true, mocked: false, data: mapped };
      }
      if (!isApiConfigured(cfg)) {
        return { ok: false, error: 'Station API is not configured' };
      }
      const res = await safeFetchJson(`${cfg.apiBase}/station/${cfg.stationId}/nowplaying`);
      if (!res.ok) {
        return { ok: false, error: res.error };
      }
      const data = res.data || {};
      return {
        ok: true,
        mocked: false,
        data: {
          title: data.title || data.song || cfg.name || STATION.name,
          artist: data.artist || 'Live Stream',
          dj: data.dj || data.show || '',
          artwork: data.artwork || data.albumArt || null,
          startedAt: data.startedAt || Date.now(),
        },
      };
    },
    async getSchedule() {
      if (isScheduleEventsUrlConfigured(cfg)) {
        const start = formatDateYMD(Date.now());
        const end = formatDateYMD(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const url = withQuery(cfg.scheduleEventsUrl, { start, end });
        const res = await safeFetchJson(url);
        if (!res.ok) {
          return { ok: false, error: res.error };
        }
        const mapped = mapSchedulePayload(res.data);
        if (!mapped) return { ok: true, mocked: false, data: [] };
        return { ok: true, mocked: false, data: mapped };
      }
      if (isScheduleUrlConfigured(cfg)) {
        const res = await safeFetchJson(cfg.scheduleUrl);
        if (!res.ok) {
          return { ok: false, error: res.error };
        }
        const mapped = mapSchedulePayload(res.data);
        if (!mapped) {
          return { ok: false, error: 'Invalid schedule payload' };
        }
        return { ok: true, mocked: false, data: mapped };
      }
      if (!isApiConfigured(cfg)) {
        return { ok: false, error: 'Station API is not configured' };
      }
      const res = await safeFetchJson(`${cfg.apiBase}/station/${cfg.stationId}/schedule`);
      if (!res.ok) {
        return { ok: false, error: res.error };
      }
      const list = Array.isArray(res.data) ? res.data : [];
      return { ok: true, mocked: false, data: list };
    },
    async getPodcasts() {
      return { ok: false, error: 'Podcasts are not configured for this station.' };
    },
    async getAnalytics() {
      return { ok: false, error: 'Analytics are not configured for this station.' };
    },
    async sendContactMessage(payload) {
      if (!isApiConfigured(cfg)) {
        return { ok: false, error: 'Station contact API is not configured' };
      }
      const res = await safeFetchJson(
        `${cfg.apiBase}/station/${cfg.stationId}/contact`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      if (!res.ok) {
        return { ok: false, error: res.error };
      }
      return { ok: true, mocked: false, data: res.data };
    },
  };
}

export const api = createApi(STATION);
