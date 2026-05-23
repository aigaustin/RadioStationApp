const fs = require('fs');

let s = fs.readFileSync('app.js', 'utf8');

s = s.replace(
  /const res = await api\('\/api\/mediacp\/media\?path=' \+ encodeURIComponent\(window\.currentMcpPath\)\);\s+if \(res && res\.media\) \{\s+if \(res\.media\.length === 0\) \{/,
  `const res = await api('/api/mediacp/media?path=' + encodeURIComponent(window.currentMcpPath));
    if (res && !res.error) {
      const folders = res.folders || [];
      const tracks = (res.tracks && res.tracks.data) ? res.tracks.data : [];
      const media = [...folders.map(f => ({ type: 'directory', id: f.id, title: f.title, path: f.path })), ...tracks.map(t => ({ type: 'file', id: t.id, title: t.title, size: t.size || 0 }))];
      if (media.length === 0) {`
);

s = s.replace(
  /listWrap\.innerHTML = res\.media\.map\(m => \{/,
  `listWrap.innerHTML = media.map(m => {`
);

s = s.replace(
  /const res = await api\('\/api\/mediacp\/playlists'\);\s+if \(res && res\.data\) \{\s+const arr = Array\.isArray\(res\) \? res : res\.data;/,
  `const res = await api('/api/mediacp/playlists');
    if (res && !res.error) {
      const arr = res.playlists ? (res.playlists.data || res.playlists) : (Array.isArray(res) ? res : (res.data || []));`
);

s = s.replace(
  /const res = await api\('\/api\/mediacp\/events\?start=' \+ startStr \+ '&end=' \+ endStr\);\s+if \(res && res\.data\) \{\s+const arr = Array\.isArray\(res\) \? res : res\.data;/,
  `const res = await api('/api/mediacp/events?start=' + startStr + '&end=' + endStr);
    
    if (res && !res.error) {
      const arr = Array.isArray(res) ? res : (res.data || []);`
);

fs.writeFileSync('app.js', s);
console.log("Fixed successfully!");
