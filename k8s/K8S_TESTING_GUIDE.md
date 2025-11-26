# K8s Testing Guide - AI Tutor

## ✅ Status Summary

### Pods
```bash
kubectl get pods -n ai-dev
```
**Expected:** 5 pods running (2 frontend, 2 backend, 1 mongodb)

### Services
```bash
kubectl get svc -n ai-dev
```
**Expected:** 3 services (frontend, backend, mongodb)

### Ingress
```bash
kubectl get ingress -n ai-dev
```
**Expected:** Ingress "ai-tutor-ingress" with IP

### Certificates
```bash
kubectl get certificate -n ai-dev
```
**Expected:** Certificate "ai-tutor-tls" in READY state

---

## 🧪 Endpoint Tests

### 1. Frontend Health
```bash
curl -k https://ai-tutor.local/health
```
Expected: `healthy`

### 2. Frontend Web
```bash
curl -k https://ai-tutor.local/ | head -20
```
Expected: Flutter Web HTML output

### 3. API via Frontend
```bash
curl -k https://ai-tutor.local/api/ping | jq .
```
Expected: 
```json
{
  "success": true,
  "message": "Backend is running!",
  "cors": "enabled"
}
```

### 4. Backend Direct (from pod)
```bash
BACKEND_POD=$(kubectl get pods -n ai-dev -l app=backend -o name | head -1 | sed 's/.*\///')
kubectl exec -n ai-dev $BACKEND_POD -- curl -s http://localhost:5000/api/ready | jq .
```
Expected:
```json
{
  "ready": true,
  "dbState": 1,
  "message": "OK"
}
```

### 5. MongoDB Connection (from pod)
```bash
MONGO_POD=$(kubectl get pods -n ai-dev -l app=mongodb -o name | head -1 | sed 's/.*\///')
kubectl exec -n ai-dev $MONGO_POD -- mongosh --eval "db.adminCommand('ping')" | grep -A1 ok
```
Expected: `{ ok: 1 }`

---

## 🔍 Debugging

### View Frontend Logs
```bash
kubectl logs -f -n ai-dev -l app=ai-tutor-frontend --tail=50
```

### View Backend Logs
```bash
kubectl logs -f -n ai-dev -l app=backend --tail=50
```

### View MongoDB Logs
```bash
kubectl logs -f -n ai-dev -l app=mongodb --tail=50
```

### Port Forward for Local Testing
```bash
# Frontend
kubectl port-forward -n ai-dev svc/frontend 8080:80 &

# Backend
kubectl port-forward -n ai-dev svc/backend 5001:5000 &

# MongoDB
kubectl port-forward -n ai-dev svc/mongodb 27018:27017 &
```

---

## 🔄 Rolling Update Test

Update ConfigMap and trigger rolling restart:
```bash
bash k8s/scripts/update-configmap-and-rollout.sh
```

This will:
1. Update nginx.conf in ConfigMap
2. Trigger deployment rolling update
3. Show rollout status

Watch rolling update:
```bash
kubectl rollout status deployment/frontend -n ai-dev -w
```

---

## 📊 Performance Monitoring

### Pod Resource Usage
```bash
kubectl top pods -n ai-dev
```

### Node Resource Usage
```bash
kubectl top nodes
```

### Pod Events
```bash
kubectl describe pod <pod-name> -n ai-dev
```

---

## 🚀 Advanced Tests

### Test Cross-Pod Communication
```bash
FRONTEND_POD=$(kubectl get pods -n ai-dev -l app=ai-tutor-frontend -o name | head -1 | sed 's/.*\///')
kubectl exec -n ai-dev $FRONTEND_POD -- curl -s http://backend.ai-dev.svc.cluster.local:5000/api/ping | jq .
```

### Test Database from Frontend
```bash
FRONTEND_POD=$(kubectl get pods -n ai-dev -l app=ai-tutor-frontend -o name | head -1 | sed 's/.*\///')
kubectl exec -n ai-dev $FRONTEND_POD -- wget -O- http://backend.ai-dev.svc.cluster.local:5000/api/ready
```

### Get Pod IPs
```bash
kubectl get pods -n ai-dev -o wide
```

---

## ✅ Quick Health Check (One-Liner)

```bash
echo "Frontend:" && curl -k -s https://ai-tutor.local/health && \
echo "" && echo "API:" && curl -k -s https://ai-tutor.local/api/ping | jq '.success' && \
echo "" && echo "Pods:" && kubectl get pods -n ai-dev --field-selector=status.phase=Running | wc -l
```

Expected output:
```
Frontend:
healthy
API:
true
Pods:
6
```

---

## 📝 Common Issues

| Issue | Solution |
|-------|----------|
| Pods not starting | `kubectl describe pod <name> -n ai-dev` |
| DNS not resolving | Check CoreDNS: `kubectl get pods -n kube-system` |
| Certificate errors | `kubectl describe cert ai-tutor-tls -n ai-dev` |
| API returns 502 | Check backend pod logs |
| CORS errors | Verify backend CORS config |

