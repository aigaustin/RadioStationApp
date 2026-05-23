#!/bin/bash
cd /opt
sudo docker compose -f deploy/docker-compose.yml up -d --force-recreate app
