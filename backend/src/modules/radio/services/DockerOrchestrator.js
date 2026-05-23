const Docker = require('dockerode');
const docker = new Docker({ socketPath: process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock' });

class DockerOrchestrator {
  
  static async pullImage(imageName) {
    console.log(`[Docker] Pulling image ${imageName}...`);
    return new Promise((resolve, reject) => {
      docker.pull(imageName, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (onFinishedErr, output) => {
          if (onFinishedErr) return reject(onFinishedErr);
          resolve(output);
        });
      });
    });
  }

  static async ensureNetwork(networkName = 'streamo_radio_net') {
    try {
      const net = docker.getNetwork(networkName);
      await net.inspect();
      return networkName;
    } catch (e) {
      if (e.statusCode === 404) {
        console.log(`[Docker] Creating network ${networkName}...`);
        await docker.createNetwork({ Name: networkName, Driver: 'bridge' });
        return networkName;
      }
      throw e;
    }
  }

  static async createIcecastContainer(stationId, port, password) {
    const containerName = `icecast_${stationId}`;
    await this.ensureNetwork();
    
    // Using moul/icecast as a basic Icecast-KH image
    const image = 'moul/icecast:latest';
    await this.pullImage(image).catch(() => console.log('Image pull failed, attempting to run anyway if cached.'));
    
    // Create custom icecast.xml for the station (ideally generated on disk, but we can pass env vars if image supports it)
    // The moul/icecast image supports ICECAST_SOURCE_PASSWORD, ICECAST_ADMIN_PASSWORD, ICECAST_PASSWORD
    const container = await docker.createContainer({
      Image: image,
      name: containerName,
      Env: [
        `ICECAST_SOURCE_PASSWORD=${password}`,
        `ICECAST_ADMIN_PASSWORD=${password}`,
        `ICECAST_PASSWORD=${password}`,
        `ICECAST_MAX_SOURCES=5`
      ],
      HostConfig: {
        NetworkMode: 'streamo_radio_net',
        PortBindings: {
          '8000/tcp': [{ HostPort: String(port) }]
        },
        RestartPolicy: { Name: 'always' }
      }
    });

    await container.start();
    return container.id;
  }

  static async createLiquidsoapContainer(stationId, icecastHost, port, password) {
    const containerName = `liquidsoap_${stationId}`;
    await this.ensureNetwork();
    
    // Using savonet/liquidsoap
    const image = 'savonet/liquidsoap:v2.2.5';
    await this.pullImage(image).catch(() => {});
    
    // We will mount a liquidsoap script later, for now we run a basic blank script
    const uploadsDir = require('path').resolve(__dirname, '../../../../uploads');
    const container = await docker.createContainer({
      Image: image,
      name: containerName,
      Cmd: [
        "-e",
        `output.icecast(%mp3, host="${icecastHost}", port=8000, password="${password}", mount="/autodj", name="AutoDJ", description="Streamo AutoDJ", mksafe(playlist("/music")))`
      ],
      HostConfig: {
        NetworkMode: 'streamo_radio_net',
        RestartPolicy: { Name: 'always' },
        Binds: [
          `${uploadsDir}:/music:ro`
        ]
      }
    });

    await container.start();
    return container.id;
  }

  static async stopAndRemove(containerId) {
    if (!containerId) return;
    try {
      const container = docker.getContainer(containerId);
      await container.stop().catch(() => {});
      await container.remove({ force: true }).catch(() => {});
    } catch (e) {
      console.error('[Docker] Failed to remove container:', e.message);
    }
  }
}

module.exports = DockerOrchestrator;
