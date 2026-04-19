# 🚀 AI-Tutor Deployment & CI/CD Guide

Dự án AI-Tutor sử dụng **Git Flow** với **GitHub Actions** để tự động hóa quy trình CI/CD, triển khai ứng dụng lên Kubernetes (AKS) và lưu trữ image trên Azure Container Registry (ACR).

---

## 🌳 Branching Strategy & Environments

Dự án quản lý 2 luồng môi trường chính tương ứng với 2 branch: `dev` và `main`.

| Môi trường | Nhánh | Mục đích | Tự động Deploy | Yêu cầu Duyệt duyệt duyệt |
|------------|-------|----------|----------------|---------------------------|
| **DEV** | `dev` | Môi trường test nội bộ cho lập trình viên. | ✅ Có (Push CD) | ❌ Không |
| **PROD** | `main` | Môi trường thực tế cho người dùng (Production). | ✅ Có (Push CD) | ⚠️ Nên có (GitHub Environments) |

### 1. Quy trình làm việc (Development)
1. Tách nhánh feature từ `dev` (Ex: `feature/new-login`)
2. Dev và test local, push code lên.
3. Tạo Pull Request (PR) merge vào `dev`.
4. Sau khi merge vào `dev`, pipeline sẽ trigger, build image và tự deploy lên namespace `dev` trên AKS.

### 2. Quy trình Release (Production)
1. Khi code trên `dev` đã ổn định, tạo Pull Request merge từ `dev` sang `main`.
2. Sau khi merge vào `main`, pipeline trigger build image cho Production, push lên ACR.
3. Triển khai tự động vào namespace `prod` trên AKS (sẽ tạm dừng nếu có cấu hình GitHub Environment Required Reviewers).

---

## 🔄 CI/CD Pipeline Workflow

Tất cả các luồng CI/CD được đóng gói gọn gàng trong 1 file duy nhất: `.github/workflows/ci-cd.yml`.

### Các luồng xử lý chính trong Pipeline:
1. **Azure & ACR Login (OIDC):** Authenticate với Azure bằng OpenID Connect.
2. **Build Backend:** Build Docker image Backend với `tags: ref` & `sha` -> Push lên ACR.
3. **Build Frontend:** Cùng lúc build Frontend Docker image -> Push lên ACR.
4. **Deploy DEV:** (Chỉ chạy khi push vào `dev`). Update các Kubernetes Deployments trong namespace `dev` bằng lệnh `kubectl set image`.
5. **Deploy PROD:** (Chỉ chạy khi push vào `main`). Tương tự, update hình ảnh ở namespace `prod`.

---

## 🔐 GitHub Secrets

Để pipeline hoạt động, cần cấu hình các secrets sau trong **Settings → Secrets and variables → Actions** của repository:

| Secret Name | Vai trò |
|-------------|---------|
| `ACR_LOGIN_SERVER` | Server URI của Azure Container Registry (vd: `aitutortansangdevacr.azurecr.io`) |
| `AZURE_CLIENT_ID` | Client ID cho OIDC Login |
| `AZURE_TENANT_ID` | Tenant ID của Azure AD |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID chứa Kubernetes/AKS |
| `MONGO_URI` | Chuỗi kết nối MongoDB (vd: `mongodb://.../ai_tutor`) |
| `JWT_SECRET` | Khóa bí mật dùng để mã hóa JWT tokens |
| `GEMINI_API_KEY` | API Key của Google Gemini dùng cho AI Assistant |

*(Lưu ý: Secrets thực tế (MONGO_URI, JWT_SECRET, GEMINI_API_KEY) được quản lý bởi **Azure Key Vault CSI Driver** — mount trực tiếp vào pod, không lưu trong K8s Secrets hay GitHub Secrets. Chỉ cần cấu hình AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID và ACR_LOGIN_SERVER trong GitHub Secrets cho OIDC authentication.)*

---

## ⚙️ Deployment Strategy & Health Checks

Tất cả services dùng **RollingUpdate** strategy với `maxSurge: 1, maxUnavailable: 0` — đảm bảo zero-downtime deploy.

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

Mỗi service có `readinessProbe` và `livenessProbe` trỏ vào `/health` endpoint (kiểm tra kết nối MongoDB):

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: <service_port>
  initialDelaySeconds: 10
  periodSeconds: 5
livenessProbe:
  httpGet:
    path: /health
    port: <service_port>
  initialDelaySeconds: 30
  periodSeconds: 10
```

> **Experiment đo thực tế (19/04/2026):** RollingUpdate = 0/67 request fail. Recreate = 15/45 request fail, downtime ~14 giây.

---

---

## 📊 Monitoring & Observability

### Kubernetes Pods (AKS)

```bash
# Lấy credentials vào local máy tính
az aks get-credentials --resource-group ai-tutor-dev-rg --name ai-tutor-dev-aks --overwrite-existing

# Xem các Pods ở môi trường DEV
kubectl get pods -n dev

# Xem các Pods chạy ở PROD
kubectl get pods -n prod

# Xem log liên tục của backend trong PROD
kubectl logs -n prod -l app=backend -f

# Xem trạng thái services và cổng IP
kubectl get svc -n prod
```

### Grafana Dashboard

Truy cập tại: **`https://ai-tutot-ts.duckdns.org/grafana/`**
- Login: `admin` / `admin123`
- Prometheus đã scrape metrics từ toàn bộ AKS cluster (kube-state-metrics, node-exporter)
- Data source Prometheus: `http://kube-prometheus-stack-prometheus:9090`

```bash
# Kiểm tra Prometheus & Grafana pods
kubectl get pods -n monitoring

# Port-forward Prometheus (nếu cần debug trực tiếp)
kubectl port-forward -n monitoring svc/kube-prometheus-stack-prometheus 9090:9090
```

---

## 🛠️ Troubleshooting (Khắc phục lỗi)

### 1. Pod bị lỗi ErrImagePull / ImagePullBackOff
- Chắc chắn rằng pipeline đã build và push ảnh thành công qua ACR.
- AKS cần có quyền kéo file từ ACR (`az aks update -n <cluster> -g <rg> --attach-acr <acr-name>`)

### 2. Pod bị lỗi CrashLoopBackOff 
- Inspect lỗi crash thông qua logs:
  ```bash
  kubectl logs -n prod <tên-pod-bị-lỗi> --previous
  ```
- Hoặc check event để xem nguyên nhân (VD: thiếu biến môi trường, crash code):
  ```bash
  kubectl describe pod -n prod <tên-pod-bị-lỗi>
  ```

### 3. Cần Rollback ứng dụng khẩn cấp
- K8s lưu lại lịch sử rollout, nếu sau khi merge `main` xảy ra lỗi, bạn có thể thực hiện quay về bản trước đó:
  ```bash
  # Undo cho backend
  kubectl rollout undo deployment/backend -n prod
  
  # Undo frontend
  kubectl rollout undo deployment/frontend -n prod
  ```
