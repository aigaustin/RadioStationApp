import paramiko

host = '102.69.243.175'
user = 'media'
password = '2014@@Clonii'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {host}...")
    client.connect(host, username=user, password=password)
    
    script = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany();
  console.log(users);
}
run();
"""
    sftp = client.open_sftp()
    with open('test-db.js', 'w', newline='\n', encoding='utf-8') as f:
        f.write(script)
    sftp.put('test-db.js', '/home/media/test-db.js')
    sftp.close()
    
    cmd = "cd /opt && echo '2014@@Clonii' | sudo -S docker compose -f deploy/docker-compose.yml exec -T app node /app/backend/test-db.js"
    
    # Wait, the script was put in /home/media, so it's not inside the container!
    # I need to run it via docker compose exec passing the script, or just run Prisma studio.
    
    commands = [
        "echo '2014@@Clonii' | sudo -S docker cp /home/media/test-db.js streamo_app:/app/backend/test-db.js",
        "echo '2014@@Clonii' | sudo -S docker exec streamo_app node /app/backend/test-db.js"
    ]
    
    for c in commands:
        stdin, stdout, stderr = client.exec_command(c, get_pty=True)
        out = stdout.read().decode('utf-8', errors='ignore')
        print(out.encode('ascii', errors='replace').decode('ascii'))

except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
