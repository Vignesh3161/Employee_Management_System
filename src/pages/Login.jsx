import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, ShieldAlert, KeyRound, Mail, UserPlus, Info } from 'lucide-react';

export default function Login({ onLoginSuccess, showToast }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ROLE_EMPLOYEE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Reset inputs when tab switches
  useEffect(() => {
    setUsername('');
    setPassword('');
    setEmail('');
    setRole('ROLE_EMPLOYEE');
    setError('');
  }, [isLoginTab]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8888/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials or login failed.');
      }

      localStorage.setItem('ems_token', data.token);
      localStorage.setItem('ems_user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        employeeId: data.employeeId
      }));

      onLoginSuccess(data);
      showToast('Logged in successfully!', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.');
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !email) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8888/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      showToast('Registered successfully! Please log in.', 'success');
      setIsLoginTab(true);
    } catch (err) {
      setError(err.message || 'Unable to complete registration.');
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-height-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.1), transparent), radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.08), transparent)' }}>
      {/* Background Abstract Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 animate-fade-in relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/10 mb-4">
            <UserCheck className="w-9 h-9 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Antigravity EMS</h2>
          <p className="mt-2 text-sm text-slate-400">
            A comprehensive, high-fidelity Employee Management Suite
          </p>
        </div>

        {/* Auth Box Card */}
        <div className="glass-card p-8 bg-slate-900/60 border border-white/5 shadow-2xl rounded-2xl">
          {/* Tab buttons */}
          <div className="flex p-1 bg-black/30 rounded-xl border border-white/5 mb-6">
            <button
              onClick={() => setIsLoginTab(true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${isLoginTab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLoginTab(false)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${!isLoginTab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Register Account
            </button>
          </div>

          {/* Form Area */}
          {error && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoginTab ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserCheck className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username (e.g. admin)"
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (e.g. admin123)"
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center text-sm py-3"
                >
                  {loading ? 'Authenticating...' : 'Sign In To Dashboard'}
                </button>
              </div>

              <div className="mt-4 p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-xl text-[11px] text-slate-400 flex items-start gap-2.5">
                <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-300 mb-0.5">Quick Testing Profiles:</p>
                  <p>• Admin: <span className="text-indigo-300 font-mono">admin</span> / <span className="text-indigo-300 font-mono">admin123</span></p>
                  <p>• Manager: <span className="text-emerald-300 font-mono">manager</span> / <span className="text-emerald-300 font-mono">manager123</span></p>
                  <p>• Employee: <span className="text-slate-300 font-mono">employee</span> / <span className="text-slate-300 font-mono">employee123</span></p>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserPlus className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Create a unique username"
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a strong password"
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Access Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="glass-input glass-select"
                >
                  <option value="ROLE_EMPLOYEE">Standard Employee</option>
                  <option value="ROLE_MANAGER">Department Manager</option>
                  <option value="ROLE_ADMIN">System Administrator</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center text-sm py-3"
                >
                  {loading ? 'Creating Account...' : 'Register New Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
