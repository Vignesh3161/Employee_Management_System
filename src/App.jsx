import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';

// Components
import Sidebar from './components/Sidebar';
import Notification from './components/Notification';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ems_token') || '');
  const [hydrated, setHydrated] = useState(false);

  // Notification Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  useEffect(() => {
    hydrateSession();
  }, [token]);

  const hydrateSession = async () => {
    const storedToken = localStorage.getItem('ems_token');
    const storedUser = localStorage.getItem('ems_user');

    if (!storedToken || !storedUser) {
      setUser(null);
      setHydrated(true);
      return;
    }

    try {
      // Validate session with backend
      const response = await fetch('http://localhost:8888/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        // Token expired or invalid
        handleLogout();
      }
    } catch (err) {
      console.error('Session hydration failed:', err);
      // fallback to offline stored data if backend is offline/booting
      setUser(JSON.parse(storedUser));
    } finally {
      setHydrated(true);
    }
  };

  const handleLoginSuccess = (loginData) => {
    setToken(loginData.token);
    setUser({
      id: loginData.id,
      username: loginData.username,
      email: loginData.email,
      role: loginData.role,
      employeeId: loginData.employeeId
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('ems_token');
    localStorage.removeItem('ems_user');
    setToken('');
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  if (!hydrated) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold animate-pulse">Initializing Antigravity Secure Port...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-[#07080e] text-slate-100 font-sans">
        {/* Floating Notification */}
        {toast && (
          <Notification
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}

        {/* Layout Wrappers */}
        {user ? (
          /* AUTHENTICATED WORKSPACE LAYOUT */
          <>
            <Sidebar user={user} onLogout={handleLogout} />
            <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
              {/* Dynamic Workspace Router */}
              <Routes>
                <Route path="/" element={<Dashboard user={user} showToast={showToast} />} />
                <Route path="/employees" element={<Employees user={user} showToast={showToast} />} />
                <Route path="/departments" element={<Departments user={user} showToast={showToast} />} />
                <Route path="/attendance" element={<Attendance user={user} showToast={showToast} />} />
                <Route path="/leaves" element={<Leaves user={user} showToast={showToast} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </>
        ) : (
          /* UNAUTHENTICATED PUBLIC LAYOUT */
          <Routes>
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} showToast={showToast} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}
