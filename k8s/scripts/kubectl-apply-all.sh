#!/bin/bash
set -e

echo "🚀 Deploying AI Tutor Frontend to Kubernetes"
echo "================================================"

# 1. Cài đặt cert-manager (nếu chưa có)
echo ""
echo "📦 Step 1: Installing cert-manager (if not exists)..."
if ! kubectl get namespace cert-manager &>/dev/null; then
    echo "Installing cert-manager..."
    kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
    echo "⏳ Waiting for cert-manager to be ready..."
    kubectl wait --for=condition=Available --timeout=300s deployment/cert-manager -n cert-manager
    kubectl wait --for=condition=Available --timeout=300s deployment/cert-manager-webhook -n cert-manager
    kubectl wait --for=condition=Available --timeout=300s deployment/cert-manager-cainjector -n cert-manager
else
    echo "✅ cert-manager already installed"
fi

# 2. Tạo namespace (nếu chưa có)
echo ""
echo "📦 Step 2: Creating namespace ai-dev..."
kubectl create namespace ai-dev --dry-run=client -o yaml | kubectl apply -f -

# 3. Tạo ClusterIssuer
echo ""
echo "📦 Step 3: Creating ClusterIssuer (self-signed CA)..."
kubectl apply -f k8s/frontend/cluster-issuer-selfsigned.yaml

# 4. Tạo ConfigMap cho Nginx
echo ""
echo "📦 Step 4: Creating ConfigMap for Nginx configuration..."
kubectl apply -f k8s/frontend/configmap-frontend-nginx.yaml

# 5. Tạo Deployment
echo ""
echo "📦 Step 5: Creating Frontend Deployment..."
kubectl apply -f k8s/frontend/frontend-deployment.yaml

# 6. Tạo Service
echo ""
echo "📦 Step 6: Creating Frontend Service..."
kubectl apply -f k8s/frontend/frontend-service.yaml

# 7. Tạo Certificate
echo ""
echo "📦 Step 7: Creating Certificate for ai-tutor.local..."
kubectl apply -f k8s/frontend/certificate-ai-tutor.yaml

# Đợi certificate ready
echo "⏳ Waiting for certificate to be ready..."
kubectl wait --for=condition=Ready --timeout=60s certificate/ai-tutor-cert -n ai-dev || echo "⚠️ Certificate not ready yet, check with: kubectl get certificate -n ai-dev"

# 8. Tạo Ingress
echo ""
echo "📦 Step 8: Creating Ingress..."
kubectl apply -f k8s/frontend/ingress-ai-tutor.yaml

# 9. Kiểm tra deployment status
echo ""
echo "📊 Deployment Status:"
echo "===================="
kubectl get all -n ai-dev
echo ""
kubectl get ingress -n ai-dev
echo ""
kubectl get certificate -n ai-dev

# 10. Hướng dẫn tiếp theo
echo ""
echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Add to /etc/hosts:"
echo "   sudo sh -c 'echo \"<INGRESS_IP> ai-tutor.local\" >> /etc/hosts'"
echo ""
echo "2. Get Ingress IP:"
echo "   kubectl get ingress ai-tutor-ingress -n ai-dev"
echo "   # Or for Traefik on K3s:"
echo "   kubectl get svc -n kube-system traefik"
echo ""
echo "3. Test endpoints:"
echo "   curl -vk https://ai-tutor.local/"
echo "   curl -vk https://ai-tutor.local/api/ping"
echo "   curl -vk https://ai-tutor.local/health"
echo ""
echo "4. Watch rollout status:"
echo "   kubectl rollout status deployment/frontend -n ai-dev"
echo ""
echo "5. View logs:"
echo "   kubectl logs -n ai-dev -l app=ai-tutor-frontend --tail=50"
