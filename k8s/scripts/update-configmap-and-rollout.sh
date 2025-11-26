#!/bin/bash
set -e

echo "🔄 Updating ConfigMap and triggering rollout"
echo "============================================="

NGINX_CONF_PATH="/home/tansang/AI-Tutor/ai_tutor_app/nginx.conf"
NAMESPACE="ai-dev"
DEPLOYMENT="frontend"
CONFIGMAP="frontend-nginx-conf"

# 1. Kiểm tra file nginx.conf tồn tại
if [ ! -f "$NGINX_CONF_PATH" ]; then
    echo "❌ Error: nginx.conf not found at $NGINX_CONF_PATH"
    exit 1
fi

# 2. Tính checksum SHA256 của nginx.conf
echo ""
echo "📊 Calculating SHA256 checksum..."
HASH=$(sha256sum "$NGINX_CONF_PATH" | awk '{print $1}')
echo "✅ SHA256: $HASH"

# 3. Cập nhật ConfigMap từ file
echo ""
echo "📦 Updating ConfigMap from file..."
kubectl create configmap "$CONFIGMAP" \
    --from-file=nginx.conf="$NGINX_CONF_PATH" \
    --namespace="$NAMESPACE" \
    --dry-run=client -o yaml | kubectl apply -f -

# 4. Patch Deployment annotation để trigger rollout
echo ""
echo "🔧 Patching Deployment annotation to trigger rollout..."
kubectl -n "$NAMESPACE" patch deployment "$DEPLOYMENT" --type='json' \
    -p="[{\"op\":\"replace\",\"path\":\"/spec/template/metadata/annotations/configmap.frontend-nginx-conf-hash\",\"value\":\"$HASH\"}]"

# 5. Theo dõi rollout status
echo ""
echo "⏳ Watching rollout status..."
kubectl rollout status deployment/"$DEPLOYMENT" -n "$NAMESPACE"

# 6. Kiểm tra pods
echo ""
echo "📊 Current pods:"
kubectl get pods -n "$NAMESPACE" -l app=ai-tutor-frontend

echo ""
echo "✅ ConfigMap updated and rollout completed!"
echo ""
echo "📝 Verify changes:"
echo "1. Check pod logs:"
echo "   kubectl logs -n $NAMESPACE -l app=ai-tutor-frontend --tail=20"
echo ""
echo "2. Test nginx config:"
echo "   kubectl exec -it -n $NAMESPACE deployment/$DEPLOYMENT -- nginx -t"
echo ""
echo "3. View current annotation:"
echo "   kubectl get deployment $DEPLOYMENT -n $NAMESPACE -o jsonpath='{.spec.template.metadata.annotations}'"
