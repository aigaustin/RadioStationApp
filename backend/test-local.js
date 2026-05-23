const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 4545,
  path: '/api/admin/config',
  method: 'GET'
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body.substring(0, 500)));
});
req.end();
