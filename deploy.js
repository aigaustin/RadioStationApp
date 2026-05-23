const { NodeSSH } = require('node-ssh');
const path = require('path');

const ssh = new NodeSSH();

async function deploy() {
  console.log('🚀 Connecting to remote server api.streamo.ng...');
  
  try {
    await ssh.connect({
      host: '102.69.243.175',
      username: 'media',
      password: '2014@@Clonii'
    });
    console.log('✅ Connected via SSH.');

    const remoteDir = '/home/media/streamo-core';
    console.log(`📁 Ensuring remote directory ${remoteDir} exists...`);
    await ssh.execCommand(`mkdir -p ${remoteDir}`);

    console.log('📦 Uploading streamo-core.zip...');
    await ssh.putFile(path.join(__dirname, 'streamo-core.zip'), `${remoteDir}/streamo-core.zip`);
    console.log('✅ Upload complete.');

    console.log('🔄 Extracting and installing dependencies...');
    const result = await ssh.execCommand(`
      cd ${remoteDir}
      unzip -o streamo-core.zip
      cd backend
      npm install
      npx prisma generate
      pm2 restart streamo-core || pm2 start src/server.js --name streamo-core
    `);
    
    console.log('✅ Remote Installation Output:');
    console.log(result.stdout);
    if (result.stderr) {
      console.log('⚠️ Remote Warnings/Errors:');
      console.log(result.stderr);
    }
    
    console.log('🎉 Deployment to api.streamo.ng successfully completed!');
  } catch (err) {
    console.error('❌ Deployment Failed:', err);
  } finally {
    ssh.dispose();
  }
}

deploy();
