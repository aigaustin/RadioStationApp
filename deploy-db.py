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
        "cd /opt && echo '2014@@Clonii' | sudo -S docker compose -f deploy/docker-compose.yml run --rm app npx prisma db push --accept-data-loss",
        "cd /opt && echo '2014@@Clonii' | sudo -S docker compose -f deploy/docker-compose.yml up -d --force-recreate app"
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
