# Kiến trúc Microservice — AI Tutor

---

## 1. Hiện trạng: Kiến trúc Microservice Toàn Diện

Hệ thống đã hoàn tất chuyển đổi từ Monolith sang Microservices theo **Strangler Fig Pattern**. Khối Monolith cũ giờ đây đóng vai trò hoàn toàn là một **API Gateway**, điều phối traffic đến 4 Service độc lập.

```mermaid
graph TB
    subgraph "Monolith hiện tại"
        direction TB
        FE["Flutter App<br/>(Frontend)"]
        BE["Express Server<br/>(1 codebase duy nhất)"]
        DB[("MongoDB<br/>(1 database)")]

        FE -->|REST API| BE
        BE --> DB
        BE -->|API call| GEMINI["Google Gemini API"]
    end

    style BE fill:#e74c3c,color:#fff
    style DB fill:#3498db,color:#fff
    style FE fill:#2ecc71,color:#fff
    style GEMINI fill:#f39c12,color:#fff
```

### Vấn đề của Monolith

| Vấn đề | Mô tả |
|---------|--------|
| **Coupling cao** | Auth, Learning, AI, Quiz đều chung 1 codebase |
| **Khó scale** | Muốn scale AI chat phải scale cả auth, lesson |
| **Single point of failure** | Server chết → toàn bộ app chết |
| **Khó phân chia team** | Tất cả dev sửa cùng 1 repo |

---

## 2. Kiến trúc Microservice đề xuất

### 2.1 Tổng quan 4 Services

```mermaid
graph TB
    FE["Flutter App"]

    subgraph "API Gateway (K8s Ingress)"
        GW["Nginx Ingress Controller<br/>/api/v1/*"]
    end

    subgraph "Microservices"
        AUTH["Auth Service<br/>:3001"]
        LEARN["Learning Service<br/>:3002"]
        ASSESS["Assessment Service<br/>:3003"]
        AICHAT["AI/Chat Service<br/>:3004"]
    end

    subgraph "1 MongoDB Instance — 4 Logical Databases"
        DB1[("auth_db")]
        DB2[("learning_db")]
        DB3[("assessment_db")]
        DB4[("ai_chat_db")]
    end

    EXT["Google Gemini API"]

    FE -->|HTTPS| GW
    GW --> AUTH
    GW --> LEARN
    GW --> ASSESS
    GW --> AICHAT

    AUTH --> DB1
    LEARN --> DB2
    ASSESS --> DB3
    AICHAT --> DB4
    AICHAT -->|API call| EXT

    style GW fill:#9b59b6,color:#fff
    style AUTH fill:#e74c3c,color:#fff
    style LEARN fill:#27ae60,color:#fff
    style ASSESS fill:#2980b9,color:#fff
    style AICHAT fill:#f39c12,color:#fff
```

### 2.2 Chi tiết từng Service

```mermaid
graph LR
    subgraph "1. Auth Service"
        A1["User"]
        A2["Password (bcrypt)"]
        A3["JWT Token"]
        A4["Role & Status"]
    end

    subgraph "2. Learning Service"
        B1["Subject"]
        B2["Lesson"]
        B3["Quiz (content)"]
        B4["LessonSuggestion"]
    end

    subgraph "3. Assessment Service"
        C1["QuizAttempt"]
        C2["Progress"]
    end

    subgraph "4. AI/Chat Service (Conversation Engine)"
        D1["Gemini Integration"]
        D2["ChatHistory"]
        D3["AIConversation<br/>Session"]
        D4["AI Usage Tracking"]
    end

    style A1 fill:#e74c3c,color:#fff
    style A2 fill:#e74c3c,color:#fff
    style A3 fill:#e74c3c,color:#fff
    style A4 fill:#e74c3c,color:#fff
    style B1 fill:#27ae60,color:#fff
    style B2 fill:#27ae60,color:#fff
    style B3 fill:#27ae60,color:#fff
    style B4 fill:#27ae60,color:#fff
    style C1 fill:#2980b9,color:#fff
    style C2 fill:#2980b9,color:#fff
    style D1 fill:#f39c12,color:#fff
    style D2 fill:#f39c12,color:#fff
    style D3 fill:#f39c12,color:#fff
    style D4 fill:#f39c12,color:#fff
```

### 2.3 Service Responsibilities

Bảng tóm tắt trách nhiệm cốt lõi của từng Microservice để đảm bảo tính độc lập:

| Service | Trách nhiệm (Responsibility) | Domain Data Sở hữu |
|---------|-----------------------------|---------------------|
| **Auth** | Quản lý User, đăng nhập, Sign JWT | User profiles, Credentials |
| **Learning** | Cung cấp Subject, Lesson, Quiz content | Subjects, Lessons, Quizzes |
| **Assessment** | Lưu Progress, chấm điểm Quiz | Progress, Quiz Attempts |
| **AI Chat** | Lâu trữ hội thoại, giao tiếp Gemini | Chat Histories, AI Sessions |

### 2.4 API Contracts

Gateway định tuyến các request từ Frontend vào các service tương ứng dựa trên prefix:

```yaml
# Public API Routes (Frontend gọi)
/api/v1/users/login      👉 Auth Service
/api/v1/users/register   👉 Auth Service

/api/v1/subjects/*       👉 Learning Service
/api/v1/lessons/*        👉 Learning Service
/api/v1/quizzes/*        👉 Learning Service
/api/v1/lesson-suggestions 👉 Learning Service

/api/v1/progress/*       👉 Assessment Service
/api/v1/attempts/*       👉 Assessment Service

/api/v1/ai/messages      👉 AI Chat Service
/api/v1/ai/conversations 👉 AI Chat Service

# Internal API Routes (Service-to-Service gọi)
/internal/verify         👉 Auth Service
/internal/quizzes/:id    👉 Learning Service
/internal/lessons/:id    👉 Learning Service
```

---

## 3. Ownership & Boundary Rules

Mỗi service **chỉ đọc/ghi database của riêng mình**. Khi cần dữ liệu từ service khác → gọi qua REST API.

```mermaid
graph TD
    subgraph "❌ KHÔNG được phép"
        S1["Assessment Service"] -.->|"Truy cập trực tiếp"| DB2[("learning_db")]
    end

    subgraph "✅ Cách đúng"
        S2["Assessment Service"] -->|"GET /internal/quizzes/:id"| S3["Learning Service"]
        S3 --> DB3[("learning_db")]
    end

    style S1 fill:#e74c3c,color:#fff
    style S2 fill:#27ae60,color:#fff
    style S3 fill:#27ae60,color:#fff
```

| Service | Sở hữu | Không được chứa |
|---------|---------|-----------------|
| **Auth** | User, Password, JWT | Lesson, Quiz, Chat data |
| **Learning** | Subject, Lesson, Quiz content, Suggestion | QuizAttempt, Progress |
| **Assessment** | QuizAttempt, Progress | Subject/Lesson content gốc |
| **AI/Chat** | ChatHistory, Session, AI Usage | User password, Lesson content |

---

## 4. Luồng xử lý chính (Sequence Diagrams)

### 4.1 Đăng nhập

```mermaid
sequenceDiagram
    actor User as Flutter App
    participant GW as API Gateway
    participant Auth as Auth Service
    participant DB as auth_db

    User->>GW: POST /api/v1/auth/login
    GW->>Auth: Forward request
    Auth->>DB: Find user by username
    DB-->>Auth: User document
    Auth->>Auth: Verify password (bcrypt)
    Auth->>Auth: Generate JWT
    Auth-->>GW: { token, user }
    GW-->>User: 200 OK + JWT
```

### 4.2 Xem bài học & theo dõi tiến độ

```mermaid
sequenceDiagram
    actor User as Flutter App
    participant GW as API Gateway
    participant Learn as Learning Service
    participant Assess as Assessment Service

    User->>GW: GET /api/v1/learning/lessons/:id
    Note right of User: Header: Bearer JWT
    GW->>Learn: Forward request
    Learn->>Learn: Verify JWT locally
    Learn-->>GW: Lesson content
    GW-->>User: 200 OK

    User->>GW: POST /api/v1/assessment/progress/:lessonId
    GW->>Assess: Forward request
    Assess->>Assess: Verify JWT locally
    Assess-->>GW: Progress recorded
    GW-->>User: 200 OK
```

### 4.3 Làm quiz & cập nhật điểm

```mermaid
sequenceDiagram
    actor User as Flutter App
    participant GW as API Gateway
    participant Learn as Learning Service
    participant Assess as Assessment Service

    User->>GW: GET /api/v1/learning/quizzes/:id
    GW->>Learn: Forward request
    Learn->>Learn: Verify JWT locally
    Learn-->>User: Quiz (questions + options)

    User->>GW: POST /api/v1/assessment/attempts
    GW->>Assess: Forward request
    Assess->>Assess: Verify JWT locally
    Assess->>Learn: GET /internal/quizzes/:id (lấy đáp án)
    Learn-->>Assess: Correct answers
    Assess->>Assess: Cache answers + Chấm điểm
    Note right of Assess: Lần sau dùng cache, không gọi Learning
    Assess-->>User: { score, results }
```

### 4.4 Chat với AI

```mermaid
sequenceDiagram
    actor User as Flutter App
    participant GW as API Gateway
    participant AI as AI/Chat Service
    participant Gemini as Google Gemini

    User->>GW: POST /api/v1/ai/chat
    Note right of User: { message, sessionId }
    GW->>AI: Forward request
    AI->>AI: Verify JWT + Check rate limit
    AI->>Gemini: generateContent(message)
    Gemini-->>AI: AI response
    AI->>AI: Save to ChatHistory (ai_chat_db)
    AI-->>User: { response }
```

---

## 5. Giao tiếp giữa các Service

### 5.1 Phương thức: REST Synchronous

Các service giao tiếp nội bộ qua **internal API** (prefix `/internal/`), tách biệt với public API (`/api/v1/`).

```mermaid
graph LR
    A["Assessment"] -->|"REST GET /internal/*"| B["Learning"]
    C["AI/Chat"] -->|"REST GET /internal/*"| B

    style A fill:#2980b9,color:#fff
    style B fill:#27ae60,color:#fff
    style C fill:#f39c12,color:#fff
```

> **Lưu ý:** AI/Chat **không gọi** Assessment. AI chỉ cần content (Subject, Lesson, Quiz) từ Learning Service → giảm coupling tối đa.

| Caller | Callee | API | Mục đích |
|--------|--------|-----|----------|
| Assessment | Learning | `GET /internal/quizzes/:id` | Lấy đáp án quiz để chấm |
| AI/Chat | Learning | `GET /internal/lessons/:id` | Context cho AI tạo quiz |
| AI/Chat | Learning | `GET /internal/subjects` | Danh sách môn học |

**Public vs Internal API:**

| Loại | Prefix | Ai gọi | Versioned |
|------|--------|--------|-----------|
| Public | `/api/v1/*` | Flutter App (qua Gateway) | ✅ Có |
| Internal | `/internal/*` | Service-to-service (trong cluster) | ❌ Không |

### 5.2 Resilience: Chain Latency & Failure Handling

REST synchronous có rủi ro **chain failure** — nếu Learning Service down, Assessment không chấm được quiz.

```mermaid
graph LR
    A["Assessment"] -->|"GET /internal/quizzes/:id"| B["Learning"]
    B -.->|"❌ 503 Down"| A
    A -->|"⚡ Fallback: dùng cached answer"| CACHE["Local Cache"]

    style B fill:#e74c3c,color:#fff
    style CACHE fill:#f39c12,color:#fff
```

| Giải pháp | Mô tả | Áp dụng |
|-----------|-------|---------|
| **Timeout + Retry** | Giới hạn 3s, retry 1 lần | Giai đoạn 1 |
| **Cache đáp án quiz** | Assessment cache quiz answers khi lấy lần đầu | Giai đoạn 1 |
| **Circuit Breaker** | Ngắt gọi nếu service liên tục fail | Nâng cao (sau) |
| **Event-driven (Kafka)** | Loại bỏ sync dependency hoàn toàn | Enterprise (không cần cho đồ án) |

### 5.2 JWT Verification

Tất cả service **share cùng 1 JWT_SECRET** qua K8s Secret. Mỗi service tự verify JWT mà không cần gọi Auth Service.

```mermaid
graph TB
    AUTH["Auth Service"] -->|"Sign JWT<br/>(HS256 + SECRET)"| TOKEN["JWT Token"]
    TOKEN -->|"Gửi trong Header"| FE["Flutter App"]
    FE -->|"Bearer token"| GW["API Gateway"]

    GW --> S1["Learning Service<br/>Verify JWT locally"]
    GW --> S2["Assessment Service<br/>Verify JWT locally"]
    GW --> S3["AI/Chat Service<br/>Verify JWT locally"]

    SECRET["K8s Secret<br/>JWT_SECRET"] -.->|mount| S1
    SECRET -.->|mount| S2
    SECRET -.->|mount| S3
    SECRET -.->|mount| AUTH

    style AUTH fill:#e74c3c,color:#fff
    style SECRET fill:#8e44ad,color:#fff
```

---

## 6. Database Schema (tách theo service)

```mermaid
erDiagram
    %% Auth DB
    USER {
        ObjectId _id
        String username
        String email
        String password
        String role
        String status
        Date createdAt
    }

    %% Learning DB
    SUBJECT {
        ObjectId _id
        String name
        String icon
        String color
    }
    LESSON {
        ObjectId _id
        String title
        String content
        ObjectId subjectId
        String difficulty
    }
    QUIZ {
        ObjectId _id
        String title
        ObjectId subjectId
        Array questions
    }

    SUBJECT ||--o{ LESSON : contains
    SUBJECT ||--o{ QUIZ : contains

    %% Assessment DB
    QUIZ_ATTEMPT {
        ObjectId _id
        ObjectId userId
        ObjectId quizId
        Number score
        Array answers
    }
    PROGRESS {
        ObjectId _id
        ObjectId userId
        ObjectId lessonId
        Number completionPercent
    }

    %% AI/Chat DB
    CHAT_HISTORY {
        ObjectId _id
        String userId
        Array messages
        String subject
    }
    AI_SESSION {
        ObjectId _id
        ObjectId userId
        Object tokenUsage
        String status
    }
```

> **Lưu ý:** `userId`, `quizId`, `lessonId` trong Assessment và AI/Chat DB là **ID tham chiếu** (reference), không phải foreign key join. Khi cần thông tin chi tiết → gọi REST API sang service tương ứng.

---

## 6.1 Database Deployment Strategy

Sử dụng **1 MongoDB instance, 4 logical databases** — tách biệt ở tầng logic, không tách vật lý.

```mermaid
graph TB
    subgraph "1 MongoDB Instance (Container/Atlas)"
        DB1[("auth_db")]
        DB2[("learning_db")]
        DB3[("assessment_db")]
        DB4[("ai_chat_db")]
    end

    AS["Auth Service"] -->|"MONGO_URI=.../auth_db"| DB1
    LS["Learning Service"] -->|"MONGO_URI=.../learning_db"| DB2
    ES["Assessment Service"] -->|"MONGO_URI=.../assessment_db"| DB3
    ACS["AI/Chat Service"] -->|"MONGO_URI=.../ai_chat_db"| DB4

    style AS fill:#e74c3c,color:#fff
    style LS fill:#27ae60,color:#fff
    style ES fill:#2980b9,color:#fff
    style ACS fill:#f39c12,color:#fff
```

| Môi trường | Chiến lược | Lý do |
|------------|------------|-------|
| **Development** | 1 Mongo container, 4 databases | Đơn giản, tiết kiệm resource |
| **Production** | 1 Mongo instance (hoặc Atlas), 4 databases | Đủ cho scale đồ án |
| **Enterprise** | 4 Mongo instances riêng biệt | Cần khi data >100GB/service |

> **Quyết định:** Tách **logical** (database name), không tách **physical** (instance). Mỗi service chỉ biết connection string của DB mình qua `MONGO_URI` env variable → ownership vẫn được đảm bảo.

---

## 7. Triển khai trên Kubernetes

```mermaid
graph TB
    subgraph "K8s Cluster"
        ING["Ingress Controller<br/>(API Gateway)"]

        subgraph "Namespace: ai-tutor"
            subgraph "Auth Pod"
                AS["auth-service:3001"]
            end
            subgraph "Learning Pod"
                LS["learning-service:3002"]
            end
            subgraph "Assessment Pod"
                ES["assessment-service:3003"]
            end
            subgraph "AI/Chat Pod"
                ACS["ai-chat-service:3004"]
            end
        end

        subgraph "Database Layer"
            M1[("MongoDB: auth_db")]
            M2[("MongoDB: learning_db")]
            M3[("MongoDB: assessment_db")]
            M4[("MongoDB: ai_chat_db")]
        end
    end

    ING --> AS
    ING --> LS
    ING --> ES
    ING --> ACS

    AS --> M1
    LS --> M2
    ES --> M3
    ACS --> M4

    style ING fill:#9b59b6,color:#fff
```

### Ingress Routing Rules

```yaml
# Ví dụ K8s Ingress config
rules:
  - path: /api/v1/auth     → auth-service:3001
  - path: /api/v1/learning  → learning-service:3002
  - path: /api/v1/assessment → assessment-service:3003
  - path: /api/v1/ai        → ai-chat-service:3004
```

Mỗi service có:
- **Deployment** riêng (có thể scale replicas độc lập)
- **Service** (ClusterIP) riêng
- **Health check**: `/health` (liveness) + `/ready` (readiness)
- **ConfigMap/Secret** riêng cho env variables

### Gateway Enhancement Roadmap

Hiện tại dùng **K8s Ingress** làm gateway — chỉ routing, **không verify JWT**. Mỗi service tự verify JWT locally. Security boundary vẫn được đảm bảo vì mỗi service verify JWT independently.

| Tính năng | Công cụ | Mức độ |
|-----------|---------|--------|
| Rate Limiting (Gateway) | Nginx `limit_req` hoặc Kong | Nên có |
| **Rate Limiting (AI Service)** | **Per-userId limit, max concurrent requests** | **Quan trọng** |
| Auth at Gateway | Verify JWT tại Ingress (lua script) | Tùy chọn (hiện service tự verify) |
| Centralized Logging | Fluentd + ELK | Nâng cao |
| API Versioning | Path-based `/api/v1`, `/api/v2` | Đã hỗ trợ |
| Block `/internal/*` từ bên ngoài | Ingress chỉ route `/api/v1/*` | Bắt buộc |

---

## 8. So sánh Monolith vs Microservice

| Tiêu chí | Monolith (hiện tại) | Microservice (đề xuất) |
|----------|---------------------|------------------------|
| Codebase | 1 repo, 1 server.js | 1 mono-repo, 4 service folders, 4 entry points |
| Database | 1 MongoDB | 4 MongoDB databases |
| Scaling | Scale cả khối | Scale từng service |
| Deploy | 1 lần deploy all | Deploy độc lập |
| Fault isolation | 1 lỗi → sập hết | 1 service lỗi → còn lại hoạt động |
| Complexity | Thấp | Cao hơn (networking, deploy) |
| Phù hợp | MVP, prototype | Production, enterprise |

---

## 9. Hành trình chuyển đổi (Phasing - ĐÃ HOÀN TẤT)

```mermaid
gantt
    title Lộ trình chuyển đổi Microservice (Đã Hoàn Thành)
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m

    section Phase 1 - Chuẩn bị
    Thiết kế API contract       :done, a1, 2026-03-03, 3d
    Setup project structure     :done, a2, after a1, 2d

    section Phase 2 - Tách Service
    Auth Service               :done, b1, after a2, 3d
    Learning Service           :done, b2, after b1, 4d
    Assessment Service         :done, b3, after b2, 3d
    AI/Chat Service            :done, b4, after b3, 4d

    section Phase 3 - Tích hợp
    API Gateway (Express)      :done, c1, after b4, 2d
    Inter-service testing      :done, c2, after c1, 3d
    Frontend migration         :done, c3, after c2, 3d

    section Phase 4 - Code Cleanup
    Gỡ bỏ legacy code          :done, d1, after c3, 2d
    CI/CD pipeline update      :done, d2, after d1, 2d
    Hoàn thiện Docker Compose  :done, d3, after d2, 3d
```

---

## 10. Rủi ro & Giải pháp

| Rủi ro | Giải pháp |
|--------|-----------|
| Network latency giữa services | Giữ REST call tối thiểu, cache data khi cần |
| Chain failure (service B down → A fail) | Timeout 3s + retry + local cache |
| Data consistency | Eventual consistency chấp nhận được ở mức đồ án |
| Quản lý nhiều DB | 1 Mongo instance, 4 logical databases |
| Debug phức tạp hơn | Request ID truyền qua tất cả services (correlation) |
| Deploy phức tạp | CI/CD pipeline tự động cho mỗi service |

---

## 11. Quyết định kiến trúc (Architecture Decision Records)

| # | Quyết định | Lý do |
|---|-----------|-------|
| ADR-1 | 4 logical databases, 1 physical MongoDB instance | Đủ ownership isolation, tránh overkill 4 containers |
| ADR-2 | AI/Chat = **Conversation Engine** (có DB riêng) | AI cần lưu ChatHistory, Session, Token Usage → cần persistent storage |
| ADR-3 | REST synchronous (không Kafka) | Đơn giản, đủ cho đồ án, dễ debug |
| ADR-4 | K8s Ingress làm API Gateway (chỉ routing) | Tận dụng infra hiện có, JWT verify ở từng service |
| ADR-5 | HS256 JWT + K8s Secret | Đơn giản, phù hợp mức đồ án |
| ADR-6 | Public `/api/v1/*` vs Internal `/internal/*` | Tránh version conflict, block internal từ bên ngoài |
| ADR-7 | AI chỉ gọi Learning (không gọi Assessment) | Giảm coupling, AI chỉ cần content không cần user behavior |
| ADR-8 | **Mono-repo** (không multi-repo) | 1 dev, shared code dễ quản lý, CI/CD đơn giản |
| ADR-9 | npm local dependency cho shared code | Không hack runtime như `module-alias`, npm native symlink |

---

## 12. Mono-repo Project Structure

```
AI-Tutor/
│
├── services/                    # 4 Microservices
│   ├── auth/                    # Auth Service (:3001)
│   │   ├── src/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.routes.js
│   │   │   └── user.model.js
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── learning/                # Learning Service (:3002)
│   │   ├── src/
│   │   │   ├── lesson.controller.js
│   │   │   ├── subject.controller.js
│   │   │   ├── quiz.controller.js
│   │   │   ├── learning.service.js
│   │   │   ├── lesson.model.js
│   │   │   ├── subject.model.js
│   │   │   └── quiz.model.js
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── assessment/              # Assessment Service (:3003)
│   │   ├── src/
│   │   │   ├── progress.controller.js
│   │   │   ├── quizAttempt.controller.js
│   │   │   ├── assessment.service.js
│   │   │   ├── progress.model.js
│   │   │   └── quizAttempt.model.js
│   │   ├── server.js
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── ai-chat/                 # AI/Chat Service (:3004)
│       ├── src/
│       │   ├── ai.controller.js
│       │   ├── chat.controller.js
│       │   ├── ai.service.js
│       │   ├── chatHistory.model.js
│       │   └── aiSession.model.js
│       ├── server.js
│       ├── package.json
│       └── Dockerfile
│
├── shared/                      # Shared code (npm local dep)
│   ├── middleware/
│   │   ├── auth.js              # JWT verify middleware
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── response.js          # ok(), notFound(), serverError()
│   │   └── logger.js
│   ├── config/
│   │   └── db.js                # MongoDB connection helper
│   └── package.json             # name: "@shared"
│
├── k8s/                         # K8s manifests
│   ├── auth/
│   ├── learning/
│   ├── assessment/
│   ├── ai-chat/
│   └── ingress.yaml
│
├── ai_tutor_app/                # Flutter frontend (giữ nguyên)
│
├── docker-compose.yml           # Dev: chạy full stack
└── README.md
```

---

## 13. Shared Code Strategy

Dùng **npm local dependency** — npm native, không cần thư viện ngoài.

```mermaid
graph TB
    subgraph "shared/ (package: @shared)"
        MW["middleware/auth.js"]
        UT["utils/response.js"]
        LG["utils/logger.js"]
        CF["config/db.js"]
    end

    subgraph "services/"
        A["auth/"] -->|"@shared"| MW
        A -->|"@shared"| UT
        B["learning/"] -->|"@shared"| MW
        B -->|"@shared"| UT
        C["assessment/"] -->|"@shared"| MW
        C -->|"@shared"| UT
        D["ai-chat/"] -->|"@shared"| MW
        D -->|"@shared"| UT
    end

    style A fill:#e74c3c,color:#fff
    style B fill:#27ae60,color:#fff
    style C fill:#2980b9,color:#fff
    style D fill:#f39c12,color:#fff
```

**Cách cài đặt:**

```json
// shared/package.json
{ "name": "@shared", "version": "1.0.0" }

// services/auth/package.json
{ "dependencies": { "@shared": "file:../../shared" } }
```

**Import trong code:**

```js
const authMiddleware = require('@shared/middleware/auth');
const { ok, serverError } = require('@shared/utils/response');
```

> `npm install` sẽ tạo symlink `node_modules/@shared → ../../shared`. NodeJS resolve như package bình thường, không hack runtime.

---

## 14. Migration Strategy (Strangler Pattern)

Chuyển đổi từ Monolith → Microservice theo 6 bước, **không phá vỡ hệ thống hiện có**.

```mermaid
graph LR
    subgraph "Bước 1-2: Refactor Monolith"
        M1["Monolith hiện tại<br/>(src/ phẳng)"] -->|"Tổ chức lại"| M2["Monolith theo domain<br/>(src/auth, src/learning...)"]
        M2 -->|"Verify OK"| M3["✅ Monolith chạy đúng"]
    end

    subgraph "Bước 3-4: Extract Services"
        M3 -->|"Move folders"| S1["services/auth<br/>services/learning<br/>services/assessment<br/>services/ai-chat"]
        S1 -->|"Add server.js"| S2["4 standalone services"]
    end

    subgraph "Bước 5-6: Deploy"
        S2 -->|"Docker Compose"| D1["Local dev OK"]
        D1 -->|"K8s + Ingress"| D2["Production deploy"]
    end

    style M1 fill:#e74c3c,color:#fff
    style M3 fill:#27ae60,color:#fff
    style S2 fill:#2980b9,color:#fff
    style D2 fill:#9b59b6,color:#fff
```

### Chi tiết từng bước

| Bước | Mô tả | Output |
|------|--------|--------|
| **1** | Tổ chức lại `src/` theo domain: `auth/`, `learning/`, `assessment/`, `ai-chat/`, `shared/` | Monolith code gọn hơn |
| **1.5** | Chuẩn hóa interface — controller không import model domain khác, gọi qua service layer | Giảm coupling |
| **2** | Test monolith vẫn chạy đúng | ✅ Không regression |
| **3** | Copy từng domain → `services/` folder, thêm `server.js` + `package.json` | 4 service riêng biệt |
| **4** | Setup `shared/` npm local dependency, mỗi service `npm install` | Shared code hoạt động |
| **5** | Docker Compose chạy 4 services + 1 MongoDB | Local dev full stack |
| **6** | K8s Ingress routing, manifests, deploy | Production ready |

### Quy tắc quan trọng ở Bước 1.5

```mermaid
graph TD
    subgraph "❌ KHÔNG được làm"
        C1["assessment/progress.controller.js"] -.->|"require('../learning/lesson.model')"| M1["learning/lesson.model.js"]
    end

    subgraph "✅ Cách đúng"
        C2["assessment/progress.controller.js"] -->|"require('./assessment.service')"| S1["assessment/assessment.service.js"]
        S1 -->|"REST call (sau khi tách)"| S2["learning/learning.service.js"]
    end

    style C1 fill:#e74c3c,color:#fff
    style C2 fill:#27ae60,color:#fff
    style S1 fill:#27ae60,color:#fff
```

> Trong monolith (bước 1-2): service layer có thể import trực tiếp model domain khác — tạm chấp nhận.
> Khi tách service (bước 3+): thay thế bằng REST call qua internal API.

---
