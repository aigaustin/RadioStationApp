import { STATION } from '../config/station';

const DEFAULT_TIMEOUT_MS = 8000;

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

function parseIcecastNowPlaying(payload, stationName) {
  if (!payload || !payload.icestats || !payload.icestats.source) return null;
  const source = Array.isArray(payload.icestats.source) ? payload.icestats.source[0] : payload.icestats.source;
  
  const rawTitle = source.title || '';
  const rawArtist = source.artist || '';
  
  let title = rawTitle;
  let artist = rawArtist;
  
  // Sometimes Icecast puts "Artist - Title" in the title field
  if (!artist && rawTitle.includes(' - ')) {
    const parts = rawTitle.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }

  return {
    title: title || stationName || STATION.name,
    artist: artist || 'Live Stream',
    dj: source.server_name || '',
    artwork: null,
    startedAt: Date.now(),
  };
}

export function createApi(station) {
  const cfg = station || STATION;
  return {
    async getNowPlaying() {
      if (!cfg.nowPlayingUrl) {
        return { ok: false, error: 'Station API is not configured' };
      }
      const res = await safeFetchJson(cfg.nowPlayingUrl);
      if (!res.ok) {
        return { ok: false, error: res.error };
      }
      const mapped = parseIcecastNowPlaying(res.data, cfg.name);
      if (!mapped) {
        return { ok: false, error: 'Invalid now playing payload' };
      }
      return { ok: true, mocked: false, data: mapped };
    },
    async getSchedule() {
      if (!cfg.apiBase) {
        return { ok: false, error: 'Station API is not configured' };
      }
      const res = await safeFetchJson(`${cfg.apiBase}/modules/radio/schedule?radioStationId=${cfg.stationId || 'default'}`);
      if (!res.ok) {
        return { ok: false, error: res.error };
      }
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const mapped = list.map((item, idx) => {
        const startAt = new Date(item.startTime).getTime();
        const endAt = new Date(item.endTime).getTime();
        
        const startH = String(new Date(startAt).getHours()).padStart(2, '0');
        const startM = String(new Date(startAt).getMinutes()).padStart(2, '0');
        const endH = String(new Date(endAt).getHours()).padStart(2, '0');
        const endM = String(new Date(endAt).getMinutes()).padStart(2, '0');
        
        return {
          id: item.id || String(idx),
          time: `${startH}:${startM}`,
          endTime: `${endH}:${endM}`,
          title: item.title,
          host: '',
          description: '',
          startAt,
          endAt,
        };
      });
      return { ok: true, mocked: false, data: mapped };
    },
    async getPodcasts() {
      return { ok: false, error: 'Podcasts are not configured for this station.' };
    },
    async getAnalytics() {
      return { ok: false, error: 'Analytics are not configured for this station.' };
    },
    async sendContactMessage(payload) {
      return { ok: false, error: 'Not implemented' };
    },
  };
}

export const api = createApi(STATION);
