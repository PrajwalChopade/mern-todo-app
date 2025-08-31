# ✨ TaskFlow - Modern Task Management Application

<div align="center">

![TaskFlow Banner](https://github.com/PrajwalChopade/mern-todo-app/blob/main/my-react-app/public/logo.png)

[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.0+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**🚀 Transform your productivity with intelligent task management**

[Live Demo](https://taskflowup.netlify.app) 

</div>

---

## 🎯 **Project Overview**

TaskFlow is a full-stack, modern task management application built with the MERN stack. It features a beautiful, responsive UI with dark/light themes, intelligent priority systems, and seamless user experience across all devices.

### ✨ **Key Features**

- 🔐 **Secure Authentication** - JWT-based user registration and login
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- 🌙 **Theme System** - Light, Dark, and Auto modes with smooth transitions
- ⚡ **Priority Management** - High, Medium, Low priority classification
- ✅ **Task Status Tracking** - Active and Completed task views
- 🎨 **Modern UI/UX** - Glassmorphism design with smooth animations
- 📊 **Real-time Updates** - Instant task updates using Nodemailer
- 🚀 **Performance Optimized** - Fast loading with optimistic UI updates

---

## 🖼️ **Screenshots**

<div align="center">

### 🏠 **Landing Page**
![Landing Page](https://github.com/PrajwalChopade/mern-todo-app/blob/main/my-react-app/public/images/landing.png)

### 📋 **Task Dashboard**
![Dashboard](https://github.com/PrajwalChopade/mern-todo-app/blob/main/my-react-app/public/images/dashboard.png)

### 📱 **Mobile Experience**
<img src="https://github.com/PrajwalChopade/mern-todo-app/blob/main/my-react-app/public/images/mobile.png">

</div>

---

## 🛠️ **Tech Stack**

### **Frontend**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API communication

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### **Deployment**
- **Frontend**: Netlify
- **Backend**: Render
- **Database**: MongoDB Atlas

---

## 🚀 **Quick Start**

### **Prerequisites**
```bash
Node.js >= 20.19.0
npm >= 10.0.0
MongoDB (local or Atlas)
```

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskflow.git
   cd taskflow
   ```

2. **Setup Frontend**
   ```bash
   cd my-react-app
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd ../backend
   npm install
   ```

4. **Environment Variables**
   
   Create `.env` in backend directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

5. **Start Development Servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd my-react-app
   npm run dev
   ```

6. **Open Application**
   ```
   Frontend: http://localhost:5173
   Backend:  http://localhost:5000
   ```

---

## 📁 **Project Structure**

```
taskflow/
├── 📁 my-react-app/               # React Frontend
│   ├── 📁 src/
│   │   ├── 📁 components/         # React Components
│   │   │   ├── login.tsx          # Authentication UI
│   │   │   ├── Home.tsx           # Main Dashboard
│   │   │   ├── AddTask.tsx        # Task Creation
│   │   │   └── ...
│   │   ├── 📁 services/           # API Services
│   │   │   └── authService.ts     # Authentication Logic
│   │   └── 📁 assets/             # Static Assets
│   ├── package.json
│   ├── tailwind.config.js         # TailwindCSS Config
│   └── vite.config.ts             # Vite Configuration
│
├── 📁 backend/                    # Express.js Backend
│   ├── 📁 models/                 # MongoDB Models
│   ├── 📁 routes/                 # API Routes
│   ├── 📁 middleware/             # Custom Middleware
│   ├── server.js                  # Main Server File
│   └── package.json
│
└── README.md                      # Project Documentation
```

---

## 🎨 **Features Deep Dive**

### **⚡ Task Management**
- **Priority levels**: High 🔥, Medium ⚡, Low 🌟
- **Status tracking**: Active vs Completed tasks
- **Real-time updates** with optimistic UI using NodeMailer
- **Bulk operations** for efficient task management

### **📱 Responsive Design**
- **Mobile-first approach** with progressive enhancement
- **Breakpoint strategy**: Mobile (320px+) → Tablet (768px+) → Desktop (1024px+)
- **Touch-optimized** interactions for mobile devices
- **Adaptive layouts** that work across all screen sizes
  
### **🔐 Authentication System**
- Secure JWT-based authentication
- Password hashing with bcryptjs
- Protected routes and middleware
- Persistent login sessions
---
## 🎯 **Performance Optimizations**

- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Responsive images with proper formats
- **Bundle Optimization** - Tree shaking and minification
- **Caching Strategy** - Efficient API response caching
- **Optimistic Updates** - Instant UI feedback
- **Lightweight Dependencies** - Minimal bundle size


## 👨‍💻 **Author**

**Prajwal Chopade**

- GitHub: [@prajwalchopade](https://github.com/prajwalchopade)
- LinkedIn: [Prajwal Chopade](https://www.linkedin.com/in/prajwal-chopade-aab34b18a)
- Email: prajwalchopade2005@gmail.com

---
