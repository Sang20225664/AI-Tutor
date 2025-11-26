#!/bin/bash

echo "🔍 Checking Ingress IP and Configuration"
echo "========================================="

NAMESPACE="ai-dev"
INGRESS_NAME="ai-tutor-ingress"

# 1. Kiểm tra Ingress
echo ""
echo "📊 Ingress Details:"
kubectl get ingress "$INGRESS_NAME" -n "$NAMESPACE"

echo ""
echo "📋 Ingress Full Info:"
kubectl describe ingress "$INGRESS_NAME" -n "$NAMESPACE"

# 2. Lấy IP từ Traefik Service (K3s default)
echo ""
echo "🌐 Traefik Service (K3s Ingress Controller):"
kubectl get svc -n kube-system traefik

# 3. Lấy Ingress IP
echo ""
echo "📍 Ingress IP Address:"
INGRESS_IP=$(kubectl get ingress "$INGRESS_NAME" -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

if [ -z "$INGRESS_IP" ]; then
    # Fallback: lấy từ Traefik LoadBalancer
    INGRESS_IP=$(kubectl get svc traefik -n kube-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
fi

if [ -z "$INGRESS_IP" ]; then
    # Fallback: lấy node IP nếu không có LoadBalancer
    INGRESS_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
    echo "⚠️ No LoadBalancer IP, using Node IP: $INGRESS_IP"
else
    echo "✅ Ingress IP: $INGRESS_IP"
fi

# 4. Kiểm tra certificate
echo ""
echo "🔐 TLS Certificate Status:"
kubectl get certificate -n "$NAMESPACE"
kubectl describe certificate ai-tutor-cert -n "$NAMESPACE" | grep -A 5 "Status:"

# 5. Hướng dẫn cấu hình /etc/hosts
echo ""
echo "📝 Add to /etc/hosts:"
echo "===================="
echo "sudo sh -c 'echo \"$INGRESS_IP ai-tutor.local\" >> /etc/hosts'"

echo ""
echo "📝 Or edit manually:"
echo "sudo nano /etc/hosts"
echo "# Add this line:"
echo "$INGRESS_IP ai-tutor.local"

# 6. Test commands
echo ""
echo "🧪 Test Commands:"
echo "================="
echo "# Test HTTPS (ignore self-signed cert warning):"
echo "curl -vk https://ai-tutor.local/"
echo ""
echo "# Test API proxy:"
echo "curl -vk https://ai-tutor.local/api/ping"
echo ""
echo "# Test health endpoint:"
echo "curl -vk https://ai-tutor.local/health"
echo ""
echo "# Test with browser:"
echo "https://ai-tutor.local"
