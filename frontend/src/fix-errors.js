const fs = require('fs');
let s = fs.readFileSync('app.js', 'utf8');

s = s.replace(
  /listWrap\.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var\(--danger\);">Failed to load media<\/td><\/tr>';/g,
  `listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Failed to load media: ' + (res && res.message ? res.message : 'Unknown error') + '</td></tr>';`
);

s = s.replace(
  /listWrap\.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var\(--danger\);">Failed to load playlists<\/td><\/tr>';/g,
  `listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Failed to load playlists: ' + (res && res.message ? res.message : 'Unknown error') + '</td></tr>';`
);

s = s.replace(
  /listWrap\.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var\(--danger\);">Failed to load events<\/td><\/tr>';/g,
  `listWrap.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Failed to load events: ' + (res && res.message ? res.message : 'Unknown error') + '</td></tr>';`
);

fs.writeFileSync('app.js', s);
console.log("Updated error messages!");
