const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.shell((err, stream) => {
    if (err) throw err;
    
    stream.on('close', () => {
      console.log('Stream :: close');
      conn.end();
    }).on('data', (data) => {
      console.log('OUTPUT: ' + data);
    });

    // Provide the password when sudo asks
    stream.write('cd /opt\n');
    
    // Fix docker compose path
    stream.write('sudo docker compose -f deploy/docker-compose.yml build\n');
    stream.write('2014@@Clonii\n'); // in case sudo prompts
    
    stream.write('sudo docker compose -f deploy/docker-compose.yml up -d\n');
    
    // Wait for DB to start
    stream.write('sleep 10\n');
    
    stream.write('sudo docker compose -f deploy/docker-compose.yml exec -T app npx prisma db push --accept-data-loss\n');
    
    stream.write('exit\n');
  });
}).connect({
  host: '102.69.243.175',
  port: 22,
  username: 'media',
  password: '2014@@Clonii'
});
