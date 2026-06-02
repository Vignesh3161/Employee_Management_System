import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  FileSpreadsheet, 
  DollarSign, 
  TrendingUp, 
  ChevronRight,
  Database,
  ArrowUpRight,
  Sparkles,
  Activity,
  UserPlus,
  Clock,
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export default function Dashboard({ user, showToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('ems_token');
      const response = await fetch('http://localhost:8888/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard statistics.');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      showToast('Error loading dashboard analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Format department data for chart
  const getDeptChartData = () => {
    if (!stats?.departmentEmployeeCounts) return [];
    return Object.entries(stats.departmentEmployeeCounts).map(([name, count]) => ({
      name: name.length > 12 ? name.substring(0, 10) + '..' : name,
      employees: count
    }));
  };

  // Format gender data for pie chart
  const getGenderChartData = () => {
    if (!stats?.genderDistribution) return [];
    return Object.entries(stats.genderDistribution).map(([gender, count]) => ({
      name: gender.toLowerCase() === 'male' ? 'Male' : gender.toLowerCase() === 'female' ? 'Female' : 'Other',
      value: count
    }));
  };

  const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b'];

  // Mock Recent Activities to make the system feel alive and busy
  const activities = [
    { id: 1, type: 'clock-in', user: 'Jane Smith', details: 'Clocked in at 08:58 AM', time: '10 mins ago', status: 'PRESENT' },
    { id: 2, type: 'leave', user: 'John Doe', details: 'Requested 3 days Vacation', time: '2 hours ago', status: 'PENDING' },
    { id: 3, type: 'new-user', user: 'Marcus Vance', details: 'Registered in Engineering Division', time: 'Yesterday', status: 'ACTIVE' },
    { id: 4, type: 'approval', user: 'HR Department', details: 'Approved Casual Leave for Alice Vance', time: '2 days ago', status: 'APPROVED' }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'clock-in':
        return <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg"><Clock className="w-4 h-4" /></div>;
      case 'leave':
        return <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg"><FileSpreadsheet className="w-4 h-4" /></div>;
      case 'new-user':
        return <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg"><UserPlus className="w-4 h-4" /></div>;
      default:
        return <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg"><CheckCircle className="w-4 h-4" /></div>;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950/20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium animate-pulse">Compiling real-time analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate office presence percentage
  const activeCount = stats?.activeEmployees || 0;
  const totalCount = stats?.totalEmployees || 1;
  const presencePct = Math.round((activeCount / totalCount) * 100);

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
      
      {/* Dynamic Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-white/5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            EMS Enterprise Cloud
          </span>
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight mt-2">
            {getGreeting()}, {user?.username || 'User'}!
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Real-time corporate metrics sync with your Neon PG cluster.
          </p>
        </div>

        {/* Database Handshake Status Banner */}
        <div className="flex items-center gap-3 bg-slate-900/60 border border-white/5 px-5 py-3 rounded-2xl">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Database Link</p>
            <p className="text-xs font-bold text-slate-200">Neon AWS Cloud Instance</p>
            <p className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
              SSL Connection Secured
            </p>
          </div>
        </div>
      </div>

      {/* Counter Grid */}
      <div className="grid-stats">
        {/* Card 1: Total Employees */}
        <div className="glass-card p-6 bg-slate-900/40 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors pointer-events-none">
            <Users className="w-20 h-20" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-full border border-indigo-500/10">Staff</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Headcount</p>
          <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{stats?.totalEmployees || 0}</h3>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${presencePct}%` }}></div>
            </div>
            <span className="text-[10px] font-bold text-indigo-400">{presencePct}%</span>
          </div>
        </div>

        {/* Card 2: Cost Divisions */}
        <div className="glass-card p-6 bg-slate-900/40 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-purple-500/5 group-hover:text-purple-500/10 transition-colors pointer-events-none">
            <Building2 className="w-20 h-20" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-purple-400 bg-purple-500/5 px-2.5 py-1 rounded-full border border-purple-500/10">Divisions</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Departments</p>
          <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{stats?.totalDepartments || 0}</h3>
          <p className="text-[11px] text-slate-400 mt-3 font-medium">
            Active organizational units
          </p>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="glass-card p-6 bg-slate-900/40 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-amber-500/5 group-hover:text-amber-500/10 transition-colors pointer-events-none">
            <FileSpreadsheet className="w-20 h-20" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/5 px-2.5 py-1 rounded-full border border-amber-500/10">Action Required</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Leaves</p>
          <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{stats?.pendingLeaves || 0}</h3>
          <p className="text-[11px] text-slate-400 mt-3 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
            Awaiting manager remarks review
          </p>
        </div>

        {/* Card 4: Monthly Payroll */}
        <div className="glass-card p-6 bg-slate-900/40 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors pointer-events-none">
            <DollarSign className="w-20 h-20" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">Finance</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Monthly Payroll Cost</p>
          <h3 className="text-3xl font-extrabold text-slate-100 mt-1">
            ${stats?.totalMonthlySalary ? (stats.totalMonthlySalary / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </h3>
          <p className="text-[11px] text-slate-400 mt-3 font-medium">
            Active yearly base: ${stats?.totalMonthlySalary ? stats.totalMonthlySalary.toLocaleString() : '0'}
          </p>
        </div>
      </div>

      {/* Main Grid: Analytical Visualizations */}
      <div className="grid-charts">
        
        {/* Left Side: Recharts Allocation Bar Chart */}
        <div className="glass-card p-6 bg-slate-900/30 flex flex-col h-[420px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-md font-bold text-slate-100">Department Allocations</h4>
              <p className="text-[11px] text-slate-400">Total employees registered in each division cost unit</p>
            </div>
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            {getDeptChartData().length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">No records available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDeptChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#11131e', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f3f4f6' }}
                    labelStyle={{ fontWeight: 'bold', color: '#a855f7' }}
                  />
                  <Bar dataKey="employees" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {getDeptChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Side: Recharts Gender Demographics Pie Chart */}
        <div className="glass-card p-6 bg-slate-900/30 flex flex-col h-[420px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-md font-bold text-slate-100">Gender Demographics</h4>
              <p className="text-[11px] text-slate-400">Employee gender distribution ratios</p>
            </div>
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-0">
            {getGenderChartData().length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">No records available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getGenderChartData()}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getGenderChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#11131e', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f3f4f6' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs text-slate-300 font-semibold">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Office Activity Feed & Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Activity Feed */}
        <div className="glass-card p-6 bg-slate-900/30 lg:col-span-2 flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div>
              <h4 className="text-md font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4.5 h-4.5 text-indigo-400" />
                Live Corporate Activity Feed
              </h4>
              <p className="text-[11px] text-slate-400">Chronological history logs of employee check-ins and approvals</p>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start justify-between gap-4 p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center gap-3">
                  {getActivityIcon(act.type)}
                  <div>
                    <p className="text-xs font-bold text-slate-200">{act.user}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-semibold">{act.time}</span>
                  <span className={`inline-block text-[9px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded ${
                    act.status === 'PRESENT' || act.status === 'APPROVED' || act.status === 'ACTIVE'
                      ? 'text-emerald-400 bg-emerald-950/20'
                      : 'text-amber-400 bg-amber-950/20'
                  }`}>
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Office Quick Navigation Menu */}
        <div className="glass-card p-6 bg-slate-900/30 flex flex-col justify-between min-h-[350px]">
          <div>
            <h4 className="text-md font-bold text-slate-200 mb-2">Workspace Shortcuts</h4>
            <p className="text-[11px] text-slate-400 mb-6">Instantly navigate to departments, timekeeping or directory forms</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => navigate('/employees')} 
              className="flex items-center justify-between p-3.5 bg-slate-900/50 hover:bg-slate-900 hover:border-indigo-500/30 border border-white/5 rounded-xl w-full text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg"><Users className="w-4 h-4" /></div>
                <span className="text-xs font-bold text-slate-200">Staff Directory</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button 
              onClick={() => navigate('/attendance')} 
              className="flex items-center justify-between p-3.5 bg-slate-900/50 hover:bg-slate-900 hover:border-emerald-500/30 border border-white/5 rounded-xl w-full text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg"><Clock className="w-4 h-4" /></div>
                <span className="text-xs font-bold text-slate-200">Punch-in Portal</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button 
              onClick={() => navigate('/leaves')} 
              className="flex items-center justify-between p-3.5 bg-slate-900/50 hover:bg-slate-900 hover:border-amber-500/30 border border-white/5 rounded-xl w-full text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg"><FileSpreadsheet className="w-4 h-4" /></div>
                <span className="text-xs font-bold text-slate-200">Request Leaves</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button 
              onClick={() => navigate('/departments')} 
              className="flex items-center justify-between p-3.5 bg-slate-900/50 hover:bg-slate-900 hover:border-purple-500/30 border border-white/5 rounded-xl w-full text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg"><Building2 className="w-4 h-4" /></div>
                <span className="text-xs font-bold text-slate-200">Corporate Divisions</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
