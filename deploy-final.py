import paramiko

host = '102.69.243.175'
user = 'media'
password = '2014@@Clonii'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {host}...")
    client.connect(host, username=user, password=password)
    
    sftp = client.open_sftp()
    with open('remote-script.sh', 'w', newline='\n', encoding='utf-8') as f:
        f.write("#!/bin/bash\n")
        f.write("cd /opt\n")
        f.write("sudo docker compose -f deploy/docker-compose.yml up -d --force-recreate app\n")
    
    sftp.put('remote-script.sh', '/home/media/remote-script.sh')
    sftp.close()
    
    cmd = "echo '2014@@Clonii' | sudo -S bash /home/media/remote-script.sh"
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode('utf-8', errors='ignore')
    print(out.encode('ascii', errors='replace').decode('ascii'))
    
except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
