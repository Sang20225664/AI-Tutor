# 📚 Multi-Environment Kubernetes Deployment Guide

## 🌍 Environment Structure

Dự án sử dụng **3 môi trường** độc lập:

```
k8s/
├── dev/          # Development - Internal testing
├── staging/      # Pre-production - UAT testing
└── prod/         # Production - Live users
```

---

## 🎯 Environment Comparison

| Feature | DEV | STAGING | PROD |
|---------|-----|---------|------|
| **Namespace** | `ai-tutor-dev` | `ai-tutor-staging` | `ai-tutor-prod` |
| **Domain** | `ai-tutor-dev.local` | `ai-tutor-staging.local` | `ai-tutor.example.com` |
| **Frontend Replicas** | 1 | 2 | 3 |
| **Backend Replicas** | 1 | 2 | 3 |
| **MongoDB Storage** | 5Gi | 10Gi | 20Gi |
| **CPU (Backend)** | 100m-300m | 200m-500m | 500m-1000m |
| **Memory (Backend)** | 128Mi-256Mi | 256Mi-512Mi | 512Mi-1Gi |
| **Logging** | DEBUG | INFO | WARN |
| **TLS Certificate** | Self-signed | Self-signed | Let's Encrypt |
| **Rate Limiting** | ❌ | ❌ | ✅ (10 RPS) |
| **Gzip Compression** | ❌ | ❌ | ✅ |
| **Zero Downtime** | ❌ | ✅ | ✅ |

---

## 🚀 Deployment

### 1️⃣ Deploy to DEV

```bash
cd /home/tansang/AI-Tutor/k8s/scripts
./deploy-dev.sh
```

**Access:**
```bash
# Add to /etc/hosts
echo "192.168.1.20 ai-tutor-dev.local" | sudo tee -a /etc/hosts

# Open browser
https://ai-tutor-dev.local
```

---

### 2️⃣ Deploy to STAGING

```bash
cd /home/tansang/AI-Tutor/k8s/scripts
./deploy-staging.sh
```

**Access:**
```bash
# Add to /etc/hosts
echo "192.168.1.20 ai-tutor-staging.local" | sudo tee -a /etc/hosts

# Open browser
https://ai-tutor-staging.local
```

---

### 3️⃣ Deploy to PRODUCTION

**⚠️ BEFORE DEPLOYMENT:**

1. **Update Secrets** (`k8s/prod/backend/backend-secret.yaml`):
```yaml
stringData:
  GEMINI_API_KEY: "YOUR-REAL-PRODUCTION-KEY"
  JWT_SECRET: "STRONG-32-CHARACTER-SECRET"
```

2. **Update Domain** (`k8s/prod/frontend/ingress-ai-tutor.yaml`):
```yaml
spec:
  tls:
  - hosts:
    - your-domain.com  # Change this
  rules:
  - host: your-domain.com  # Change this
```

3. **Create Let's Encrypt ClusterIssuer** (if not exists):
```bash
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: traefik
EOF
```

**Deploy:**
```bash
cd /home/tansang/AI-Tutor/k8s/scripts
./deploy-prod.sh
```

---

## 🔄 Rolling Update Strategy

### Update Backend/Frontend Image

**For DEV:**
```bash
# Build new image
docker build -t sang5664/ai-tutor-backend:latest .
docker push sang5664/ai-tutor-backend:latest

# Rolling update (zero downtime for staging/prod)
kubectl rollout restart deployment/backend -n ai-tutor-dev
```

**For STAGING/PROD:**
```bash
# Use version tags
docker build -t sang5664/ai-tutor-backend:v1.0.1 .
docker push sang5664/ai-tutor-backend:v1.0.1

# Update deployment YAML with new version
kubectl set image deployment/backend backend=sang5664/ai-tutor-backend:v1.0.1 -n ai-tutor-staging

# Monitor rollout
kubectl rollout status deployment/backend -n ai-tutor-staging
```

---

## 🔍 Monitoring

### Check Pod Status
```bash
# DEV
kubectl get pods -n ai-tutor-dev

# STAGING
kubectl get pods -n ai-tutor-staging

# PROD
kubectl get pods -n ai-tutor-prod
```

### View Logs
```bash
# Backend logs
kubectl logs -n ai-tutor-dev -l app=backend --tail=50

# Frontend logs
kubectl logs -n ai-tutor-dev -l app=ai-tutor-frontend --tail=50
```

### Check Resource Usage
```bash
kubectl top pods -n ai-tutor-prod
```

---

## 🔐 Security Checklist for PROD

- [ ] Change `GEMINI_API_KEY` in `backend-secret.yaml`
- [ ] Change `JWT_SECRET` to 32+ character random string
- [ ] Update domain in `ingress-ai-tutor.yaml`
- [ ] Configure Let's Encrypt ClusterIssuer
- [ ] Enable rate limiting (already configured)
- [ ] Review resource limits
- [ ] Set up monitoring/alerts
- [ ] Enable backup for MongoDB PVC
- [ ] Configure network policies (optional)

---

## 📊 Promotion Workflow

```
DEV → STAGING → PROD
```

1. **Test in DEV** → Fix bugs
2. **Deploy to STAGING** → UAT testing
3. **If approved** → Deploy to PROD with version tag

**Example:**
```bash
# After testing in DEV and STAGING
docker tag sang5664/ai-tutor-backend:latest sang5664/ai-tutor-backend:v1.0.0
docker push sang5664/ai-tutor-backend:v1.0.0

# Update prod/backend/backend-deployment.yaml
# Change image: sang5664/ai-tutor-backend:v1.0.0

kubectl apply -f k8s/prod/backend/backend-deployment.yaml
kubectl rollout status deployment/backend -n ai-tutor-prod
```

---

## 🛠️ Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

### Database connection issues
```bash
# Check MongoDB is running
kubectl get pods -n <namespace> -l app=mongodb

# Test connection from backend pod
kubectl exec -it <backend-pod> -n <namespace> -- curl http://mongodb:27017
```

### Ingress not working
```bash
# Check ingress status
kubectl get ingress -n <namespace>
kubectl describe ingress ai-tutor-ingress -n <namespace>

# Check certificate
kubectl get certificate -n <namespace>
```

---

## 🔄 Rollback

If something goes wrong:

```bash
# Rollback to previous version
kubectl rollout undo deployment/backend -n <namespace>

# Check rollout history
kubectl rollout history deployment/backend -n <namespace>

# Rollback to specific revision
kubectl rollout undo deployment/backend --to-revision=2 -n <namespace>
```

---

## 📝 Notes

- **DEV**: Single replica, minimal resources, verbose logging
- **STAGING**: 2 replicas, zero-downtime updates, realistic testing
- **PROD**: 3 replicas, high availability, rate limiting, Let's Encrypt TLS

**Service DNS in each environment:**
- DEV: `backend.ai-tutor-dev.svc.cluster.local:5000`
- STAGING: `backend.ai-tutor-staging.svc.cluster.local:5000`
- PROD: `backend.ai-tutor-prod.svc.cluster.local:5000`
