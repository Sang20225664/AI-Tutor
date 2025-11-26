#!/bin/bash
set -e

echo "🧪 Testing Zero-Downtime Rolling Update"
echo "========================================"

NAMESPACE="ai-dev"
DEPLOYMENT="frontend"
NEW_IMAGE="${1:-sang5664/ai-tutor-frontend:latest}"

echo ""
echo "📦 Current deployment image:"
kubectl get deployment "$DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}'
echo ""

echo ""
echo "🔄 Updating deployment image to: $NEW_IMAGE"
kubectl set image deployment/"$DEPLOYMENT" nginx="$NEW_IMAGE" -n "$NAMESPACE" --record

echo ""
echo "⏳ Watching rollout status (Ctrl+C to exit)..."
kubectl rollout status deployment/"$DEPLOYMENT" -n "$NAMESPACE"

echo ""
echo "📊 Deployment history:"
kubectl rollout history deployment/"$DEPLOYMENT" -n "$NAMESPACE"

echo ""
echo "📊 Current pods:"
kubectl get pods -n "$NAMESPACE" -l app=ai-tutor-frontend

echo ""
echo "✅ Rolling update completed!"
echo ""
echo "📝 Rollback if needed:"
echo "   kubectl rollout undo deployment/$DEPLOYMENT -n $NAMESPACE"
echo ""
echo "📝 Test endpoints:"
echo "   curl -vk https://ai-tutor.local/"
echo "   curl -vk https://ai-tutor.local/health"
