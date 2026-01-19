# TaskFlow - Task Management Application

TaskFlow is a full-stack task management application built with the MERN stack (MongoDB, Express, React, Node.js). It helps users organize their daily tasks, habits, notes, and checklists in one intuitive interface with real-time notifications and a responsive design.

![TaskFlow Dashboard](https://img.shields.io/badge/Status-Production_Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 📋 Task Management
- **Daily Habits**: Track daily routines with streak counter and visual habit grid
- **Scheduled Tasks**: One-time tasks with due dates and times
- **Drag & Drop**: Reorder tasks with intuitive drag-and-drop interface
- **Swipe Actions**: Swipe right to delete tasks on mobile
- **Priority Management**: Adjust task priority levels

### 📝 Notes & Checklists
- **Rich Notes**: Create, edit, and organize notes with titles and content
- **Interactive Checklists**: Nested checklist items with completion tracking
- **Real-time Updates**: Instant synchronization across all components

### 🗓️ Calendar & Scheduling
- **Calendar View**: Monthly view with scheduled tasks
- **Date Picker**: Easy date selection for task scheduling
- **Visual Indicators**: Dots on calendar days with scheduled tasks

### 🔔 Smart Notifications
- **Browser Notifications**: Desktop alerts for task reminders
- **Custom Sounds**: Configurable notification tones
- **Multiple Reminders**: 24h, 5h, 5m, and due-time notifications
- **Notification Center**: View and manage all notifications

### 👤 User Experience
- **JWT Authentication**: Secure login/register with token-based auth
- **Responsive Design**: Mobile-first design with 468px breakpoint optimization
- **Dark Theme**: Eye-friendly dark mode interface
- **Progress Tracking**: Visual progress meter with completion percentage
- **Profile Dashboard**: User statistics and activity overview

### ⚙️ Settings & Customization
- **Notification Settings**: Customize reminder preferences
- **Sound Controls**: Adjust notification volume and tones
- **Remember Me**: Option to save login sessions
- **Account Management**: User profile and preferences

## 📂 Project Structure

taskflow-app/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Note.js
│   │   ├── Notification.js
│   │   └── Checklist.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── notes.js
│   │   ├── notifications.js
│   │   ├── checklists.js
│   │   └── stats.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── tones/
│   │       └── tone1.mp3
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddTaskForm.js
│   │   │   ├── TaskCard.js
│   │   │   ├── ChecklistCard.js
│   │   │   ├── Calendar.js
│   │   │   ├── ProgressMeter.js
│   │   │   ├── Navbar.js
│   │   │   ├── HabitGrid.js
│   │   │   └── (other components)
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   ├── TaskContext.js
│   │   │   ├── NoteContext.js
│   │   │   └── ChecklistContext.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Notes.js
│   │   │   ├── Notifications.js
│   │   │   ├── CalendarView.js
│   │   │   ├── Checklists.js
│   │   │   ├── Settings.js
│   │   │   └── Profile.js
│   │   ├── utils/
│   │   │   ├── notificationEngine.js
│   │   │   ├── notificationSound.js
│   │   │   └── streak.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles.css
│   ├── package.json
│   └── .env.example
│
├── README.md
└── LICENSE
---

## 🚀 Features

- User Authentication (Register / Login)
- Task Management (Daily & One-time tasks)
- Habit Tracking with Streaks
- Notes Management
- Checklist Support
- Notification System
- Calendar View
- User Statistics Dashboard
- Responsive Design (Desktop & Mobile)

---

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Context API
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Bcrypt.js

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas)
- npm

---

### Backend Setup

cd backend
npm install
cp .env.example .env
npm start


## 🌐 Application Access

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:5000  

---

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Tasks
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/checkin`
- `POST /api/tasks/:id/reset-streak`

### Notes
- `GET /api/notes`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`

### Notifications
- `GET /api/notifications`
- `PUT /api/notifications/:id/view`
- `DELETE /api/notifications/:id`
- `PUT /api/notifications/mark-all-read`

### Checklists
- `GET /api/checklists`
- `POST /api/checklists`
- `PUT /api/checklists/:id`
- `DELETE /api/checklists/:id`

### Statistics
- `GET /api/stats`

---

## 📦 Deployment

- **Frontend:** Vercel  
- **Backend:** Render / Railway  
- **Database:** MongoDB Atlas  

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👤 Author

**Aswin N**

---

## 📌 Project Status

- **Version:** 1.0.0  
- **Status:** Active Development  

---

