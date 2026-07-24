# 🌿 AgriDoc — Crop Disease Diagnosis & Agricultural Advisory Platform

**AgriDoc** is an AI-powered agricultural pathology platform designed to help farmers diagnose crop diseases, obtain treatment guidelines in **English & Tamil**, track report histories, and consult with agricultural experts.

🚀 Key Features :

**AI Disease Pathology Engine**: Instant crop disease diagnosis using computer vision and pathology knowledge (Severity, Root Cause, Immediate Actions, Treatment, Prevention, Fertilizer & Irrigation Advice, Recovery Time).
- 35+ Supported Crops**: Complete bilingual support in **English & Tamil** (e.g., `Rice (நெல் / அரிசி)`, `Tomato (தக்காளி)`).
- Multi-Mode Image Input**: Drag-and-drop file upload or live camera photo capture.
- Bilingual Interface**: Seamless toggle between **Both (English & தமிழ்)**, **English Only**, or **தமிழ் மட்டும்** for advisory reports.
- Farmer Dashboard**: Quick access to crop diagnostics, recent report history, and expert advisory tickets.
- Expert Advisory Workspace**: Connect farmers with agricultural experts to ask follow-up questions on diagnosed crop reports.
  
  (Premium features)
- Community Forum**: Farmers and experts can share local disease outbreak warnings, crop management tips, and general farming advice.
- Role-Based Security**: Secured with **Spring Security & JWT Authentication** for `FARMER`, `EXPERT`, and `ADMIN` roles.

🛠️ Technology Stack :

**Backend**
- **Language**: Java 21
- **Framework**: Spring Boot 3.x (Spring Web, Spring Security, Spring Data JPA)
- **Database**: MySQL 8.0+ (`utf8mb4` character set)
- **Security**: JWT (JSON Web Tokens) & BCrypt password hashing
- **AI Integration**: Google Gemini API & Embedded Plant Pathology Engine

**Frontend**
- **Structure & Logic**: HTML5, Vanilla JavaScript (ES6+, Fetch API, HTML5 Media Capture API)
- **Styling**: Vanilla CSS3 (Responsive grid, custom design system, glassmorphism UI)

📁 Project Architecture :

```
AgriDoc/
├── backend/
│   ├── src/main/java/com/agridoc/
│   │   ├── config/          # Security, CORS, Schema Migration & File Storage
│   │   ├── controller/      # Auth, Crop, Report, Consultation, Forum & Admin Endpoints
│   │   ├── dto/             # Request & Response DTOs
│   │   ├── entity/          # JPA Entities (User, Crop, Report, Consultation, ForumPost)
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   └── service/         # Business Logic & Pathology Diagnosis Engine
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── css/                 # Modern Responsive Stylesheets
│   ├── js/                  # Central API service, Auth & Dashboard logic
│   ├── pages/               # Farmer, Expert, Admin Dashboards & Diagnosis Pages
│   ├── index.html           # Landing & Login Page
│   └── logo.png
├── database/
│   ├── schema.sql           # Database Table Schemas & 35-Crop Seed Data
│   └── fix_crops_utf8.sql   # UTF-8 Encoding & Tamil Character Fix Script
└── README.md
```

⚙️ Setup & Installation Instructions

1. **Prerequisites**
- **Java JDK 21** or higher
- **Maven 3.8+**
- **MySQL Server 8.0+**
- Modern Web Browser (Chrome, Edge, Firefox)

2. **Database Configuration**

1. Start your MySQL Server.
2. Open your MySQL client or workbench and execute `database/schema.sql`:
   ```sql
   SOURCE database/schema.sql;
   ```
3. To ensure UTF-8 support for Tamil text:
   ```sql
   SOURCE database/fix_crops_utf8.sql;
   ```

3. **Backend Setup (Spring Boot)** :

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Configure database credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/agridoc?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&useUnicode=true&characterEncoding=UTF-8
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend server will start at `http://localhost:8080`.

4. **Frontend Setup**

1. Open `frontend/index.html` in your web browser or use VS Code **Live Server** (port 5500 / 8080).
2. Default Administrator Account:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Register a new account as a **Farmer** to start diagnosing crops!

---

📄 License & Attribution

Developed with care for agricultural sustainability and empowering farmers with AI pathology solutions.
