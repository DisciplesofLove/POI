#!/bin/bash

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Start RPC services
echo "Starting RPC services..."
docker-compose -f docker-compose.rpc.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
docker-compose -f docker-compose.rpc.yml ps

echo "RPC services are ready. You can now start the frontend application."
echo "To view logs, run: docker-compose -f docker-compose.rpc.yml logs -f"