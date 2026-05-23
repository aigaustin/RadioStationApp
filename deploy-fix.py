import paramiko

host = '102.69.243.175'
user = 'media'
password = '2014@@Clonii'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {host}...")
    client.connect(host, username=user, password=password)
    
    # Use SFTP to upload the fixed package.json
    sftp = client.open_sftp()
    
    # We must sudo to write to /opt probably, so let's upload to /home/media/ and then sudo mv
    sftp.put('backend/package.json', '/home/media/package.json')
    sftp.put('backend/package-lock.json', '/home/media/package-lock.json')
    sftp.close()
    
    commands = [
        "echo '2014@@Clonii' | sudo -S mv /home/media/package* /opt/backend/",
        "cd /opt && echo '2014@@Clonii' | sudo -S docker compose -f deploy/docker-compose.yml build",
        "cd /opt && echo '2014@@Clonii' | sudo -S docker compose -f deploy/docker-compose.yml up -d",
        "echo 'Waiting for DB...' && sleep 5",
        "cd /opt && echo '2014@@Clonii' | sudo -S docker compose -f deploy/docker-compose.yml exec -T app npx prisma db push --accept-data-loss"
    ]
    
    for cmd in commands:
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
        out = stdout.read().decode('utf-8', errors='ignore')
        print(out)
        print(f"Status: {stdout.channel.recv_exit_status()}")

except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
