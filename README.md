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

You can host this static React frontend for **100% free** using Vercel, Netlify, or Render:

### Option A: Deploy on Vercel (Recommended)
1. Install Vercel CLI: `npm install -g vercel`
2. Run the deployment command in the `frontend` folder:
   ```bash
   vercel
   ```
3. Follow the CLI prompts to link your account. Vercel will automatically build the site and provide a free `https://your-project.vercel.app` URL.

### Option B: Deploy on Netlify
1. Log in to [Netlify.com](https://www.netlify.com/).
2. Click **Add New Site** -> **Import from an existing project**.
3. Connect your GitHub repository.
4. Set build settings:
   * **Build command:** `npm run build`
   * **Publish directory:** `frontend/dist`
5. Click **Deploy Site**.
