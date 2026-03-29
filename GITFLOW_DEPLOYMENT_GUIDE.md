# 🚀 Git Flow & CI/CD Deployment Guide

## 📋 Overview

Dự án sử dụng **Git Flow** với **CD (Continuous Deployment)** để tự động deploy qua 3 môi trường:

- **DEV**: Phát triển và test nội bộ

- **PROD**: Người dùng thực tế

---

## 🌳 Branch Strategy

```
main (prod)
    ↑
dev
    ↑
feature/*
```

### Branch Rules

| Branch | Purpose | Protected | Auto Deploy | Approval Required |
|--------|---------|-----------|-------------|-------------------|
| `main` | Production code | ⚠️ Recommended | ✅ Yes | ⚠️ Recommended |
| `dev` | Development | ❌ No | ✅ Yes | ❌ Auto |
| `feature/*` | New features | ❌ No | ❌ No | N/A |

---

## 🔄 Standard Workflow

### 1️⃣ Feature Development

```bash
# Start new feature
git checkout dev
git pull origin dev
git checkout -b feature/add-quiz-timer

# Make changes
git add .
git commit -m "feat: add quiz timer functionality"
git push origin feature/add-quiz-timer

# Create PR: feature/add-quiz-timer → dev
# After review → Merge to dev
```

**What happens:**
- ✅ Code merged to `dev`
- 🤖 `cd-dev.yml` automatically triggers
- 🏗️ Build Docker images with `dev-{sha}` tags
- 🚀 Deploy to DEV environment (`ai-tutor-dev` namespace)
- 🏥 Run smoke tests
- 📊 Deployment summary

### 2️⃣ Promote to Staging

```bash
# After testing in DEV is successful
git checkout staging
git pull origin staging
git merge dev
git push origin staging
```

**What happens:**
- ✅ Code merged to `staging`
- 🤖 `cd-staging.yml` automatically triggers
- 🏗️ Build Docker images with `staging-{sha}` tags
- 🚀 Deploy to STAGING environment (`ai-tutor-staging` namespace)
- 🏥 Run enhanced smoke tests (health check + API tests)
- 📊 Deployment summary

**CI Validation (if using PR):**
```bash
# Create PR: dev → staging
```
- 🔍 `ci.yml` runs: lint, test, build validation
- ✅ Must pass before merge allowed (if branch protection enabled)

### 3️⃣ Release to Production

```bash
# After UAT passed in STAGING
# Option 1: Direct merge (simple, fast)
git checkout main
git pull origin main
git merge staging
git push origin main

# Option 2: Pull Request (recommended for team review)
# Create PR: staging → main on GitHub
```

**What happens:**
1. **If using PR (recommended):**
   - 🤖 `ci.yml` triggers on PR (optional validation)
   - 🧪 Run tests and build checks
   - 👥 Team review code changes
   - ✅ After approval → Merge

2. **After merge to main:**
   - 🤖 `cd-prod.yml` triggers
   - 🏗️ Build with `prod-{sha}` tags
   - ⏸️ **WAIT FOR MANUAL APPROVAL** (environment: prod)
   - 🚀 Deploy to PRODUCTION (`ai-tutor-prod` namespace)
   - 🏥 Run critical smoke tests
   - ✅ **Success:** Show deployment summary
   - ❌ **Failure:** Auto rollback to previous version

---

## ⚠️ CI/CD Explained: Do You Need CI?

### **What is CI (Continuous Integration)?**

CI kiểm tra code **TRƯỚC KHI** merge vào branch quan trọng (main/staging).

**Hiện tại:** CI chạy nhưng **KHÔNG BLOCK** merge vì chưa setup **Branch Protection**!

### **Khi nào cần CI?**

#### ✅ **CẦN CI khi:**
1. **Team nhiều người** (3+ developers)
   - Ngăn chặn code lỗi merge vào production
   - Đảm bảo mọi người follow coding standards
   
2. **Production quan trọng** (có người dùng thật)
   - Không thể để app crash vì lỗi syntax
   - Cần đảm bảo tests pass trước khi deploy
   
3. **Cần review code nghiêm ngặt**
   - Force PR review + CI pass mới được merge
   - Tự động reject code không đạt chuẩn

#### ❌ **KHÔNG CẦN CI khi:**
1. **Solo developer hoặc team nhỏ (1-2 người)**
   - Bạn tự test trên DEV/STAGING trước
   - CD đã có smoke tests sau deployment
   
2. **Project cá nhân / học tập**
   - Không có áp lực production downtime
   - Rollback dễ dàng nếu lỗi
   
3. **Trust team hoàn toàn**
   - Mọi người test kỹ trước khi merge
   - CD smoke tests đủ để catch lỗi

### **Setup Branch Protection (Optional - Recommended for Production)**

Nếu muốn CI **THẬT SỰ BLOCK** merge:

1. Vào: `https://github.com/Sang20225664/AI-Tutor/settings/branches`
2. Add rule cho branch `main`:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - Select: `test-backend`, `test-frontend`, `build-backend`, `build-frontend`, `validate-k8s`
   - ✅ Require conversation resolution before merging
3. Lưu rule

**Kết quả:** Không thể merge vào `main` nếu CI fail! 🚫

### **Quy trình hiện tại (KHÔNG CÓ Branch Protection):**

```
Developer
    ↓
Push to dev → CD deploys to DEV → Test manually
    ↓
Merge to staging → CD deploys to STAGING → UAT test
    ↓
Merge to main → CD deploys to PROD (với approval + smoke test + auto rollback)
    ↓
CI chạy nhưng không block gì cả (chỉ show warning)
```

**Kết luận:** Hiện tại CI **HƠI THỪA** vì:
- ✅ CD đã có smoke tests sau mỗi deployment
- ✅ DEV/STAGING environment để test trước
- ✅ Production có approval + auto rollback
- ❌ CI không block merge (chưa setup branch protection)

### **Đề xuất:**

**Option 1: Giữ CI + Setup Branch Protection** (Recommended cho production app)
- ✅ Bảo vệ `main` branch tốt nhất
- ✅ Force team test trước khi merge
- ❌ Workflow hơi chậm (phải đợi CI pass)

**Option 2: Xóa CI, chỉ dùng CD** (OK cho solo/small team)
- ✅ Workflow nhanh, đơn giản
- ✅ CD smoke tests đủ để catch lỗi
- ❌ Có thể merge code lỗi vào main (nhưng sẽ rollback tự động)

Bạn muốn làm theo option nào?

---

## 🚀 CD Pipeline Details (Recommended Flow)

### cd-dev.yml (Development)

**Triggers:**
- Push to `dev` branch
- Changes in: `ai_tutor_backend/**`, `ai_tutor_app/**`, `k8s/dev/**`
- Manual trigger (workflow_dispatch)

**Steps:**
1. Build & push backend image → `sang5664/ai-tutor-backend:dev-{sha}`
2. Build & push frontend image → `sang5664/ai-tutor-frontend:dev-{sha}`
3. Deploy to K3s DEV namespace
4. Create secrets from GitHub Secrets
5. Wait for rollout (timeout: 300s)
6. Run smoke test (health check)
7. Show deployment summary

### cd-staging.yml (Staging)

**Triggers:**
- Push to `staging` branch
- Changes in: `ai_tutor_backend/**`, `ai_tutor_app/**`, `k8s/staging/**`
- Manual trigger

**Steps:**
1. Build & push backend image → `sang5664/ai-tutor-backend:staging-{sha}`
2. Build & push frontend image → `sang5664/ai-tutor-frontend:staging-{sha}`
3. Deploy to K3s STAGING namespace
4. Wait for rollout (timeout: 180s)
5. Run enhanced smoke tests:
   - Health check endpoint
   - Sample API endpoint (subjects)
6. Show deployment summary

### cd-prod.yml (Production)

**Triggers:**
- Push to `main` branch
- Release published
- Manual trigger

**Steps:**
1. Build & push backend image → `sang5664/ai-tutor-backend:prod-{sha}`
2. Build & push frontend image → `sang5664/ai-tutor-frontend:prod-{sha}`
3. **⏸️ WAIT FOR MANUAL APPROVAL** (environment: prod)
4. Deploy to K3s PRODUCTION namespace
5. Wait for rollout (timeout: 300s)
6. Run critical smoke tests:
   - Health check endpoint
   - Database connectivity test
7. **If smoke tests fail:**
   - 🔄 Auto rollback to previous version
   - ❌ Show rollback summary
8. **If smoke tests pass:**
   - ✅ Show deployment success summary

### cd-hotfix.yml (Hotfix Fast Track)

**Triggers:**
- Push to `hotfix/**` branches
- Manual trigger

**Steps:**
1. Build & push images with `hotfix-{sha}` tags
2. **⏸️ REQUIRE APPROVAL** (environment: prod)
3. Deploy to PRODUCTION
4. Run health checks
5. Show backport reminder

---

## 🔐 GitHub Secrets Required

Add these in: `Settings → Secrets and variables → Actions`

| Secret Name | Description | Used In |
|-------------|-------------|---------|
| `DOCKERHUB_TOKEN` | Docker Hub access token | All CD workflows |
| `GEMINI_API_KEY` | Google Gemini API key | All CD workflows |
| `JWT_SECRET` | JWT signing secret | All CD workflows |

---

## 🏥 Smoke Tests

### DEV Environment
- ✅ Backend health check (`/api/health`)

### STAGING Environment
- ✅ Backend health check
- ✅ API endpoint test (`/api/subjects`)

### PRODUCTION Environment
- ✅ Backend health check (critical)
- ✅ Database connectivity test
- 🔄 Auto rollback if any test fails

---

## 📊 Monitoring Deployment

### Check Pipeline Status

```bash
# Via GitHub UI
# Go to: https://github.com/Sang20225664/AI-Tutor/actions

# Via GitHub CLI
gh run list --workflow=ci.yml
gh run list --workflow=cd-prod.yml
```

### Check Kubernetes Status

```bash
# DEV environment
kubectl get pods -n ai-tutor-dev
kubectl logs -n ai-tutor-dev -l app=backend --tail=50

# STAGING environment
kubectl get pods -n ai-tutor-staging
kubectl describe pod -n ai-tutor-staging <pod-name>

# PRODUCTION environment
kubectl get pods -n ai-tutor-prod
kubectl get events -n ai-tutor-prod --sort-by='.lastTimestamp'
```

---

## 🔧 Troubleshooting

### CI Pipeline Failed

**Issue:** Tests failing
```bash
# Run tests locally first
cd ai_tutor_backend && npm test
cd ai_tutor_app && flutter test
```

**Issue:** Docker build timeout
```yaml
# Already fixed: Removed GitHub Actions Cache
# Builds now use local Docker daemon
```

**Issue:** Kubectl validation failed
```bash
# Validate locally
kubectl apply --dry-run=client -f k8s/prod/
```

### CD Deployment Failed

**Issue:** Image not found
```bash
# Check Docker Hub
docker pull sang5664/ai-tutor-backend:prod-<sha>

# Rebuild if needed
docker build -t sang5664/ai-tutor-backend:prod-<sha> ./ai_tutor_backend
docker push sang5664/ai-tutor-backend:prod-<sha>
```

**Issue:** Rollout timeout
```bash
# Check pod status
kubectl get pods -n ai-tutor-prod
kubectl describe pod -n ai-tutor-prod <pod-name>

# Check events
kubectl get events -n ai-tutor-prod --sort-by='.lastTimestamp'
```

**Issue:** Smoke test failed
```bash
# Check pod logs
kubectl logs -n ai-tutor-prod -l app=backend --tail=100

# Check service endpoint
kubectl exec -n ai-tutor-prod <pod-name> -- wget -q -O- http://localhost:3000/api/health
```

### Rollback Manually

```bash
# If auto-rollback failed or you need to rollback further
kubectl rollout undo deployment/backend -n ai-tutor-prod
kubectl rollout undo deployment/frontend -n ai-tutor-prod

# Rollback to specific revision
kubectl rollout history deployment/backend -n ai-tutor-prod
kubectl rollout undo deployment/backend --to-revision=<number> -n ai-tutor-prod
```

---

## 📈 Best Practices

### ✅ DO

- ✅ Always create feature branches from `dev`
- ✅ Write meaningful commit messages (follow conventional commits)
- ✅ Test in DEV before promoting to STAGING
- ✅ Run UAT in STAGING before going to PRODUCTION
- ✅ Use PR reviews for `staging → main` merges
- ✅ Monitor logs after each deployment
- ✅ Keep `dev`, `staging`, `main` branches up to date

### ❌ DON'T

- ❌ Push directly to `main` (use PRs)
- ❌ Skip STAGING environment
- ❌ Merge without CI passing
- ❌ Deploy to PRODUCTION on Fridays (unless hotfix)
- ❌ Ignore smoke test failures
- ❌ Commit secrets to Git (use GitHub Secrets)

---

## 🎯 Quick Commands

```bash
# Check current environment
kubectl config current-context

# Switch namespace
kubectl config set-context --current --namespace=ai-tutor-dev

# Watch deployments
watch kubectl get pods -n ai-tutor-prod

# Follow logs
kubectl logs -n ai-tutor-prod -l app=backend -f

# Port forward for testing
kubectl port-forward -n ai-tutor-dev svc/backend-service 3000:3000
```

---

## 📚 Related Documentation

- [Multi-Environment Guide](k8s/MULTI_ENV_GUIDE.md)
- [API Integration Guide](API_INTEGRATION_GUIDE.md)
- [Docker vs K8s Guide](DOCKER_VS_K8S_GUIDE.md)
- [CI/CD Guide](CICD_GUIDE.md)

---

## 🆘 Need Help?

1. Check GitHub Actions logs: `https://github.com/Sang20225664/AI-Tutor/actions`
2. Check Kubernetes events: `kubectl get events -n <namespace> --sort-by='.lastTimestamp'`
3. Review pod logs: `kubectl logs -n <namespace> <pod-name>`
4. Contact DevOps team if issues persist

---

**Last Updated:** January 13, 2026
**Maintainer:** DevOps Team
