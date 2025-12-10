#!/bin/bash

# Deploy to DEV environment
echo "🚀 Deploying AI Tutor to DEV environment..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"

# Apply namespace first
echo "📦 Creating namespace..."
kubectl apply -f "$K8S_DIR/dev/namespace/namespace.yaml"

# Apply MongoDB
echo "💾 Deploying MongoDB..."
kubectl apply -f "$K8S_DIR/dev/mongodb/"

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB..."
kubectl wait --for=condition=ready pod -l app=mongodb -n ai-tutor-dev --timeout=120s

# Apply Backend
echo "🔧 Deploying Backend..."
kubectl apply -f "$K8S_DIR/dev/backend/"

# Wait for Backend to be ready
echo "⏳ Waiting for Backend..."
kubectl wait --for=condition=ready pod -l app=backend -n ai-tutor-dev --timeout=120s

# Apply Frontend
echo "🎨 Deploying Frontend..."
kubectl apply -f "$K8S_DIR/dev/frontend/"

# Wait for Frontend to be ready
echo "⏳ Waiting for Frontend..."
kubectl wait --for=condition=ready pod -l app=ai-tutor-frontend -n ai-tutor-dev --timeout=120s

echo ""
echo "✅ DEV deployment complete!"
echo ""
echo "📊 Pod status:"
kubectl get pods -n ai-tutor-dev

echo ""
echo "🌐 Access the application:"
CURRENT_IP=$(ip -4 addr show wlo1 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' || echo "192.168.1.x")
echo "  Add to /etc/hosts: $CURRENT_IP ai-tutor-dev.local"
echo "  URL: https://ai-tutor-dev.local"
echo ""
echo "  Quick add: echo '$CURRENT_IP ai-tutor-dev.local' | sudo tee -a /etc/hosts"
