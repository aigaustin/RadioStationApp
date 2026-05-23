import paramiko

host = '102.69.243.175'
user = 'media'
password = '2014@@Clonii'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {host}...")
    client.connect(host, username=user, password=password)
    
    commands = [
        "cd /opt/deploy && echo '2014@@Clonii' | sudo -S sed -i '/container_name: traefik/a\\    environment:\\n      - DOCKER_API_VERSION=1.41' docker-compose.yml",
        "cd /opt && echo '2014@@Clonii' | sudo -S docker compose -f deploy/docker-compose.yml up -d --force-recreate traefik"
    ]
    
    for cmd in commands:
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
        out = stdout.read().decode('utf-8', errors='ignore')
        print(out.encode('ascii', errors='replace').decode('ascii'))
        print(f"Status: {stdout.channel.recv_exit_status()}")

except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
