import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarCheck, 
  FileSpreadsheet, 
  LogOut, 
  UserCheck 
} from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    { to: '/employees', label: 'Employees', icon: <Users className="w-5 h-5" />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    { to: '/departments', label: 'Departments', icon: <Building2 className="w-5 h-5" />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    { to: '/attendance', label: 'Attendance', icon: <CalendarCheck className="w-5 h-5" />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    { to: '/leaves', label: 'Leave Requests', icon: <FileSpreadsheet className="w-5 h-5" />, roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] }
  ];

  // Filter navigation items by roles (just in case)
  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'text-indigo-400 bg-indigo-950/40 border border-indigo-500/20';
      case 'ROLE_MANAGER':
        return 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/20';
      default:
        return 'text-slate-400 bg-slate-950/40 border border-slate-500/20';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'Admin';
      case 'ROLE_MANAGER': return 'Manager';
      default: return 'Employee';
    }
  };

  return (
    <aside className="w-64 bg-[#10121d] border-r border-white/5 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <UserCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-lg leading-tight tracking-tight">Antigravity</h1>
          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">EMS Core</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 text-indigo-400 border-l-4 border-indigo-500 shadow-sm' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
            `}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User profile section */}
      <div className="p-4 border-t border-white/5 bg-slate-950/20">
        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5 mb-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-sm shadow-inner uppercase">
            {user?.username?.substring(0, 2) || 'US'}
          </div>
          <div className="overflow-hidden">
            <p className="text-slate-200 text-xs font-semibold truncate leading-tight">{user?.username}</p>
            <p className="text-[10px] text-slate-400 truncate mb-1">{user?.email}</p>
            <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${getRoleBadge(user?.role)}`}>
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogoutClick}
          className="w-100 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 font-semibold text-xs transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
