const fs = require('fs');
let s = fs.readFileSync('src/context/StationContext.js', 'utf8');

// Replace normalizeRemoteConfig
s = s.replace(/function normalizeRemoteConfig\(raw\) \{[\s\S]*?return out;\n\}/, `function normalizeRemoteConfig(raw) {
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
}`);

fs.writeFileSync('src/context/StationContext.js', s);
console.log('Fixed normalizeRemoteConfig in StationContext.js');
