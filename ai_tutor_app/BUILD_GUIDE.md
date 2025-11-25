# Flutter Web Deployment Guide

## Build & Dockerize Flutter Web

### 1. Build Flutter Web
Build the Flutter Web application in release mode:
```bash
cd ai_tutor_app
flutter build web --release
```

**Output**: The build artifacts will be in `build/web/` directory.

---

### 2. Docker Image Structure

The `Dockerfile` uses a multi-stage build:

**Stage 1: Build Flutter Web**
- Base image: `ghcr.io/cirruslabs/flutter:latest`
- Installs dependencies and builds Flutter Web

**Stage 2: Serve with Nginx**
- Base image: `nginx:alpine`
- Removes default Nginx config
- Copies custom `nginx.conf` to `/etc/nginx/conf.d/default.conf`
- Copies Flutter build output to `/usr/share/nginx/html`
- Exposes port 80
- Includes health check on `/health` endpoint

---

### 3. Build Docker Image

Build the Docker image:
```bash
cd ai_tutor_app
docker build -t sang5664/ai-tutor-frontend:latest .
```

**Options:**
- Use `--no-cache` to force rebuild: `docker build --no-cache -t sang5664/ai-tutor-frontend:latest .`
- Tag with version: `docker build -t sang5664/ai-tutor-frontend:v1.0.0 .`

---

### 4. Push Docker Image

Push the image to Docker Hub:
```bash
docker push sang5664/ai-tutor-frontend:latest
```

**Note:** Ensure you're logged in to Docker Hub:
```bash
docker login
```

---

### 5. Nginx Configuration

The `nginx.conf` includes:
- Serves Flutter Web static files from `/usr/share/nginx/html`
- SPA routing: `try_files $uri $uri/ /index.html`
- Reverse proxy `/api/*` to `http://backend.ai-dev.svc.cluster.local:5000`
- Cache static assets (JS, CSS, images) for 1 year
- Gzip compression for text files
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Health check endpoint at `/health`

---

### 6. Test Locally (Optional)

Test the Docker image locally before pushing:
```bash
docker run -d -p 8080:80 --name frontend-test sang5664/ai-tutor-frontend:latest
curl http://localhost:8080/health
docker stop frontend-test && docker rm frontend-test
```

---

### 7. Quick Build & Push Script

Create a script `build-and-push.sh`:
```bash
#!/bin/bash
set -e

echo "Building Flutter Web..."
flutter build web --release

echo "Building Docker image..."
docker build -t sang5664/ai-tutor-frontend:latest .

echo "Pushing to Docker Hub..."
docker push sang5664/ai-tutor-frontend:latest

echo "Done! Image: sang5664/ai-tutor-frontend:latest"
```

Make it executable:
```bash
chmod +x build-and-push.sh
./build-and-push.sh
```

---

## Dockerfile Best Practices

✅ **Multi-stage build**: Reduces final image size (only includes Nginx + static files)  
✅ **Alpine base**: Lightweight image (~10MB for Nginx Alpine)  
✅ **Health check**: Kubernetes can monitor container health  
✅ **No unnecessary tools**: Minimal attack surface  
✅ **Optimized caching**: Layer ordering for faster rebuilds  

---

## Next Steps

After building and pushing the image:
1. Create Kubernetes Deployment manifest (`k8s/frontend/frontend-deployment.yaml`)
2. Create Kubernetes Service manifest (`k8s/frontend/frontend-service.yaml`)
3. Configure Ingress for routing (`k8s/frontend/ingress.yaml`)
4. Deploy to Kubernetes cluster
