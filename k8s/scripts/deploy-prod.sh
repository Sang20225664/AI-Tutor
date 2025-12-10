#!/bin/bash

# Deploy to PRODUCTION environment
echo "🚀 Deploying AI Tutor to PRODUCTION environment..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"

# Safety check
echo "⚠️  WARNING: You are about to deploy to PRODUCTION!"
echo "Have you:"
echo "  1. Updated backend-secret.yaml with real production secrets?"
echo "  2. Changed the domain in ingress-ai-tutor.yaml?"
echo "  3. Configured Let's Encrypt ClusterIssuer?"
echo ""
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Apply namespace first
echo "📦 Creating namespace..."
kubectl apply -f "$K8S_DIR/prod/namespace/namespace.yaml"

# Apply MongoDB
echo "💾 Deploying MongoDB..."
kubectl apply -f "$K8S_DIR/prod/mongodb/"

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB..."
kubectl wait --for=condition=ready pod -l app=mongodb -n ai-tutor-prod --timeout=120s

# Apply Backend
echo "🔧 Deploying Backend..."
kubectl apply -f "$K8S_DIR/prod/backend/"

# Wait for Backend to be ready
echo "⏳ Waiting for Backend..."
kubectl wait --for=condition=ready pod -l app=backend -n ai-tutor-prod --timeout=120s

# Apply Frontend
echo "🎨 Deploying Frontend..."
kubectl apply -f "$K8S_DIR/prod/frontend/"

# Wait for Frontend to be ready
echo "⏳ Waiting for Frontend..."
kubectl wait --for=condition=ready pod -l app=ai-tutor-frontend -n ai-tutor-prod --timeout=120s

echo ""
echo "✅ PRODUCTION deployment complete!"
echo ""
echo "📊 Pod status:"
kubectl get pods -n ai-tutor-prod

echo ""
echo "🌐 Access the application:"
kubectl get ingress -n ai-tutor-prod
