import paramiko
import time

host = '102.69.243.175'
user = 'media'
password = '2014@@Clonii'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(host, username=user, password=password)
    
    commands = [
        "cd /opt && echo '2014@@Clonii' | sudo -S docker compose -f deploy/docker-compose.yml up -d",
        "echo 'Waiting for DB to boot...' && sleep 10",
        "cd /opt && echo '2014@@Clonii' | sudo -S docker compose -f deploy/docker-compose.yml exec -T app npx prisma db push --accept-data-loss"
    ]
    
    for cmd in commands:
        print(f"Executing: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                try:
                    out = stdout.channel.recv(1024).decode('utf-8', errors='ignore')
                    print(out.encode('ascii', errors='replace').decode('ascii'), end='')
                except Exception as e:
                    pass
            time.sleep(0.5)
            
        if stdout.channel.recv_ready():
            try:
                out = stdout.channel.recv(1024).decode('utf-8', errors='ignore')
                print(out.encode('ascii', errors='replace').decode('ascii'), end='')
            except:
                pass
                
        print(f"\nStatus: {stdout.channel.recv_exit_status()}")

except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
