#!/bin/bash
set -e

echo "==========================================="
echo "   Streamo Core - Automated Installer"
echo "==========================================="

if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (sudo ./install.sh)"
  exit 1
fi

echo "[1/4] Installing system dependencies..."
apt-get update
apt-get install -y curl wget git jq apt-transport-https ca-certificates gnupg lsb-release

echo "[2/4] Installing Docker & Docker Compose..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
  curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi

echo "[3/4] Pulling Media Engine Images (Icecast & Liquidsoap)..."
docker pull moul/icecast:latest
docker pull savonet/liquidsoap:v2.2.5
docker pull postgres:15-alpine
docker pull node:18-alpine

echo "[4/4] Starting Streamo Core..."
# In a real deployment, we would run docker-compose up -d here.
echo "Creating docker-compose.yml for Streamo Core..."

cat <<EOF > docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: streamo
      POSTGRES_PASSWORD: streamo_password
      POSTGRES_DB: streamo_core
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: always

  core:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./backend:/app
      - /var/run/docker.sock:/var/run/docker.sock # Required for DockerOrchestrator
    environment:
      DATABASE_URL: postgresql://streamo:streamo_password@db:5432/streamo_core
      PORT: 80
    ports:
      - "80:80"
    command: sh -c "npm install && npx prisma db push && node src/server.js"
    depends_on:
      - db
    restart: always

volumes:
  pgdata:
EOF

echo "Starting containers..."
docker-compose up -d

echo "==========================================="
echo " Installation Complete! "
echo " Streamo Core is now running on port 80."
echo " Visit http://<your-server-ip>/api/setup/status to begin the First-Time Setup Wizard!"
echo "==========================================="
