#!/bin/bash

# Docker build and deployment script for Magnet Drive

set -e

# Configuration
IMAGE_NAME="magnet-drive"
TAG=${1:-latest}
REGISTRY=${2:-"your-registry.com"}

echo "🚀 Building Docker image..."

# Build the Docker image
docker build -t $IMAGE_NAME:$TAG .

echo "✅ Image built successfully: $IMAGE_NAME:$TAG"

# Tag for registry if specified
if [ "$REGISTRY" != "your-registry.com" ]; then
    docker tag $IMAGE_NAME:$TAG $REGISTRY/$IMAGE_NAME:$TAG
    echo "🏷️  Tagged for registry: $REGISTRY/$IMAGE_NAME:$TAG"
fi

echo "🎉 Build complete!"
echo ""
echo "To run locally:"
echo "  docker run -p 3000:80 $IMAGE_NAME:$TAG"
echo ""
echo "To run with docker-compose:"
echo "  docker-compose up -d"
echo ""
echo "To push to registry:"
echo "  docker push $REGISTRY/$IMAGE_NAME:$TAG"