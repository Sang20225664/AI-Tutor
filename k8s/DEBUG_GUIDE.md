# Kubernetes Debugging Guide - AI Tutor Project

## 1. CrashLoopBackOff

**Nguyên nhân:**
- Container start nhưng crash ngay sau đó
- Health check (liveness probe) fail liên tục
- Application code có lỗi runtime
- Thiếu biến môi trường hoặc config sai

**Cách debug:**

```bash
# Xem logs của pod crash
kubectl logs -n ai-dev <pod-name> --previous

# Xem describe để thấy restart count
kubectl describe pod -n ai-dev <pod-name>

# Xem events
kubectl get events -n ai-dev --sort-by='.lastTimestamp' | grep <pod-name>

# Kiểm tra liveness probe có đúng không
kubectl get pod -n ai-dev <pod-name> -o yaml | grep -A 10 livenessProbe
```

**Giải pháp:**
- Fix application code nếu có lỗi
- Kiểm tra biến môi trường trong ConfigMap/Secret
- Tăng `initialDelaySeconds` trong liveness probe nếu app cần thời gian khởi động
- Kiểm tra health endpoint trả về đúng status code

**Ví dụ fix:**
```yaml
livenessProbe:
  httpGet:
    path: /api/ping
    port: 5000
  initialDelaySeconds: 30  # Tăng từ 15s lên 30s
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

---

## 2. ImagePullBackOff

**Nguyên nhân:**
- Image không tồn tại trên registry
- Tên image hoặc tag sai
- Registry yêu cầu authentication nhưng không có imagePullSecret
- Network không thể reach registry

**Cách debug:**

```bash
# Xem lý do pull fail
kubectl describe pod -n ai-dev <pod-name> | grep -A 5 "Events:"

# Kiểm tra image name trong deployment
kubectl get deployment -n ai-dev backend -o yaml | grep image:

# Test pull image thủ công trên node
sudo k3s crictl pull sang5664/ai-tutor-backend:latest
```

**Giải pháp:**

1. **Sửa tên image:**
```bash
kubectl set image deployment/backend -n ai-dev backend=sang5664/ai-tutor-backend:v1.0.0
```

2. **Tạo imagePullSecret nếu registry private:**
```bash
kubectl create secret docker-registry regcred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=<username> \
  --docker-password=<password> \
  --docker-email=<email> \
  -n ai-dev

# Thêm vào deployment
kubectl patch deployment backend -n ai-dev -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"regcred"}]}}}}'
```

3. **Build và push lại image:**
```bash
cd ai_tutor_backend
docker build -t sang5664/ai-tutor-backend:latest .
docker push sang5664/ai-tutor-backend:latest
```

---

## 3. PVC Pending

**Nguyên nhân:**
- StorageClass không tồn tại hoặc không khả dụng
- Không có provisioner để tạo volume
- Node không đủ disk space
- PV (manual provisioning) không match với PVC request

**Cách debug:**

```bash
# Kiểm tra trạng thái PVC
kubectl get pvc -n ai-dev

# Xem chi tiết PVC
kubectl describe pvc -n ai-dev mongodb-pvc

# Kiểm tra StorageClass
kubectl get storageclass

# Kiểm tra provisioner pod
kubectl get pods -n kube-system | grep local-path

# Kiểm tra disk space trên node
df -h | grep rancher
```

**Giải pháp:**

1. **Kiểm tra StorageClass tồn tại:**
```bash
kubectl get sc
# Nếu không có local-path, cài đặt:
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml
```

2. **Giảm size request nếu disk đầy:**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: ai-dev
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 3Gi  # Giảm từ 5Gi xuống 3Gi
  storageClassName: local-path
```

3. **Xóa PVC cũ và tạo lại:**
```bash
kubectl delete pvc mongodb-pvc -n ai-dev
kubectl apply -f k8s/mongodb/mongodb-pvc.yaml

# Verify binding
kubectl get pvc -n ai-dev -w
```

4. **Dọn dẹp disk space:**
```bash
# Remove unused images
sudo k3s crictl rmi --prune

# Clean journal logs
sudo journalctl --vacuum-time=1d

# Remove evicted pods
kubectl delete pod --field-selector=status.phase=Failed -n ai-dev
```

---

## 4. Các lệnh debug phổ biến

### Kiểm tra tổng quan

```bash
# Xem tất cả resources trong namespace
kubectl get all -n ai-dev

# Xem pods với thông tin chi tiết
kubectl get pods -n ai-dev -o wide

# Xem tất cả events
kubectl get events -n ai-dev --sort-by='.lastTimestamp'

# Xem resource usage
kubectl top nodes
kubectl top pods -n ai-dev
```

### Debug pod cụ thể

```bash
# Xem logs real-time
kubectl logs -f -n ai-dev <pod-name>

# Xem logs của container trước đó (khi restart)
kubectl logs -n ai-dev <pod-name> --previous

# Xem logs tất cả pods của deployment
kubectl logs -n ai-dev -l app=backend --tail=50

# Exec vào pod để debug
kubectl exec -it -n ai-dev <pod-name> -- /bin/sh

# Port-forward để test local
kubectl port-forward -n ai-dev service/backend 8080:5000
```

### Debug networking

```bash
# Test DNS resolution từ trong pod
kubectl run -it --rm debug --image=busybox --restart=Never -n ai-dev -- nslookup mongodb.ai-dev.svc.cluster.local

# Test connectivity
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n ai-dev -- curl -v http://backend.ai-dev.svc.cluster.local:5000/api/ping

# Xem service endpoints
kubectl get endpoints -n ai-dev

# Describe service để xem selector
kubectl describe service backend -n ai-dev
```

### Debug configuration

```bash
# Xem ConfigMap
kubectl get configmap backend-config -n ai-dev -o yaml

# Xem Secret (decoded)
kubectl get secret backend-secret -n ai-dev -o jsonpath='{.data.JWT_SECRET}' | base64 -d

# Xem biến môi trường trong pod
kubectl exec -n ai-dev <pod-name> -- env | grep MONGO

# Verify probes configuration
kubectl get deployment backend -n ai-dev -o yaml | grep -A 15 "Probe"
```

---

## 5. Health Check Best Practices

### Readiness Probe
- Kiểm tra service có sẵn sàng nhận traffic chưa
- Nếu fail, pod bị remove khỏi Service endpoints
- Không restart pod

```yaml
readinessProbe:
  httpGet:
    path: /api/ready
    port: 5000
  initialDelaySeconds: 10  # Chờ app khởi động
  periodSeconds: 5         # Check mỗi 5s
  timeoutSeconds: 3        # Timeout sau 3s
  failureThreshold: 3      # Fail 3 lần mới mark NotReady
```

### Liveness Probe
- Kiểm tra container còn sống không
- Nếu fail, Kubernetes restart container
- Cần cẩn thận vì có thể gây CrashLoopBackOff

```yaml
livenessProbe:
  httpGet:
    path: /api/ping
    port: 5000
  initialDelaySeconds: 30  # Delay lâu hơn readiness
  periodSeconds: 10        # Check ít thường xuyên hơn
  timeoutSeconds: 5
  failureThreshold: 3
```

**Lưu ý:**
- `initialDelaySeconds` của liveness nên lớn hơn readiness
- `periodSeconds` của liveness nên lớn hơn readiness
- Health endpoint phải light-weight, không query database quá nhiều
- Readiness có thể check database connection, liveness chỉ check app alive

---

## 6. Monitoring Commands

```bash
# Watch pod status real-time
kubectl get pods -n ai-dev -w

# Watch rollout status
kubectl rollout status deployment/backend -n ai-dev

# Rollback nếu deploy fail
kubectl rollout undo deployment/backend -n ai-dev

# Scale replicas
kubectl scale deployment backend -n ai-dev --replicas=3

# View deployment history
kubectl rollout history deployment/backend -n ai-dev

# Restart deployment (recreate pods)
kubectl rollout restart deployment/backend -n ai-dev
```

---

## 7. Cleanup Commands

```bash
# Delete all resources in namespace
kubectl delete all --all -n ai-dev

# Keep namespace, delete specific resources
kubectl delete deployment,service,configmap,secret --all -n ai-dev

# Delete namespace (cascade delete all resources)
kubectl delete namespace ai-dev

# Force delete stuck pod
kubectl delete pod <pod-name> -n ai-dev --force --grace-period=0

# Clean evicted pods
kubectl delete pod --field-selector=status.phase=Failed --all-namespaces
```

---

## 8. Troubleshooting Checklist

### Backend không start
- [ ] ConfigMap có đầy đủ biến môi trường?
- [ ] Secret có JWT_SECRET và GEMINI_API_KEY?
- [ ] MONGO_URI đúng format? `mongodb://mongodb.ai-dev.svc.cluster.local:27017/ai_tutor`
- [ ] MongoDB pod đang Running?
- [ ] Xem logs: `kubectl logs -n ai-dev -l app=backend`

### MongoDB không connect
- [ ] MongoDB Service đã được tạo?
- [ ] Service selector match với Pod labels?
- [ ] PVC đã Bound?
- [ ] Pod có mount được volume?
- [ ] Test DNS: `nslookup mongodb.ai-dev.svc.cluster.local`

### Health probe fail
- [ ] Endpoint `/api/ready` và `/api/ping` có return 200?
- [ ] `initialDelaySeconds` đủ để app khởi động?
- [ ] `timeoutSeconds` đủ lớn cho slow response?
- [ ] Test thủ công: `curl http://<pod-ip>:5000/api/ping`

### Resource issues
- [ ] Node có đủ CPU/Memory?
- [ ] Disk space > 15% free (tránh DiskPressure)?
- [ ] Resource limits không quá thấp?
- [ ] Check: `kubectl describe node`

---

**Tài liệu tham khảo:**
- https://kubernetes.io/docs/tasks/debug/
- https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
- https://docs.k3s.io/storage
