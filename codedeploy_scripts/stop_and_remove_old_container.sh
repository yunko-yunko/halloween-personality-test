#!/bin/bash
CONTAINER_NAME="halloween-personality-test-backend"

# Stop and remove the old container, ignore errors if it doesn't exist
docker stop $CONTAINER_NAME || true
docker rm $CONTAINER_NAME || true

echo "Cleaning up dangling docker images..."
docker image prune -f