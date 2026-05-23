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
        "echo '2014@@Clonii' | sudo -S bash -c \"echo 'BOOTSTRAP_EMAIL=admin@streamo.ng' >> /opt/backend/.env\"",
        "echo '2014@@Clonii' | sudo -S bash -c \"echo 'BOOTSTRAP_PASSWORD=Admin123!' >> /opt/backend/.env\"",
        "cd /opt && echo '2014@@Clonii' | sudo -S docker compose -f deploy/docker-compose.yml restart app"
    ]
    
    for cmd in commands:
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
        out = stdout.read().decode('utf-8', errors='ignore')
        print(out.encode('ascii', errors='replace').decode('ascii'))

except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
