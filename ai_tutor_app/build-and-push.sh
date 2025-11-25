#!/bin/bash
set -e

echo "🔨 Building Flutter Web..."
flutter build web --release

echo "🐳 Building Docker image..."
docker build -t sang5664/ai-tutor-frontend:latest .

echo "📤 Pushing to Docker Hub..."
docker push sang5664/ai-tutor-frontend:latest

echo "✅ Done! Image: sang5664/ai-tutor-frontend:latest"
