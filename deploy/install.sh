#!/bin/bash
set -e

echo "================================================================"
echo " Pan Africa Radio24 - Enterprise Auto-Installer (Ubuntu 24.04)"
echo "================================================================"

# 1. Install Docker & Docker Compose if missing
if ! command -v docker &> /dev/null; then
    echo "[*] Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "[*] Docker installed."
else
    echo "[*] Docker already installed."
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "[*] Installing Docker Compose..."
    sudo apt-get update -y && sudo apt-get install docker-compose-plugin -y
fi

# 2. Setup Environment Variables
if [ ! -f .env ]; then
    echo "[*] Generating .env file with secure credentials..."
    
    JWT_SECRET=$(openssl rand -hex 32)
    POSTGRES_PASSWORD=$(openssl rand -hex 16)
    
    cat <<EOF > .env
LETSENCRYPT_EMAIL=admin@streamo.ng
POSTGRES_USER=streamo_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=streamo_db
JWT_SECRET=${JWT_SECRET}
EOF
    echo "[*] .env file created."
else
    echo "[*] .env file already exists. Skipping generation."
fi

source .env

# 3. Build and Start Containers
echo "[*] Building and starting Docker containers in detached mode..."
docker compose build
docker compose up -d

# 4. Wait for Database to be ready
echo "[*] Waiting for PostgreSQL database to initialize (10s)..."
sleep 10

# 5. Push Prisma Schema
echo "[*] Pushing Prisma database schema..."
docker compose exec -T app npx prisma db push --accept-data-loss

# 6. Seed Database (Optional)
# docker compose exec -T app npm run seed

echo "================================================================"
echo " INSTALLATION COMPLETE!"
echo "================================================================"
echo " The system is now booting up. Traefik is automatically provisioning"
echo " Let's Encrypt SSL certificates for api.streamo.ng."
echo ""
echo " You can view the logs at any time by running:"
echo "    docker compose logs -f app"
echo "================================================================"
