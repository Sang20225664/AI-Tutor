# 🚀 CI/CD Pipeline Documentation

## 📋 Tổng quan

Dự án AI-Tutor sử dụng GitHub Actions để tự động hóa quy trình CI/CD, triển khai trực tiếp lên K3s cluster on-premise.

### Workflow Files

| Workflow | Trigger | Mục đích |
|----------|---------|----------|
| `ci.yml` | Push/PR to main | Build & Test |
| `cd-dev.yml` | Push to `dev` branch | Deploy to DEV |
| `cd-staging.yml` | Push to `staging` branch | Deploy to STAGING |
| `cd-prod.yml` | Push to `main` + Release | Deploy to PRODUCTION |

---

## 🔐 Cấu hình GitHub Secrets

### Bước 1: Truy cập Settings

1. Vào GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Bước 2: Tạo các Secrets

#### Docker Hub Credentials

| Secret Name | Value | Mô tả |
|-------------|-------|-------|
| `DOCKERHUB_USERNAME` | `sang5664` | Docker Hub username |
| `DOCKERHUB_TOKEN` | `dckr_pat_xxxxx` | Docker Hub Access Token |

**Cách tạo Docker Hub Access Token:**
1. Đăng nhập https://hub.docker.com
2. Vào **Account Settings** → **Security** → **Access Tokens**
3. Click **New Access Token**
4. Đặt tên: `github-actions`
5. Permission: `Read & Write`
6. Copy token và lưu vào GitHub Secret

#### K3s Server Credentials

| Secret Name | Value | Mô tả |
|-------------|-------|-------|
| `K3S_HOST` | `192.168.1.9` | IP của K3s server (kiểm tra bằng `hostname -I`) |
| `K3S_USER` | `tansang` | Username để SSH vào server |
| `K3S_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | SSH Private Key |

**Cách tạo SSH Key:**

```bash
# Trên máy local
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key -N ""

# Copy public key lên K3s server
ssh-copy-id -i ~/.ssh/github_actions_key.pub tansang@192.168.1.9

# Lấy private key để paste vào GitHub Secret
cat ~/.ssh/github_actions_key
```

⚠️ **Quan trọng:** Copy toàn bộ nội dung private key, bao gồm cả dòng `-----BEGIN...` và `-----END...`

---

## 🌳 Git Branch Strategy

```
main (production)
  │
  ├── staging
  │     │
  │     └── dev
  │           │
  │           ├── feature/xxx
  │           └── fix/xxx
```

### Quy trình làm việc

1. **Development**
   - Tạo branch từ `dev`: `feature/new-feature` hoặc `fix/bug-fix`
   - Tạo PR vào `dev`
   - Merge → Auto deploy to DEV

2. **Staging**
   - Khi DEV ổn định, merge `dev` → `staging`
   - Auto deploy to STAGING (có thể cần approval)

3. **Production**
   - Khi STAGING ổn định, merge `staging` → `main`
   - Hoặc tạo Release tag
   - Auto deploy to PRODUCTION (REQUIRE manual approval)

---

## 🔄 Image Tagging Strategy

| Environment | Image Tag Format | Ví dụ |
|-------------|-----------------|-------|
| DEV | `dev-<sha>` | `dev-abc1234` |
| STAGING | `staging-<sha>` | `staging-abc1234` |
| PROD | `prod-<sha>`, `v1.0.0` | `prod-abc1234`, `v1.2.3` |

---

## 🛡️ Environment Protection Rules

### Cấu hình cho STAGING và PRODUCTION

1. Vào **Settings** → **Environments**
2. Click **New environment**
3. Đặt tên: `staging` hoặc `production`
4. Enable **Required reviewers**
5. Thêm reviewers (người có quyền approve deployment)

**Cho Production:**
- ✅ Required reviewers: 1-2 người
- ✅ Wait timer: 5 phút (optional)
- ✅ Deployment branches: Only `main`

---

## 📊 Monitoring Deployments

### Kiểm tra trạng thái

```bash
# SSH vào K3s server
ssh tansang@192.168.1.9

# Kiểm tra pods
kubectl get pods -n ai-tutor-dev
kubectl get pods -n ai-tutor-staging
kubectl get pods -n ai-tutor-prod

# Xem logs
kubectl logs -f deployment/backend -n ai-tutor-dev

# Kiểm tra rollout history
kubectl rollout history deployment/backend -n ai-tutor-dev
```

### Rollback nếu cần

```bash
# Rollback về version trước
kubectl rollout undo deployment/backend -n ai-tutor-dev

# Rollback về version cụ thể
kubectl rollout undo deployment/backend -n ai-tutor-dev --to-revision=2
```

---

## 🐛 Troubleshooting

### Pipeline failed at SSH step

1. Kiểm tra K3S_HOST có đúng IP không:
   ```bash
   hostname -I  # Trên K3s server
   ```

2. Kiểm tra SSH key:
   ```bash
   ssh -i ~/.ssh/github_actions_key tansang@192.168.1.9
   ```

3. Kiểm tra firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 22/tcp
   ```

### Image pull failed

1. Kiểm tra Docker Hub credentials:
   ```bash
   docker login -u sang5664
   ```

2. Kiểm tra image tồn tại:
   ```bash
   docker pull sang5664/ai-tutor-backend:dev-latest
   ```

### Pod CrashLoopBackOff

1. Xem logs:
   ```bash
   kubectl logs deployment/backend -n ai-tutor-dev --previous
   ```

2. Kiểm tra events:
   ```bash
   kubectl describe pod -l app=backend -n ai-tutor-dev
   ```

---

## 📁 File Structure

```
.github/
└── workflows/
    ├── ci.yml           # CI: Build & Test on PR
    ├── cd-dev.yml       # CD: Deploy to DEV
    ├── cd-staging.yml   # CD: Deploy to STAGING
    └── cd-prod.yml      # CD: Deploy to PRODUCTION

k8s/
├── dev/                 # DEV environment manifests
├── staging/             # STAGING environment manifests
├── prod/                # PRODUCTION environment manifests
└── scripts/
    ├── deploy-dev.sh
    ├── deploy-staging.sh
    └── deploy-prod.sh
```

---

## ✅ Checklist trước khi sử dụng

- [ ] Tạo GitHub Secret: `DOCKERHUB_USERNAME`
- [ ] Tạo GitHub Secret: `DOCKERHUB_TOKEN`
- [ ] Tạo GitHub Secret: `K3S_HOST`
- [ ] Tạo GitHub Secret: `K3S_USER`
- [ ] Tạo GitHub Secret: `K3S_SSH_KEY`
- [ ] Tạo Environment: `staging` (với required reviewers)
- [ ] Tạo Environment: `production` (với required reviewers)
- [ ] Tạo branches: `dev`, `staging` từ `main`
- [ ] Test SSH từ GitHub Actions runner (nếu có self-hosted runner)
