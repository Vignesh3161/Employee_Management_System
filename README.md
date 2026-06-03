# ⚛️ React + Vite Frontend - Employee Management System

This directory contains the user interface for the Employee Management System. It is built as a single-page application (SPA) using React, Vite, and Lucide icons.

---

## 🎨 Design System & Aesthetics
The frontend uses a modern **Glassmorphic UI/UX** design with:
*   **Vibrant Dark Theme:** Sleek typography, tailored dark modes, and soft glowing backdrops.
*   **Responsive Layout:** Flexbox and CSS Grid structures that align perfectly on mobile, tablet, and desktop viewports.
*   **Micro-Animations:** Interactive state changes, smooth hover transitions, and spinning network indicators to guide the user.

---

## 📂 Core Views & Capabilities

1.  **🔑 Auth Portal:** Secure login and registration. Supports user roles (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_EMPLOYEE`). Intercepts incorrect login attempts and displays clear alerts (e.g., *Invalid username or password*).
2.  **📊 Command Dashboard:** Real-time administrative metrics displaying total staff strength, active staff status, department count, and interactive graphs.
3.  **👥 Employee Directory:** View all staff members, search details, create/edit employee cards, and delete records (restricted to administrators).
4.  **🏢 Department Manager:** Add new department divisions with titles and descriptions.
5.  **📅 Leave Management:** Link your user account to an employee profile to file leave requests. Administrators and managers can approve or reject leaves with remarks.
6.  **⏰ Attendance Log & Clock:** Features a **Quick Clock Box** allowing employees to Clock-In and Clock-Out daily. Administrators can view the overall company timeline.

---

## 🔗 Connecting to the Live Backend

The frontend is configured to communicate directly with your live Java Spring Boot production server deployed on Render:

📂 Path: `src/services/api.js`
```javascript
const API_BASE_URL = 'https://java-application-latest-q1ml.onrender.com/api';
```

---

## 🚀 Local Development Setup

To run this React application locally on your system:

### 1. Install Dependencies
Make sure you have Node.js installed, then run:
```bash
npm install
```

### 2. Run the Development Server
```bash
# Starts the Vite server (typically on http://localhost:5173)
npm run dev
```

### 3. Build for Production
```bash
# Compiles and minifies assets into the /dist folder
npm run build
```

---

## ☁️ Free Frontend Deployment Guide

You can host this static React frontend for **100% free** using Render:

### Deploy on Render
1. Log in to [Render.com](https://render.com/).
2. Click the **New +** button in the dashboard and select **Static Site**.
3. Connect your GitHub repository.
4. Configure the Static Site:
   * **Name:** `employee-management-frontend`
   * **Root Directory:** `frontend` *(This is important because your React project is in the frontend subfolder)*
   * **Build Command:** `npm run build`
   * **Publish Directory:** `dist` *(This is where Vite outputs compiled production files)*
5. Click **Create Static Site**. Render will build the site and deploy it to a permanent, fast URL (e.g. `https://employee-management-frontend.onrender.com`).


