import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FolderTree, 
  CalendarClock, 
  LogOut, 
  LayoutDashboard, 
  Clock, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  User,
  Shield,
  Clock3,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { api } from './services/api';

export default function App() {
  // --- Auth State ---
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ems_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ems_token'));
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // --- Auth Form Inputs ---
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState('ROLE_EMPLOYEE');
  const [linkEmployeeId, setLinkEmployeeId] = useState('');

  // --- Core Layout & Tabs State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Data States ---
  const [dashboardStats, setDashboardStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);

  // --- UI Filter & Action States ---
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [attendanceDateFilter, setAttendanceDateFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- Time display ---
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- Modals State ---
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null); // null for create, employee object for edit
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  
  // --- Form Inputs ---
  const [employeeForm, setEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    dateOfJoining: '',
    salary: '',
    departmentId: '',
    status: 'ACTIVE',
    address: '',
    gender: 'MALE'
  });
  
  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    description: ''
  });

  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'VACATION',
    reason: ''
  });

  // --- Clock display timer ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Listen to session logout events ---
  useEffect(() => {
    const handleAuthChange = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // --- Auto-refresh dashboard & tab data ---
  useEffect(() => {
    if (token) {
      fetchTabData();
    }
  }, [token, activeTab, employeeSearch, attendanceDateFilter]);

  const fetchTabData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (activeTab === 'dashboard') {
        const stats = await api.dashboard.getStats();
        setDashboardStats(stats);
      } else if (activeTab === 'employees') {
        const list = await api.employees.getAll(employeeSearch);
        setEmployees(list);
        const depts = await api.departments.getAll();
        setDepartments(depts);
      } else if (activeTab === 'departments') {
        const depts = await api.departments.getAll();
        setDepartments(depts);
      } else if (activeTab === 'leaves') {
        if (isAdminOrManager()) {
          const list = await api.leaves.getAll();
          setLeaves(list);
        }
        if (user?.employeeId) {
          const myList = await api.leaves.getByEmployee(user.employeeId);
          setMyLeaves(myList);
        }
      } else if (activeTab === 'attendance') {
        if (isAdminOrManager()) {
          const list = await api.attendance.getAll(attendanceDateFilter);
          setAttendance(list);
        }
        if (user?.employeeId) {
          const myList = await api.attendance.getByEmployee(user.employeeId);
          setMyAttendance(myList);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // --- Role Checkers ---
  const isAdmin = () => user?.role === 'ROLE_ADMIN';
  const isManager = () => user?.role === 'ROLE_MANAGER';
  const isAdminOrManager = () => isAdmin() || isManager();

  // --- Auth Handlers ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const data = await api.auth.login(usernameInput, passwordInput);
      localStorage.setItem('ems_token', data.token);
      localStorage.setItem('ems_user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        employeeId: data.employeeId
      }));
      setToken(data.token);
      setUser({
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        employeeId: data.employeeId
      });
      // Reset Form fields
      setUsernameInput('');
      setPasswordInput('');
    } catch (err) {
      setAuthError(err.message || 'Invalid username or password');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const payload = {
        username: usernameInput,
        password: passwordInput,
        email: emailInput,
        role: roleInput,
        employeeId: linkEmployeeId ? parseInt(linkEmployeeId) : null
      };
      await api.auth.register(payload);
      setSuccessMsg('Registration successful! Please login.');
      setIsRegisterMode(false);
      // Reset registration inputs
      setUsernameInput('');
      setPasswordInput('');
      setEmailInput('');
      setLinkEmployeeId('');
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ems_token');
    localStorage.removeItem('ems_user');
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  // --- Employee Form Actions ---
  const openEmployeeModal = (emp = null) => {
    setCurrentEmployee(emp);
    if (emp) {
      setEmployeeForm({
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: emp.phone || '',
        jobTitle: emp.jobTitle,
        dateOfJoining: emp.dateOfJoining,
        salary: emp.salary.toString(),
        departmentId: emp.department?.id || '',
        status: emp.status,
        address: emp.address || '',
        gender: emp.gender || 'MALE'
      });
    } else {
      setEmployeeForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        jobTitle: '',
        dateOfJoining: new Date().toISOString().split('T')[0],
        salary: '',
        departmentId: departments[0]?.id || '',
        status: 'ACTIVE',
        address: '',
        gender: 'MALE'
      });
    }
    setEmployeeModalOpen(true);
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...employeeForm,
        salary: parseFloat(employeeForm.salary),
        departmentId: parseInt(employeeForm.departmentId)
      };

      if (currentEmployee) {
        await api.employees.update(currentEmployee.id, payload);
        setSuccessMsg('Employee details updated successfully!');
      } else {
        await api.employees.create(payload);
        setSuccessMsg('New employee registered successfully!');
      }
      setEmployeeModalOpen(false);
      fetchTabData();
    } catch (err) {
      setErrorMsg(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee record?')) return;
    setLoading(true);
    try {
      await api.employees.delete(id);
      setSuccessMsg('Employee record deleted successfully!');
      fetchTabData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  // --- Department Form Actions ---
  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.departments.create(departmentForm);
      setSuccessMsg('New department created successfully!');
      setDepartmentModalOpen(false);
      setDepartmentForm({ name: '', description: '' });
      fetchTabData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create department');
    } finally {
      setLoading(false);
    }
  };

  // --- Leave Form Actions ---
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!user?.employeeId) {
      setErrorMsg('Your user account is not linked to any Employee Record! Link it during registration.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...leaveForm,
        employeeId: user.employeeId
      };
      await api.leaves.create(payload);
      setSuccessMsg('Leave request submitted successfully!');
      setLeaveModalOpen(false);
      setLeaveForm({ startDate: '', endDate: '', leaveType: 'VACATION', reason: '' });
      fetchTabData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRejectLeave = async (id, status) => {
    const remarks = window.prompt(`Enter manager remarks for ${status.toLowerCase()}:`);
    if (remarks === null) return; // Prompt cancelled
    setLoading(true);
    try {
      await api.leaves.approveOrReject(id, status, remarks);
      setSuccessMsg(`Leave request successfully marked as ${status}!`);
      fetchTabData();
    } catch (err) {
      setErrorMsg(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  // --- Attendance Clock in/out actions ---
  const handleClockIn = async () => {
    if (!user?.employeeId) {
      setErrorMsg('User account is not linked to any Employee ID. Link during registration.');
      return;
    }
    setLoading(true);
    try {
      await api.attendance.clockIn({ employeeId: user.employeeId });
      setSuccessMsg('Clock In recorded successfully! Have a great productive day.');
      fetchTabData();
    } catch (err) {
      setErrorMsg(err.message || 'Clock In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!user?.employeeId) {
      setErrorMsg('User account is not linked to any Employee ID.');
      return;
    }
    setLoading(true);
    try {
      await api.attendance.clockOut({ employeeId: user.employeeId });
      setSuccessMsg('Clock Out recorded! See you tomorrow.');
      fetchTabData();
    } catch (err) {
      setErrorMsg(err.message || 'Clock Out failed');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Auth Portal ---
  if (!token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
          
          {/* Top accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)' }}></div>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '16px', background: 'hsl(var(--primary) / 0.1)', border: '1px solid hsl(var(--primary) / 0.2)', marginBottom: '16px', color: 'hsl(var(--primary))' }}>
              <HeartHandshake size={32} />
            </div>
            <h1 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '8px' }}>EMS Admin Portal</h1>
            <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
              {isRegisterMode ? 'Register a new administrative account' : 'Sign in to access your administrative dashboard'}
            </p>
          </div>

          {authError && (
            <div style={{ background: 'hsl(var(--danger) / 0.1)', border: '1px solid hsl(var(--danger) / 0.3)', color: 'hsl(var(--danger))', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'hsl(var(--success) / 0.1)', border: '1px solid hsl(var(--success) / 0.3)', color: 'hsl(var(--success))', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Check size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter username"
                required
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
              />
            </div>

            {isRegisterMode && (
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="Enter email address"
                  required
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                required
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
              />
            </div>

            {isRegisterMode && (
              <>
                <div className="form-group">
                  <label className="form-label">System Role</label>
                  <select 
                    className="form-control"
                    value={roleInput}
                    onChange={e => setRoleInput(e.target.value)}
                  >
                    <option value="ROLE_EMPLOYEE">Employee Access (Standard)</option>
                    <option value="ROLE_MANAGER">Manager Access (Supervisor)</option>
                    <option value="ROLE_ADMIN">Admin Access (Root Control)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Link Employee ID (Optional)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Enter Employee ID (e.g. 1)"
                    value={linkEmployeeId}
                    onChange={e => setLinkEmployeeId(e.target.value)}
                  />
                  <small style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem' }}>
                    * Link this user account to an existing database Employee profile.
                  </small>
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
              disabled={authLoading}
            >
              {authLoading ? 'Verifying...' : (isRegisterMode ? 'Register Account' : 'Sign In Now')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
            <span style={{ color: 'hsl(var(--text-secondary))' }}>
              {isRegisterMode ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button 
              className="btn-link" 
              style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', fontWeight: '700', cursor: 'pointer', outline: 'none' }}
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setAuthError('');
              }}
            >
              {isRegisterMode ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          {/* Quick Guide Overlay for Seeding credentials */}
          <div style={{ marginTop: '30px', padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} style={{ color: 'hsl(var(--primary))' }} /> Default Demo Access
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
              <div><strong>Admin:</strong> admin / admin123</div>
              <div><strong>Manager:</strong> manager / manager123</div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- Main Render Layout ---
  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      
      {/* --- Top Navbar Header --- */}
      <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '16px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100, position: 'sticky', top: 0 }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContents: 'center', color: '#020617', color: '#020617', fontWeight: 800, paddingLeft: '8px', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
            E
          </div>
          <span style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            EMPLOYEE<span style={{ color: 'hsl(var(--primary))' }}>MANAGE</span>
          </span>
        </div>

        {/* User Card & Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          
          {/* Digital Clock */}
          <div style={{ display: 'none', md: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }} className="desktop-clock">
            <Clock size={14} style={{ color: 'hsl(var(--primary))' }} />
            <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-heading)', color: '#fff', fontWeight: '700' }}>
              {currentTime.toLocaleTimeString()}
            </span>
          </div>

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right', display: 'none', sm: 'block' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{user.username}</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--primary))', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <Shield size={10} />
                {user.role.replace('ROLE_', '')}
              </div>
            </div>
            
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#020617', fontWeight: 700, fontSize: '0.95rem' }}>
              {user.username.substring(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Logout Button */}
          <button 
            className="btn btn-secondary" 
            style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
            onClick={handleLogout}
            title="Log Out"
          >
            <LogOut size={16} style={{ color: 'hsl(var(--danger))' }} />
          </button>
          
        </div>

      </header>

      {/* Main Container */}
      <div style={{ display: 'flex', flexGrow: 1, position: 'relative' }}>

        {/* --- Sidebar Navigation --- */}
        <aside className="glass-panel" style={{ width: '260px', borderRadius: 0, borderLeft: 'none', borderBottom: 'none', borderTop: 'none', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 90, flexShrink: 0 }}>
          
          <div style={{ padding: '0 8px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Navigation Menu</div>
          </div>

          <button 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              background: activeTab === 'dashboard' ? 'hsl(var(--primary) / 0.1)' : 'transparent',
              color: activeTab === 'dashboard' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
              border: activeTab === 'dashboard' ? '1px solid hsl(var(--primary) / 0.2)' : '1px solid transparent',
              textAlign: 'left',
              width: '100%',
              padding: '12px 16px'
            }}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Overview</span>
          </button>

          <button 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              background: activeTab === 'employees' ? 'hsl(var(--primary) / 0.1)' : 'transparent',
              color: activeTab === 'employees' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
              border: activeTab === 'employees' ? '1px solid hsl(var(--primary) / 0.2)' : '1px solid transparent',
              textAlign: 'left',
              width: '100%',
              padding: '12px 16px'
            }}
            onClick={() => setActiveTab('employees')}
          >
            <Users size={18} />
            <span>Employees Directory</span>
          </button>

          <button 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              background: activeTab === 'departments' ? 'hsl(var(--primary) / 0.1)' : 'transparent',
              color: activeTab === 'departments' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
              border: activeTab === 'departments' ? '1px solid hsl(var(--primary) / 0.2)' : '1px solid transparent',
              textAlign: 'left',
              width: '100%',
              padding: '12px 16px'
            }}
            onClick={() => setActiveTab('departments')}
          >
            <FolderTree size={18} />
            <span>Departments</span>
          </button>

          <button 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              background: activeTab === 'leaves' ? 'hsl(var(--primary) / 0.1)' : 'transparent',
              color: activeTab === 'leaves' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
              border: activeTab === 'leaves' ? '1px solid hsl(var(--primary) / 0.2)' : '1px solid transparent',
              textAlign: 'left',
              width: '100%',
              padding: '12px 16px'
            }}
            onClick={() => setActiveTab('leaves')}
          >
            <Calendar size={18} />
            <span>Leave Management</span>
          </button>

          <button 
            className="btn" 
            style={{ 
              justifyContent: 'flex-start',
              background: activeTab === 'attendance' ? 'hsl(var(--primary) / 0.1)' : 'transparent',
              color: activeTab === 'attendance' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
              border: activeTab === 'attendance' ? '1px solid hsl(var(--primary) / 0.2)' : '1px solid transparent',
              textAlign: 'left',
              width: '100%',
              padding: '12px 16px'
            }}
            onClick={() => setActiveTab('attendance')}
          >
            <CalendarClock size={18} />
            <span>Attendance Log</span>
          </button>

          <div style={{ marginTop: 'auto', padding: '16px', background: 'hsl(var(--bg-tertiary) / 0.3)', border: '1px solid var(--glass-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '0.8rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock3 size={14} style={{ color: 'hsl(var(--primary))' }} /> Quick Clock Box
            </h4>
            
            {user.employeeId ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="btn btn-primary" style={{ padding: '8px', fontSize: '0.75rem' }} onClick={handleClockIn}>Check In</button>
                <button className="btn btn-secondary" style={{ padding: '8px', fontSize: '0.75rem' }} onClick={handleClockOut}>Check Out</button>
              </div>
            ) : (
              <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                Link user account to Employee Profile to use Clock actions.
              </p>
            )}
          </div>

        </aside>

        {/* --- Content Area --- */}
        <main style={{ flexGrow: 1, padding: '30px', overflowY: 'auto', maxWidth: 'calc(100vw - 260px)' }}>

          {/* Feedback states */}
          {errorMsg && (
            <div style={{ background: 'hsl(var(--danger) / 0.1)', border: '1px solid hsl(var(--danger) / 0.3)', color: 'hsl(var(--danger))', padding: '12px 20px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', justifyContents: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => setErrorMsg('')}>
                <X size={16} />
              </button>
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'hsl(var(--success) / 0.1)', border: '1px solid hsl(var(--success) / 0.3)', color: 'hsl(var(--success))', padding: '12px 20px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', justifyContents: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Check size={18} />
                <span>{successMsg}</span>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }} onClick={() => setSuccessMsg('')}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* loading overlay */}
          {loading && (
            <div style={{ position: 'fixed', top: '16px', right: '16px', background: 'hsl(var(--bg-tertiary))', border: '1px solid hsl(var(--primary) / 0.3)', color: 'hsl(var(--primary))', padding: '10px 20px', borderRadius: '8px', zIndex: 1100, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="spinner" style={{ width: '12px', height: '12px', border: '2px solid transparent', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
              <span>Syncing database...</span>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ========================================================
              VIEW 1: DASHBOARD OVERVIEW
              ======================================================== */}
          {activeTab === 'dashboard' && dashboardStats && (
            <div>
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '6px' }}>Dashboard Command Center</h2>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem' }}>Live analysis indicators and system-wide stats.</p>
              </div>

              {/* Metrics Row */}
              <div className="metrics-grid">
                
                <div className="glass-panel metric-card">
                  <div className="metric-info">
                    <span className="metric-label">Total Staff</span>
                    <span className="metric-value">{dashboardStats.totalEmployees}</span>
                  </div>
                  <div className="metric-icon-box">
                    <Users size={24} />
                  </div>
                </div>

                <div className="glass-panel metric-card">
                  <div className="metric-info">
                    <span className="metric-label">Active Staff</span>
                    <span className="metric-value">{dashboardStats.activeEmployees}</span>
                  </div>
                  <div className="metric-icon-box">
                    <TrendingUp size={24} />
                  </div>
                </div>

                <div className="glass-panel metric-card">
                  <div className="metric-info">
                    <span className="metric-label">Departments</span>
                    <span className="metric-value">{dashboardStats.totalDepartments}</span>
                  </div>
                  <div className="metric-icon-box">
                    <FolderTree size={24} />
                  </div>
                </div>

                <div className="glass-panel metric-card">
                  <div className="metric-info">
                    <span className="metric-label">Pending Leaves</span>
                    <span className="metric-value">{dashboardStats.pendingLeaves}</span>
                  </div>
                  <div className="metric-icon-box">
                    <Calendar size={24} />
                  </div>
                </div>

              </div>

              {/* Charts grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginTop: '30px' }}>
                
                {/* Department Distribution (Horizontal Bar Chart) */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} style={{ color: 'hsl(var(--primary))' }} /> Staff Distribution by Department
                  </h3>
                  <div className="chart-container">
                    {Object.entries(dashboardStats.departmentEmployeeCounts || {}).length > 0 ? (
                      Object.entries(dashboardStats.departmentEmployeeCounts).map(([dept, count]) => {
                        const total = Math.max(...Object.values(dashboardStats.departmentEmployeeCounts));
                        const pct = total > 0 ? (count / total) * 100 : 0;
                        return (
                          <div key={dept} className="chart-bar-row">
                            <div className="chart-bar-label">{dept}</div>
                            <div className="chart-bar-wrapper">
                              <div className="chart-bar-fill" style={{ width: `${pct}%` }}></div>
                            </div>
                            <div className="chart-bar-value">{count}</div>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '30px' }}>No department statistics recorded.</p>
                    )}
                  </div>
                </div>

                {/* Attendance Summary Panel */}
                <div className="glass-panel" style={{ padding: '30px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarClock size={18} style={{ color: 'hsl(var(--secondary))' }} /> Today's Attendance Summary
                  </h3>
                  <div className="chart-container" style={{ gap: '20px' }}>
                    {Object.entries(dashboardStats.attendanceStatusToday || {}).length > 0 ? (
                      Object.entries(dashboardStats.attendanceStatusToday).map(([status, count]) => {
                        const total = Object.values(dashboardStats.attendanceStatusToday).reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? (count / total) * 100 : 0;
                        return (
                          <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                              <span style={{ fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>{status}</span>
                              <span style={{ fontWeight: 700, color: '#fff' }}>{count} ({Math.round(pct)}%)</span>
                            </div>
                            <div style={{ height: '8px', background: 'hsl(var(--bg-tertiary))', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ 
                                height: '100%', 
                                background: status === 'PRESENT' ? 'hsl(var(--success))' : status === 'LATE' ? 'hsl(var(--warning))' : 'hsl(var(--danger))',
                                width: `${pct}%` 
                              }}></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: '30px' }}>
                        <p style={{ color: 'hsl(var(--text-muted))', marginBottom: '14px' }}>No clock-ins recorded today yet.</p>
                        {user.employeeId && (
                          <button className="btn btn-primary" onClick={handleClockIn}>Check In Yourself Now</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 2: EMPLOYEE DIRECTORY
              ======================================================== */}
          {activeTab === 'employees' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', sm: 'row', sm: 'align-items', justifyContent: 'space-between', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '6px' }}>Employees Directory</h2>
                  <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem' }}>Manage company workers, roles, departments, salaries and account statuses.</p>
                </div>
                
                {/* Add employee action */}
                {isAdminOrManager() && (
                  <button className="btn btn-primary" onClick={() => openEmployeeModal(null)}>
                    <Plus size={16} /> Register Employee
                  </button>
                )}
              </div>

              {/* Search Control Row */}
              <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Search size={18} style={{ color: 'hsl(var(--text-muted))' }} />
                <input 
                  type="text"
                  className="form-control"
                  style={{ border: 'none', background: 'transparent', padding: '4px' }}
                  placeholder="Search staff by name, email, job title..."
                  value={employeeSearch}
                  onChange={e => setEmployeeSearch(e.target.value)}
                />
              </div>

              {/* Employees Table */}
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Job Info</th>
                      <th>Department</th>
                      <th>Salary</th>
                      <th>Joined Date</th>
                      <th>Status</th>
                      {isAdminOrManager() && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length > 0 ? (
                      employees.map(emp => (
                        <tr key={emp.id}>
                          <td><strong>#{emp.id}</strong></td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700, color: '#fff' }}>{emp.firstName} {emp.lastName}</span>
                              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{emp.email}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 600 }}>{emp.jobTitle}</span>
                              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>{emp.phone || 'No phone'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-info">{emp.department?.name || 'Unassigned'}</span>
                          </td>
                          <td>
                            <strong style={{ color: 'hsl(var(--primary))' }}>${emp.salary.toLocaleString()}</strong>
                          </td>
                          <td>{new Date(emp.dateOfJoining).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${emp.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                              {emp.status}
                            </span>
                          </td>
                          {isAdminOrManager() && (
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-secondary" style={{ padding: '6px 8px' }} onClick={() => openEmployeeModal(emp)}>
                                  <Edit2 size={12} />
                                </button>
                                {isAdmin() && (
                                  <button className="btn btn-danger" style={{ padding: '6px 8px' }} onClick={() => handleDeleteEmployee(emp.id)}>
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isAdminOrManager() ? 8 : 7} style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
                          No employee records found matching search filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 3: DEPARTMENTS
              ======================================================== */}
          {activeTab === 'departments' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', sm: 'row', sm: 'align-items', justifyContent: 'space-between', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '6px' }}>Departments Directory</h2>
                  <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem' }}>Organize staff categories, responsibilities and descriptions.</p>
                </div>
                
                {isAdmin() && (
                  <button className="btn btn-primary" onClick={() => setDepartmentModalOpen(true)}>
                    <Plus size={16} /> Create Department
                  </button>
                )}
              </div>

              {/* Department grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {departments.length > 0 ? (
                  departments.map(dept => (
                    <div key={dept.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '12px', background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                          <FolderTree size={24} />
                        </div>
                        <span className="badge badge-info" style={{ fontWeight: 800 }}>ID: #{dept.id}</span>
                      </div>

                      <div>
                        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>{dept.name}</h3>
                        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem', lineHeight: '1.5', minHeight: '4.5em' }}>
                          {dept.description || 'No description provided.'}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>OPERATIONAL NODE</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>EMS Structure</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '50px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                    No corporate departments created yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              VIEW 4: LEAVE MANAGEMENT
              ======================================================== */}
          {activeTab === 'leaves' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', sm: 'row', sm: 'align-items', justifyContent: 'space-between', gap: '20px', marginBottom: '30px' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '6px' }}>Leave Requests</h2>
                  <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem' }}>Submit requests, track time-off balances, and review team schedules.</p>
                </div>
                
                {user.employeeId && (
                  <button className="btn btn-primary" onClick={() => setLeaveModalOpen(true)}>
                    <Plus size={16} /> Request Time-off
                  </button>
                )}
              </div>

              {/* Employee Time-off request lists */}
              {user.employeeId && (
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} style={{ color: 'hsl(var(--primary))' }} /> My Time-off Log
                  </h3>
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Dates</th>
                          <th>Type</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Manager Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myLeaves.length > 0 ? (
                          myLeaves.map(req => (
                            <tr key={req.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                  <span>{req.startDate}</span>
                                  <span style={{ color: 'hsl(var(--text-muted))' }}>to</span>
                                  <span>{req.endDate}</span>
                                </div>
                              </td>
                              <td><span className="badge badge-info">{req.leaveType}</span></td>
                              <td><span style={{ fontSize: '0.85rem' }}>{req.reason}</span></td>
                              <td>
                                <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' : req.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'hsl(var(--text-secondary))' }}>
                                  {req.managerRemarks || 'No remarks recorded'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'hsl(var(--text-muted))' }}>
                              You haven't submitted any leave requests yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Admin/Manager Team Requests review */}
              {isAdminOrManager() && (
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} style={{ color: 'hsl(var(--secondary))' }} /> Review Team Leave Requests
                  </h3>
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Dates Requested</th>
                          <th>Leave Type</th>
                          <th>Reason Description</th>
                          <th>Current Status</th>
                          <th>Action Workflow</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaves.length > 0 ? (
                          leaves.map(req => (
                            <tr key={req.id}>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: 700, color: '#fff' }}>{req.employee?.firstName} {req.employee?.lastName}</span>
                                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>ID: #{req.employee?.id}</span>
                                </div>
                              </td>
                              <td>
                                <span style={{ fontSize: '0.85rem' }}>{req.startDate} to {req.endDate}</span>
                              </td>
                              <td><span className="badge badge-info">{req.leaveType}</span></td>
                              <td><span style={{ fontSize: '0.85rem' }}>{req.reason}</span></td>
                              <td>
                                <span className={`badge ${req.status === 'APPROVED' ? 'badge-success' : req.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td>
                                {req.status === 'PENDING' ? (
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleApproveRejectLeave(req.id, 'APPROVED')}>
                                      Approve
                                    </button>
                                    <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleApproveRejectLeave(req.id, 'REJECTED')}>
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                                    Completed ({req.status.toLowerCase()})
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'hsl(var(--text-muted))' }}>
                              No team leave requests submitted.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================================
              VIEW 5: ATTENDANCE LOG
              ======================================================== */}
          {activeTab === 'attendance' && (
            <div>
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '6px' }}>Attendance Log System</h2>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem' }}>Track clock-in times, punctuality flags, check-outs, and daily logs.</p>
              </div>

              {/* User Clock Box shortcut */}
              {user.employeeId && (
                <div className="glass-panel" style={{ padding: '24px', marginBottom: '30px', display: 'flex', flexDirection: 'column', md: 'row', md: 'align-items', justifyContents: 'space-between', gap: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '4px' }}>Live Digital Check-In Terminal</h3>
                    <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                      Punctuality Rule: Clock-in before 09:15 AM to be flagged as On-Time.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'hsl(var(--primary))', background: 'rgba(255,255,255,0.02)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      {currentTime.toLocaleTimeString()}
                    </div>
                    <button className="btn btn-primary" onClick={handleClockIn}>Check In Today</button>
                    <button className="btn btn-secondary" onClick={handleClockOut}>Check Out Today</button>
                  </div>
                </div>
              )}

              {/* Employee Attendance log list */}
              {user.employeeId && (
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock3 size={18} style={{ color: 'hsl(var(--primary))' }} /> My Personal Attendance History
                  </h3>
                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Clock In</th>
                          <th>Clock Out</th>
                          <th>Punctuality Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myAttendance.length > 0 ? (
                          myAttendance.map(log => (
                            <tr key={log.id}>
                              <td><strong>{log.date}</strong></td>
                              <td>{log.clockIn}</td>
                              <td>{log.clockOut || '---'}</td>
                              <td>
                                <span className={`badge ${log.status === 'PRESENT' ? 'badge-success' : log.status === 'LATE' ? 'badge-warning' : 'badge-danger'}`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: 'hsl(var(--text-muted))' }}>
                              No check-ins recorded for your account yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Admin/Manager live team logs */}
              {isAdminOrManager() && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={18} style={{ color: 'hsl(var(--secondary))' }} /> Daily Staff Punctuality Logs
                    </h3>
                    
                    {/* Date filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Filter Date:</span>
                      <input 
                        type="date" 
                        className="form-control" 
                        style={{ padding: '6px 12px', width: '160px', fontSize: '0.85rem' }} 
                        value={attendanceDateFilter}
                        onChange={e => setAttendanceDateFilter(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="custom-table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Employee ID</th>
                          <th>Employee Name</th>
                          <th>Date</th>
                          <th>Clock In</th>
                          <th>Clock Out</th>
                          <th>Current Status</th>
                          <th>Action Update</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.length > 0 ? (
                          attendance.map(log => (
                            <tr key={log.id}>
                              <td><strong>#{log.employee?.id}</strong></td>
                              <td><span style={{ fontWeight: 700, color: '#fff' }}>{log.employee?.firstName} {log.employee?.lastName}</span></td>
                              <td>{log.date}</td>
                              <td>{log.clockIn}</td>
                              <td>{log.clockOut || 'Not Checked-out'}</td>
                              <td>
                                <span className={`badge ${log.status === 'PRESENT' ? 'badge-success' : log.status === 'LATE' ? 'badge-warning' : 'badge-danger'}`}>
                                  {log.status}
                                </span>
                              </td>
                              <td>
                                <select 
                                  className="form-control" 
                                  style={{ padding: '4px 8px', fontSize: '0.8rem', width: '120px' }} 
                                  value={log.status}
                                  onChange={e => {
                                    api.attendance.updateStatus(log.id, e.target.value)
                                      .then(() => {
                                        setSuccessMsg('Attendance status override saved!');
                                        fetchTabData();
                                      })
                                      .catch(err => setErrorMsg(err.message));
                                  }}
                                >
                                  <option value="PRESENT">PRESENT</option>
                                  <option value="LATE">LATE</option>
                                  <option value="ABSENT">ABSENT</option>
                                  <option value="HALFDAY">HALFDAY</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'hsl(var(--text-muted))' }}>
                              No attendance check-ins found for the specified filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>

      </div>

      {/* ========================================================
          MODAL 1: REGISTER/EDIT EMPLOYEE RECORD
          ======================================================== */}
      {employeeModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              {currentEmployee ? 'Edit Employee Profile' : 'Register New Employee'}
            </h3>

            <form onSubmit={handleEmployeeSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={employeeForm.firstName}
                    onChange={e => setEmployeeForm({...employeeForm, firstName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={employeeForm.lastName}
                    onChange={e => setEmployeeForm({...employeeForm, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required 
                    value={employeeForm.email}
                    onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="+1 555-0199"
                    value={employeeForm.phone}
                    onChange={e => setEmployeeForm({...employeeForm, phone: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Software Engineer" 
                    required 
                    value={employeeForm.jobTitle}
                    onChange={e => setEmployeeForm({...employeeForm, jobTitle: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select 
                    className="form-control"
                    value={employeeForm.gender}
                    onChange={e => setEmployeeForm({...employeeForm, gender: e.target.value})}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date of Joining</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required 
                    value={employeeForm.dateOfJoining}
                    onChange={e => setEmployeeForm({...employeeForm, dateOfJoining: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary (USD Annually)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="75000" 
                    required 
                    value={employeeForm.salary}
                    onChange={e => setEmployeeForm({...employeeForm, salary: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Operational Department</label>
                  <select 
                    className="form-control" 
                    required
                    value={employeeForm.departmentId}
                    onChange={e => setEmployeeForm({...employeeForm, departmentId: e.target.value})}
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-control"
                    value={employeeForm.status}
                    onChange={e => setEmployeeForm({...employeeForm, status: e.target.value})}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Address</label>
                <textarea 
                  className="form-control" 
                  rows="2"
                  value={employeeForm.address}
                  onChange={e => setEmployeeForm({...employeeForm, address: e.target.value})}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEmployeeModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentEmployee ? 'Save Changes' : 'Register Profile'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: CREATE DEPARTMENT
          ======================================================== */}
      {departmentModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              Create Corporate Department
            </h3>

            <form onSubmit={handleDepartmentSubmit}>
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Research & Development" 
                  required
                  value={departmentForm.name}
                  onChange={e => setDepartmentForm({...departmentForm, name: e.target.value})}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Description & Responsibilities</label>
                <textarea 
                  className="form-control" 
                  placeholder="Summarize the core operational scope of this department..." 
                  rows="3" 
                  required
                  value={departmentForm.description}
                  onChange={e => setDepartmentForm({...departmentForm, description: e.target.value})}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setDepartmentModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Node</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: REQUEST LEAVE
          ======================================================== */}
      {leaveModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              Request Time-off / Leave
            </h3>

            <form onSubmit={handleLeaveSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required
                    value={leaveForm.startDate}
                    onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required
                    value={leaveForm.endDate}
                    onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Leave Category</label>
                <select 
                  className="form-control"
                  value={leaveForm.leaveType}
                  onChange={e => setLeaveForm({...leaveForm, leaveType: e.target.value})}
                >
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="VACATION">Vacation Time-off</option>
                  <option value="UNPAID">Unpaid / Sabbatical</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Reason details</label>
                <textarea 
                  className="form-control" 
                  placeholder="Detail the circumstances for this leave request..." 
                  rows="3" 
                  required
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setLeaveModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
