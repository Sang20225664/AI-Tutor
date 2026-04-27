# AI Tutor

An intelligent tutoring application powered by AI that provides personalized learning experiences for students across various subjects.

## 🎯 Project Overview

AI Tutor is a comprehensive educational platform that combines the power of artificial intelligence with modern mobile and web technologies to deliver personalized tutoring experiences. The application helps students learn at their own pace with AI-generated content, interactive exercises, and real-time feedback.

## ✨ Features

- **AI-Powered Tutoring**: Intelligent content generation using Google Gemini AI
- **Personalized Learning**: Adaptive learning paths based on student performance
- **Multi-Subject Support**: Mathematics, Physics, Chemistry, English, and more
- **Interactive Chat**: Real-time AI tutor chat with conversation history, pinning, and sliding drawer
- **AI Quiz Generation**: Generate quizzes from lesson content using Gemini
- **Adaptive Quiz**: AI-generated quizzes targeting student weak topics
- **AI Flashcards**: Gemini-generated flashcards with 3D flip animation
- **AI Lesson Summary**: Automatic lesson summarization
- **AI Lesson Suggestions**: Personalized lesson recommendations based on learning analytics (persisted in DB)
- **Learning Dashboard**: Progress summary, quiz history, and weak topic analysis
- **Cross-Platform**: Available on mobile (Flutter) and web platforms
- **User Management**: Registration, login, and JWT-based authentication
- **Progress Tracking**: Grade selection, quiz scoring, and learning progress monitoring

## 🏗️ Project Structure

```
AI-Tutor/
├── ai_tutor_app/              # Flutter mobile/web frontend
├── ai_tutor_backend/          # API Gateway (Node.js/Express)
├── services/                  # Microservices
│   ├── auth/                  # User Management & JWT
│   ├── learning/              # Subjects, Lessons, Quizzes content
│   ├── assessment/            # Scoring & Progress tracking
│   └── ai-chat/               # Gemini AI & Chat History
├── shared/                    # Shared middleware & utils
├── k8s/                       # Kubernetes manifests
└── docker-compose.yml         # Dev environment configuration
```

## 🚀 Technologies Used

### Frontend (Mobile/Web)
- **Flutter** - Cross-platform development
- **Dart** - Programming language
- **HTTP** - API communication
- **Shared Preferences** - Local storage
- **Markdown Widget** - Rich content rendering

### Backend Architecture
- **API Gateway** - Central entry point (Express.js)
- **Microservices** - Auth, Learning, Assessment, AI Chat, AI Worker
- **MongoDB 7** - 4 isolated logical databases per service
- **Redis 7** - Caching (Flashcards, Summaries, Weak Topics) + Message Queue
- **BullMQ** - Background job processing for AI tasks
- **JWT** - Cross-service stateless authentication
- **Rate Limiting** - express-rate-limit (AI endpoints: 10 req/min/user)
- **Docker & Docker Compose** - Containerization (9 containers)
- **Kubernetes (AKS)** - Production-grade orchestration on Azure (namespace `prod`)

### AI & ML
- **Google Gemini API** - Chat, Quiz generation, Flashcards, Summaries, Lesson suggestions

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Flutter SDK** (>=3.0.0)
- **Dart SDK** (>=2.17.0)
- **Docker** (>=20.0.0)
- **Docker Compose** (>=2.0.0)
- **Node.js** (>=20.0.0, optional for local testing)
- **Git**


## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/AI-Tutor.git
cd AI-Tutor
```

### 2. Microservices Setup (Docker Compose)

The backend is fully dockerized with an API Gateway and 4 internal microservices.

```bash
cp ai_tutor_backend/.env.example ai_tutor_backend/.env
# Edit .env file with your GEMINI_API_KEY and JWT_SECRET
docker compose up -d --build
```

To verify the microservices are running:
```bash
docker compose ps
# Ensure all 9 containers are running:
# Mongo, Redis, Gateway, Auth, Learning, Assessment, AI Chat, AI Worker, Frontend
```


#### Option B: Kubernetes on Azure (AKS) via GitOps

The project runs on Azure Kubernetes Service (AKS), fully managed via ArgoCD + Helm.

```bash
# Get kubeconfig
az aks get-credentials --resource-group ai-tutor-dev-rg --name ai-tutor-dev-aks

# Apply ArgoCD Application (one-time setup after fresh cluster)
kubectl apply -f ai-tutor-infra/k8s/argocd-app.yaml

# ArgoCD auto-syncs charts/ai-tutor from main branch → deploys to namespace `prod`
# Access ArgoCD UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

See [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for full CI/CD pipeline documentation.

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
MONGO_URI=mongodb://mongodb.ai-tutor-dev.svc.cluster.local:27017/ai_tutor

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

### Docker Microservices
The backend uses Docker Compose with 9 containers:
- **API Gateway (Port 5000)**: Central proxy routing
- **Auth Service (Port 3001)**: Registration and Login
- **Learning Service (Port 3002)**: Curriculum content
- **Assessment Service (Port 3003)**: Quiz attempts and progress
- **AI Chat Service (Port 3004)**: Gemini integration
- **AI Worker**: Background BullMQ job processor (Quiz, Flashcard, Summary, Suggestions)
- **Frontend (Port 3000)**: Flutter Web served via Nginx
- **MongoDB 7**: Shared instance with 4 isolated logical databases
- **Redis 7**: Caching + BullMQ message queue

## 📱 Running the Application

### Development Mode
```bash
# Start all microservices in the background
docker compose up -d

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
kubectl get all -n ai-tutor-dev
kubectl get pvc -n ai-tutor-dev

# Delete backend pod to test auto-healing
kubectl delete pod -n ai-tutor-dev -l app=backend --force --grace-period=0

# Simulate MongoDB downtime
kubectl scale deployment mongodb -n ai-tutor-dev --replicas=0
# Check backend readiness, service endpoints
kubectl get pods -n ai-tutor-dev
kubectl get endpoints backend -n ai-tutor-dev

# Restore MongoDB
kubectl scale deployment mongodb -n ai-tutor-dev --replicas=1
```

### Frontend Tests
```bash
cd ai_tutor_app
flutter test
```


## 📚 API Architecture

The application implements a Strangler Fig pattern where the legacy backend acts as an API gateway, routing to distinct microservices:

- `POST /api/users/*` - Proxied to **Auth Service**
- `GET /api/subjects`, `GET /api/lessons/*` - Proxied to **Learning Service**
- `POST /api/quizzes/:id/submit`, `/api/progress/*`, `/api/weak-topics` - Proxied to **Assessment Service**
- `POST /api/gemini/chat`, `GET /api/chats`, `GET /api/chat-history` - Proxied to **AI Chat Service**
- `POST /api/generate-quiz`, `POST /api/adaptive-quiz` - Proxied to **AI Chat Service**
- `POST /api/generate-flashcards`, `POST /api/summarize` - Proxied to **AI Chat Service**
- `POST|GET /api/suggest-lessons` - Proxied to **AI Chat Service**

For detailed architectural diagrams, please refer to the [`MICROSERVICE_ARCHITECTURE.md`](MICROSERVICE_ARCHITECTURE.md) file.

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
- [x] Microservice architecture (Strangler Fig migration)
- [x] Kubernetes multi-environment deployment (dev/staging/prod)
- [x] AI Quiz generation from lesson content
- [x] Adaptive Quiz (targeting weak topics)
- [x] AI Flashcard generation
- [x] AI Lesson summary
- [x] AI Lesson suggestions (personalized, persisted)
- [x] Learning dashboard with progress analytics
- [x] Redis caching + BullMQ background jobs
- [x] Responsive Web layout
- [x] CI/CD pipeline (GitHub Actions → ACR → AKS, GitOps write-back)
- [x] Cloud deployment on Azure AKS (Phase 5 complete)
- [x] GitOps with ArgoCD (auto-sync, self-healing)
- [x] Canary deployment with Argo Rollouts (20% → 50% → 100%)
- [x] KEDA autoscaling — Scale-to-Zero for AI Worker (Redis queue trigger)
- [ ] Service Mesh (Linkerd — mTLS)
- [ ] Voice interaction support
- [ ] Gamification features
- [ ] Multi-language support



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
kubectl get pods -n ai-tutor-dev

# Restart services
docker compose down && docker compose up
# or
kubectl rollout restart deployment/backend -n ai-tutor-dev
```

**Flutter Build Issues**
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

---

