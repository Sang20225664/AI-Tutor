# AI Tutor

An intelligent tutoring application powered by AI that provides personalized learning experiences for students across various subjects.

## 🎯 Project Overview

AI Tutor is a comprehensive educational platform that combines the power of artificial intelligence with modern mobile and web technologies to deliver personalized tutoring experiences. The application helps students learn at their own pace with AI-generated content, interactive exercises, and real-time feedback.

## ✨ Features

- **AI-Powered Tutoring**: Intelligent content generation using Google Gemini AI
- **Personalized Learning**: Adaptive learning paths based on student performance
- **Multi-Subject Support**: Mathematics, Science, Literature, History, and more
- **Interactive Chat**: Real-time AI tutor chat interface for instant help
- **Cross-Platform**: Available on mobile (Flutter) and web platforms
- **User Management**: Registration, login, and guest mode support
- **Progress Tracking**: Grade selection and learning progress monitoring

## 🏗️ Project Structure

```
AI-Tutor/
├── ai_tutor_app/              # Flutter mobile/web application
│   ├── lib/
│   ├── web/
│   └── ...
├── ai_tutor_backend/          # Node.js/Express backend API
│   ├── src/
│   └── ...
├── k8s/                       # Kubernetes manifests
│   ├── namespace/             # Namespace YAML
│   ├── mongodb/               # MongoDB PVC, Deployment, Service
│   ├── backend/               # Backend ConfigMap, Secret, Deployment, Service
│   └── DEBUG_GUIDE.md         # K8s debug & troubleshooting guide
└── README.md
```

## 🚀 Technologies Used

### Frontend (Mobile/Web)
- **Flutter** - Cross-platform development
- **Dart** - Programming language
- **HTTP** - API communication
- **Shared Preferences** - Local storage


### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Dockerized & Kubernetes)
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Docker** - Containerization
- **Kubernetes (K3s)** - Production-grade orchestration

### AI & ML
- **Google Gemini API** - Natural language processing and content generation

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Flutter SDK** (>=3.0.0)
- **Dart SDK** (>=2.17.0)
- **Docker** (>=20.0.0)
- **Docker Compose** (>=2.0.0)
- **Git**


## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/AI-Tutor.git
cd AI-Tutor
```

### 2. Backend Setup (Docker or Kubernetes)

#### Option A: Docker Compose (for local dev)
```bash
cd ai_tutor_backend
cp .env.example .env
# Edit .env file with your Gemini API key
docker compose up --build
```


#### Option B: Kubernetes (K3s)
1. Install K3s (single node):
  ```bash
  curl -sfL https://get.k3s.io | sh -
  export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
  ```
2. Create namespace:
  ```bash
  kubectl apply -f k8s/namespace/namespace.yaml
  ```
3. Deploy MongoDB:
  ```bash
  kubectl apply -f k8s/mongodb/
  # Check PVC, pod, service
  kubectl get pvc,pod,svc -n ai-dev
  ```
4. Deploy Backend:
  ```bash
  kubectl apply -f k8s/backend/
  # Check rollout, pod, service
  kubectl get deployment,pod,svc -n ai-dev
  ```
5. Testing:
  ```bash
  # Port-forward to test API
  kubectl port-forward -n ai-dev service/backend 8080:5000
  curl http://localhost:8080/api/ping
  curl http://localhost:8080/api/ready
  ```

### 3. Frontend Setup
```bash
cd ai_tutor_app
flutter pub get
flutter run -d chrome    # For web
flutter run              # For mobile
```

### 4. Environment Variables


Backend `.env` (Docker) or ConfigMap/Secret (K8s):

```env
# Server
PORT=5000
NODE_ENV=production

# Database (K8s)
MONGO_URI=mongodb://mongodb.ai-dev.svc.cluster.local:27017/ai_tutor

# JWT Auth
JWT_SECRET=your-super-secret-jwt-key

# AI API
GEMINI_API_KEY=your-gemini-api-key
```

## 🔧 Configuration

### Gemini API Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env` file as `GEMINI_API_KEY`

### Docker Services
The backend uses Docker Compose with:
- **Backend Service**: Node.js Express server
- **MongoDB Service**: Database with persistent storage
- **Networking**: Isolated Docker network for services

## 📱 Running the Application

### Development Mode
```bash
# Start backend services (MongoDB + API)
cd ai_tutor_backend
docker compose up

# Start Flutter app in another terminal
cd ai_tutor_app
flutter run -d chrome    # For web development
```

### Production Build
```bash
# Build Flutter app
cd ai_tutor_app
flutter build web        # For web
flutter build apk        # For Android

# Backend is already containerized for production
```


## 🧪 Testing & Kubernetes Operations


### Backend Health Check (K8s)
```bash
# Test API endpoints (after port-forward)
curl http://localhost:8080/api/ping
curl http://localhost:8080/api/ready
```

### Advanced Testing (Kubernetes)
```bash
# List pods, PVC, service
kubectl get all -n ai-dev
kubectl get pvc -n ai-dev

# Delete backend pod to test auto-healing
kubectl delete pod -n ai-dev -l app=backend --force --grace-period=0

# Simulate MongoDB downtime
kubectl scale deployment mongodb -n ai-dev --replicas=0
# Check backend readiness, service endpoints
kubectl get pods -n ai-dev
kubectl get endpoints backend -n ai-dev

# Restore MongoDB
kubectl scale deployment mongodb -n ai-dev --replicas=1
```

### Frontend Tests
```bash
cd ai_tutor_app
flutter test
```


## 📚 API Documentation

The backend API provides the following endpoints:

- `GET /api/ping` - Health check (liveness)
- `GET /api/ready` - Readiness probe (DB connection)
- `POST /api/users/login` - User authentication
- `POST /api/users/register` - User registration
- `POST /api/gemini/chat` - AI chat interaction
- `GET /api/subjects` - List all subjects
- `GET /admin` - Admin panel (dev only)

## 🐳 Docker Commands

### Useful Docker Commands
```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f backend

# Stop services
docker compose down

# Rebuild and start
docker compose up --build

# Access MongoDB directly
docker exec -it mongo_ai_tutor mongosh
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 👥 Author
Nguyen Duc Tan Sang

## 📞 Support

For support and questions:
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/AI-Tutor/issues)
- 📧 Email: sanga4k48@gmail.com

## 🗺️ Roadmap

- [x] Basic AI chat functionality
- [x] User authentication system
- [x] Docker containerization
- [x] MongoDB integration
- [ ] Advanced learning analytics
- [ ] Voice interaction support
- [ ] Offline mode capability
- [ ] Parent/teacher dashboard
- [ ] Gamification features
- [ ] Multi-language support
- [ ] Mobile app optimization



## 🚨 Troubleshooting & Debugging

- See [`k8s/DEBUG_GUIDE.md`](k8s/DEBUG_GUIDE.md) for Kubernetes debug commands, how to fix CrashLoopBackOff, ImagePullBackOff, PVC Pending, health check, auto-healing, log volume, and more.

### Common Issues

**CORS Errors (Web)**
- Backend is configured for web development
- Ensure Docker containers or K8s pods are running
- Check browser console for specific errors

**Backend Connection Failed**
```bash
# Check if services are running
docker ps
# or
kubectl get pods -n ai-dev

# Restart services
docker compose down && docker compose up
# or
kubectl rollout restart deployment/backend -n ai-dev
```

**Flutter Build Issues**
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

---

