import paramiko

host = '102.69.243.175'
user = 'media'
password = '2014@@Clonii'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {host}...")
    client.connect(host, username=user, password=password)
    
    cmd = """
echo '2014@@Clonii' | sudo -S docker exec streamo_app bash -c "sed -i 's/client.getServiceStatus(serverId)/client.getService(serverId)/g' /app/backend/services/MediaCpService.js"
echo '2014@@Clonii' | sudo -S docker compose -f /opt/deploy/docker-compose.yml restart app
    """
    
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode('utf-8', errors='ignore')
    print(out.encode('ascii', errors='replace').decode('ascii'))

except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
