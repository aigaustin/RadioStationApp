import paramiko

host = '102.69.243.175'
user = 'media'
password = '2014@@Clonii'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, username=user, password=password)
    
    cmd = "cd /opt && echo '2014@@Clonii' | sudo -S docker compose -f deploy/docker-compose.yml logs app --tail 100"
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode('utf-8', errors='ignore')
    
    with open('app-logs.txt', 'w', encoding='utf-8') as f:
        f.write(out)

except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
