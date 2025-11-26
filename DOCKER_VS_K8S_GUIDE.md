# 🎯 Quick Comparison - Docker Compose vs K8s

## 🏃 Quick Start

### Docker Compose (Local Development)
```bash
cd /home/tansang/AI-Tutor
docker-compose up -d
# Access at: http://localhost:3000
```

### K8s (Production-like)
```bash
kubectl get pods -n ai-dev
kubectl get svc -n ai-dev
# Access at: https://ai-tutor.local (add to /etc/hosts if needed)
```

---

## 📋 Services Comparison

| Feature | Docker Compose | K8s |
|---------|----------------|-----|
| **Frontend URL** | `http://localhost:3000` | `https://ai-tutor.local/` |
| **Backend API** | `http://localhost:5000` | Via Ingress: `https://ai-tutor.local/api/*` |
| **MongoDB** | `localhost:27017` | `mongodb.ai-dev.svc.cluster.local:27017` |
| **Health Check** | `curl http://localhost:3000/health` | `curl -k https://ai-tutor.local/health` |
| **Chat Endpoint** | `POST http://localhost:3000/api/gemini/chat` | `POST https://ai-tutor.local/api/gemini/chat` |
| **Greeting** | `{"greet": true}` | `{"greet": true}` |
| **SSL/TLS** | ❌ HTTP only | ✅ HTTPS (self-signed) |
| **High Availability** | Single instance | 2 replicas (frontend), 2 replicas (backend) |
| **Persistence** | Volume mount | PVC + StatefulSet |
| **Service Discovery** | Container names | K8s DNS |

---

## 🔧 Common Commands

### Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker restart ai_tutor_backend_main

# Exec command in container
docker exec ai_tutor_backend_main env | grep GEMINI
```

### Kubernetes

```bash
# View pods
kubectl get pods -n ai-dev

# View services
kubectl get svc -n ai-dev

# View logs
kubectl logs -f -n ai-dev -l app=backend

# Restart deployment
kubectl rollout restart deployment/backend -n ai-dev

# Port forward for local testing
kubectl port-forward -n ai-dev svc/backend 5001:5000

# Describe pod (for debugging)
kubectl describe pod <pod-name> -n ai-dev

# Exec command in pod
kubectl exec -n ai-dev <pod-name> -- env | grep GEMINI
```

---

## 🧪 API Testing

### Greeting Endpoint

**Docker Compose:**
```bash
curl -X POST http://localhost:3000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"greet": true}'
```

**K8s:**
```bash
curl -k -X POST https://ai-tutor.local/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"greet": true}'
```

### Chat Endpoint

**Docker Compose:**
```bash
curl -X POST http://localhost:3000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Xin chào"}'
```

**K8s:**
```bash
curl -k -X POST https://ai-tutor.local/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Xin chào"}'
```

---

## 🔑 Key Differences

### Configuration

| Item | Docker Compose | K8s |
|------|---|---|
| **Environment Variables** | `.env` file or `docker-compose.yml` | ConfigMap + Secret |
| **Secrets** | In docker-compose or env file | `kubectl create secret` |
| **Configuration** | Inline in docker-compose.yml | ConfigMap or YAML files |

### Networking

| Item | Docker Compose | K8s |
|---|---|---|
| **DNS** | Container names (e.g., `ai_tutor_backend_main`) | Service DNS (e.g., `backend.ai-dev.svc.cluster.local`) |
| **Port Mapping** | Host:Container (e.g., `3000:80`) | ClusterIP + Ingress |
| **Service Discovery** | Docker internal | K8s DNS |

### Storage

| Item | Docker Compose | K8s |
|---|---|---|
| **Data Persistence** | Volumes (`mongo_data:`) | PVC (Persistent Volume Claim) |
| **Database** | In separate container | StatefulSet with PVC |
| **Logs** | Host volume mount | In container (or ELK stack) |

---

## 🚨 Troubleshooting

### Docker Compose Issues

**Problem:** Container not starting
```bash
# Solution
docker-compose logs backend
docker inspect ai_tutor_backend_main
```

**Problem:** Port already in use
```bash
# Solution
docker-compose down -v
lsof -i :3000  # Find process on port 3000
```

### K8s Issues

**Problem:** Pod not running
```bash
# Solution
kubectl describe pod <pod-name> -n ai-dev
kubectl logs <pod-name> -n ai-dev
```

**Problem:** API not accessible
```bash
# Solution
kubectl get ingress -n ai-dev
kubectl describe ingress ai-tutor-ingress -n ai-dev
ping ai-tutor.local  # Check DNS resolution
```

---

## 📊 Comparison Matrix

```
┌─────────────────────────────────────────────────────────────┐
│           DOCKER COMPOSE vs KUBERNETES                       │
├──────────────┬──────────────────────┬──────────────────────┤
│ Feature      │ Docker Compose       │ Kubernetes           │
├──────────────┼──────────────────────┼──────────────────────┤
│ Complexity   │ ★☆☆☆☆              │ ★★★★★               │
│ Learning     │ ★☆☆☆☆              │ ★★★★☆               │
│ Scalability  │ ★☆☆☆☆              │ ★★★★★               │
│ HA/DR        │ ★☆☆☆☆              │ ★★★★★               │
│ Production   │ ★★☆☆☆              │ ★★★★★               │
│ Dev Speed    │ ★★★★★              │ ★★★☆☆               │
│ Cost         │ ★★★★★              │ ★★★☆☆               │
│ Monitoring   │ ★★☆☆☆              │ ★★★★☆               │
│ Networking   │ ★★★☆☆              │ ★★★★★               │
│ Storage      │ ★★★☆☆              │ ★★★★★               │
└──────────────┴──────────────────────┴──────────────────────┘

★ = Feature strength rating
```

---

## 🎯 Use Case

### Choose Docker Compose When:
- ✅ Local development
- ✅ Quick prototyping
- ✅ Single machine testing
- ✅ Learning deployment basics
- ✅ Small team/project

### Choose Kubernetes When:
- ✅ Production deployment
- ✅ Multiple machines/nodes
- ✅ High availability needed
- ✅ Auto-scaling required
- ✅ Enterprise applications
- ✅ Microservices architecture

---

## 📝 Notes for Week 9 Report

**Both environments tested and working:**
1. Docker Compose: Local development environment fully functional
2. Kubernetes: Production-like environment with HA, rolling updates, HTTPS
3. Greeting message: Implemented and working in both
4. Chat functionality: Working with Gemini API in both
5. API proxy: Frontend correctly proxying to backend in both

**Deployment Strategy Verified:**
- Rolling updates work in K8s
- Zero-downtime deployments achievable
- Secrets management working
- ConfigMap updates trigger rollouts
- CORS handling working

---

**Status: ✅ READY FOR PRODUCTION TESTING**
