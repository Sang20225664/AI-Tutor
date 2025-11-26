#!/bin/bash

# Test all K8s endpoints for AI Tutor deployment

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "🧪 K8s ENDPOINT TESTING FOR AI TUTOR"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Helper function
test_endpoint() {
    local name="$1"
    local cmd="$2"
    
    echo -n "Testing: $name ... "
    if eval "$cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((FAIL++))
    fi
}

# 1. Check namespace
echo "📍 Checking Namespace..."
test_endpoint "Namespace ai-dev exists" "kubectl get ns ai-dev"
echo ""

# 2. Check Pods
echo "📍 Checking Pods..."
test_endpoint "Frontend pods running" "kubectl get pods -n ai-dev -l app=ai-tutor-frontend --field-selector=status.phase=Running | grep -q 'Running'"
test_endpoint "Backend pods running" "kubectl get pods -n ai-dev -l app=backend --field-selector=status.phase=Running | grep -q 'Running'"
test_endpoint "MongoDB pod running" "kubectl get pods -n ai-dev -l app=mongodb --field-selector=status.phase=Running | grep -q 'Running'"
echo ""

# 3. Check Services
echo "📍 Checking Services..."
test_endpoint "Frontend service exists" "kubectl get svc -n ai-dev frontend"
test_endpoint "Backend service exists" "kubectl get svc -n ai-dev backend"
test_endpoint "MongoDB service exists" "kubectl get svc -n ai-dev mongodb"
echo ""

# 4. Check Ingress
echo "📍 Checking Ingress..."
test_endpoint "Ingress exists" "kubectl get ingress -n ai-dev ai-tutor-ingress"
test_endpoint "Ingress has IP" "kubectl get ingress -n ai-dev ai-tutor-ingress | tail -1 | awk '{print \$3}' | grep -E '^[0-9]'"
echo ""

# 5. Check Certificates
echo "📍 Checking SSL Certificates..."
test_endpoint "Certificate exists" "kubectl get certificate -n ai-dev ai-tutor-tls"
test_endpoint "Certificate ready" "kubectl get certificate -n ai-dev ai-tutor-tls | grep -i true"
echo ""

# 6. HTTP/HTTPS Tests
echo "📍 Testing HTTP/HTTPS Endpoints..."
test_endpoint "Frontend /health (HTTPS)" "curl -k -s https://ai-tutor.local/health | grep -q 'healthy'"
test_endpoint "Frontend / page loads" "curl -k -s https://ai-tutor.local/ | grep -q 'flutter'"
test_endpoint "API /api/ping (HTTPS)" "curl -k -s https://ai-tutor.local/api/ping | grep -q 'success'"
echo ""

# 7. Internal Pod Tests
echo "📍 Testing Internal Pod Communication..."
BACKEND_POD=$(kubectl get pods -n ai-dev -l app=backend -o name | head -1 | sed 's/.*\///')
test_endpoint "Backend /api/ready from pod" "kubectl exec -n ai-dev $BACKEND_POD -- curl -s http://localhost:5000/api/ready | grep -q 'ready'"
echo ""

# 8. ConfigMap
echo "📍 Checking Configuration..."
test_endpoint "Frontend ConfigMap exists" "kubectl get configmap -n ai-dev frontend-nginx-config"
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════════"
echo -e "📊 TEST SUMMARY: ${GREEN}$PASS PASSED${NC}, ${RED}$FAIL FAILED${NC}"
echo "═══════════════════════════════════════════════════════════════"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
