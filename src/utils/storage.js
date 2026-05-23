import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  FAV: '@radio:favorites',
  NOTIF: '@radio:notifications',
  RECENT: '@radio:recentlyPlayed',
  VOLUME: '@radio:volume',
  REMOTE_CONFIG: '@radio:remoteConfig',
  DEVICE_ID: '@radio:deviceId',
};

export const storage = {
  async getFavorites() {
    try { return JSON.parse((await AsyncStorage.getItem(KEYS.FAV)) || '[]'); }
    catch { return []; }
  },
  async toggleFavorite(item) {
    const favs = await this.getFavorites();
    const exists = favs.find(f => f.id === item.id);
    const next = exists ? favs.filter(f => f.id !== item.id) : [...favs, item];
    await AsyncStorage.setItem(KEYS.FAV, JSON.stringify(next));
    return next;
  },
  async isFavorite(id) {
    const favs = await this.getFavorites();
    return favs.some(f => f.id === id);
  },
  async getNotifSettings() {
    try {
      return JSON.parse(
        (await AsyncStorage.getItem(KEYS.NOTIF)) ||
        '{"shows":true,"announcements":true,"newPodcasts":true}'
      );
    } catch { return { shows: true, announcements: true, newPodcasts: true }; }
  },
  async setNotifSettings(s) {
    await AsyncStorage.setItem(KEYS.NOTIF, JSON.stringify(s));
  },
  async addRecent(item) {
    try {
      const list = JSON.parse((await AsyncStorage.getItem(KEYS.RECENT)) || '[]');
      const filtered = list.filter(x => x.id !== item.id);
      const next = [{ ...item, playedAt: Date.now() }, ...filtered].slice(0, 20);
      await AsyncStorage.setItem(KEYS.RECENT, JSON.stringify(next));
      return next;
    } catch { return []; }
  },
  async getRecent() {
    try { return JSON.parse((await AsyncStorage.getItem(KEYS.RECENT)) || '[]'); }
    catch { return []; }
  },
  async getVolume() {
    try {
      const v = await AsyncStorage.getItem(KEYS.VOLUME);
      if (v === null) return 1.0;
      const parsed = parseFloat(v);
      if (Number.isNaN(parsed)) return 1.0;
      return Math.max(0, Math.min(1, parsed));
    } catch { return 1.0; }
  },
  async setVolume(v) {
    await AsyncStorage.setItem(KEYS.VOLUME, String(v));
  },
  async getRemoteConfig() {
    try { return JSON.parse((await AsyncStorage.getItem(KEYS.REMOTE_CONFIG)) || 'null'); }
    catch { return null; }
  },
  async setRemoteConfig(cfg) {
    await AsyncStorage.setItem(KEYS.REMOTE_CONFIG, JSON.stringify(cfg || null));
  },
  async getDeviceId() {
    try {
      const existing = await AsyncStorage.getItem(KEYS.DEVICE_ID);
      if (existing) return existing;
      const next = String(Date.now()) + '-' + String(Math.floor(Math.random() * 1e9));
      await AsyncStorage.setItem(KEYS.DEVICE_ID, next);
      return next;
    } catch {
      return String(Date.now()) + '-' + String(Math.floor(Math.random() * 1e9));
    }
  },
};
