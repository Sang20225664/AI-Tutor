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
│   │   ├── screens/           # UI screens
│   │   ├── services/          # API and business logic
│   │   ├── widgets/           # Reusable UI components
│   │   └── utils/             # Utility functions
│   ├── android/
│   ├── web/
│   └── pubspec.yaml
├── ai_tutor_backend/          # Node.js/Express backend API
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database models
│   │   ├── routes/            # API endpoints
│   │   └── server.js          # Main server file
│   ├── docker-compose.yml     # Docker configuration
│   ├── Dockerfile
│   ├── .env                   # Environment variables
│   └── package.json
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
- **MongoDB** - Database (Dockerized)
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Docker** - Containerization

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

### 2. Backend Setup with Docker
```bash
cd ai_tutor_backend

# Copy and configure environment variables
cp .env.example .env
# Edit .env file with your Gemini API key

# Start the backend with Docker
docker compose up --build
```

### 3. Frontend Setup
```bash
cd ai_tutor_app
flutter pub get
flutter run -d chrome    # For web
flutter run              # For mobile
```

### 4. Environment Variables

Backend `.env` configuration:

```env
# Server
PORT=5000
NODE_ENV=development
HOST=0.0.0.0

# Database (Docker)
MONGO_URI=mongodb://mongo:27017/ai_tutor

# JWT Auth
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# AI API
GEMINI_API_KEY=your-gemini-api-key

# Logging
LOG_LEVEL=info
MONGODB_LOG_LEVEL=error
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

## 🧪 Testing

### Backend Health Check
```bash
# Test API endpoints
curl http://localhost:5000/api/ping
curl -X POST http://localhost:5000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### Frontend Tests
```bash
cd ai_tutor_app
flutter test
```

## 📚 API Documentation

The backend API provides the following endpoints:

- `GET /api/ping` - Health check
- `POST /api/users/login` - User authentication
- `POST /api/users/register` - User registration
- `POST /api/gemini/chat` - AI chat interaction
- `GET /api/users` - User management (dev only)
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

## 👥 Team

- **Project Lead**: Nguyễn Đức Tấn Sang
- **Full Stack Developer**: Nguyễn Đức Tấn Sang

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

## 🚨 Troubleshooting

### Common Issues

**CORS Errors (Web)**
- Backend is configured for web development
- Ensure Docker containers are running
- Check browser console for specific errors

**Backend Connection Failed**
```bash
# Check if services are running
docker ps

# Restart services
docker compose down && docker compose up
```

**Flutter Build Issues**
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

---

