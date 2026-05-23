import paramiko

host = '102.69.243.175'
user = 'media'
password = '2014@@Clonii'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {host}...")
    client.connect(host, username=user, password=password)
    
    sql = """
    INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", disabled, "createdAt", "updatedAt") 
    VALUES (gen_random_uuid(), 'admin@streamo.ng', '$2b$12$QZYo/B6qO28tP519aydVc.tKLPxo6jrGCYRDQ/cghWpyJfmFZTmIO', 'Super', 'Admin', false, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;
    """
    
    sftp = client.open_sftp()
    with open('insert.sql', 'w', encoding='utf-8') as f:
        f.write(sql)
    sftp.put('insert.sql', '/home/media/insert.sql')
    sftp.close()
    
    commands = [
        "echo '2014@@Clonii' | sudo -S docker cp /home/media/insert.sql streamo_db:/insert.sql",
        "echo '2014@@Clonii' | sudo -S docker exec streamo_db psql -U streamo_user -d streamo_db -f /insert.sql"
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
