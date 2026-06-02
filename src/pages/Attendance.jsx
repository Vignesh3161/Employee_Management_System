import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, Calendar, UserCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function Attendance({ user, showToast }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isClockedOut, setIsClockedOut] = useState(false);
  const [todayLog, setTodayLog] = useState(null);
  
  // Date filter for admin views
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const employeeId = user?.employeeId;
  const isAdminOrManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  // Live Ticking Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filterDate]);

  const fetchLogs = async () => {
    setLoading(true);
    const token = localStorage.getItem('ems_token');
    
    try {
      // 1. If admin/manager, fetch all logs for the filtered date
      if (isAdminOrManager) {
        const response = await fetch(`http://localhost:8888/api/attendance?date=${filterDate}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } else if (employeeId) {
        // Fetch personal logs
        const response = await fetch(`http://localhost:8888/api/attendance/employee/${employeeId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setLogs(data.reverse()); // Show newest first
        }
      }

      // 2. Fetch today's clock-in state for this specific employee
      if (employeeId) {
        const response = await fetch(`http://localhost:8888/api/attendance/employee/${employeeId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const todayStr = new Date().toISOString().split('T')[0];
          const todayRecord = data.find(log => log.date === todayStr);

          if (todayRecord) {
            setTodayLog(todayRecord);
            setIsClockedIn(true);
            setIsClockedOut(!!todayRecord.clockOut);
          } else {
            setTodayLog(null);
            setIsClockedIn(false);
            setIsClockedOut(false);
          }
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error syncing attendance data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    if (!employeeId) {
      showToast('No linked employee profile found for this user account.', 'warning');
      return;
    }

    const token = localStorage.getItem('ems_token');
    try {
      const response = await fetch('http://localhost:8888/api/attendance/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ employeeId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Clock in failed.');
      }

      showToast(`Clocked in successfully at ${data.clockIn}. Status: ${data.status}`, 'success');
      fetchLogs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleClockOut = async () => {
    if (!employeeId) return;

    const token = localStorage.getItem('ems_token');
    try {
      const response = await fetch('http://localhost:8888/api/attendance/clock-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ employeeId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Clock out failed.');
      }

      showToast(`Clocked out successfully at ${data.clockOut}.`, 'success');
      fetchLogs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStatusOverride = async (id, status) => {
    const token = localStorage.getItem('ems_token');
    try {
      const response = await fetch(`http://localhost:8888/api/attendance/${id}/status?status=${status}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Status override failed.');
      
      showToast('Attendance status updated successfully.', 'success');
      fetchLogs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PRESENT': return <span className="badge badge-present">Present</span>;
      case 'LATE': return <span className="badge badge-late">Late Checkin</span>;
      case 'HALFDAY': return <span className="badge badge-halfday">Half Day</span>;
      case 'ABSENT': return <span className="badge badge-absent">Absent</span>;
      default: return <span className="badge badge-inactive">{status}</span>;
    }
  };

  // Helper: calculate working duration between clock-in and clock-out or now
  const getElapsedWorkTime = () => {
    if (!todayLog || !isClockedIn) return '0h 0m';
    const [inH, inM] = todayLog.clockIn.split(':').map(Number);
    const inDate = new Date();
    inDate.setHours(inH, inM, 0);

    let endDate = new Date();
    if (todayLog.clockOut) {
      const [outH, outM] = todayLog.clockOut.split(':').map(Number);
      endDate.setHours(outH, outM, 0);
    }

    const diffMs = endDate - inDate;
    if (diffMs < 0) return '0h 0m';
    const hrs = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="flex-1 p-8 space-y-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Time & Attendance</h2>
          <p className="text-xs text-slate-400">Record daily clock-in/out timings and review detailed presence metrics.</p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary text-xs px-4 py-2 shrink-0 gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Records
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Visual Clock Punch Panel */}
        <div className="glass-card p-6 bg-slate-900/40 flex flex-col justify-between items-center text-center min-h-[440px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
          
          {/* Ticking Clock UI */}
          <div className="space-y-1.5 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-300">
              <Clock className="w-3.5 h-3.5" />
              Live Workspace Time
            </span>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider pt-2">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h3 className="text-4xl font-black text-slate-100 tracking-tight font-mono">
              {currentTime.toLocaleTimeString()}
            </h3>
          </div>

          {/* Interactive Clock Flow */}
          {employeeId ? (
            <div className="w-full space-y-5 my-6">
              
              {/* Timeline Steps Gauge */}
              <div className="flex justify-between items-center px-4 mb-4 relative">
                {/* Horizontal progress bar background */}
                <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-[2px] bg-white/5 pointer-events-none">
                  <div className={`h-full bg-emerald-500 transition-all duration-300`} style={{ 
                    width: isClockedOut ? '100%' : isClockedIn ? '50%' : '0%' 
                  }}></div>
                </div>

                {/* Step 1: Clock In */}
                <div className="flex flex-col items-center gap-1.5 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs ${
                    isClockedIn ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-white/10 text-slate-500'
                  }`}>
                    1
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">Clock In</span>
                </div>

                {/* Step 2: Working */}
                <div className="flex flex-col items-center gap-1.5 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs ${
                    isClockedIn && !isClockedOut ? 'bg-indigo-600 border-indigo-500 text-white animate-pulse' : isClockedOut ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-white/10 text-slate-500'
                  }`}>
                    2
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">On Duty</span>
                </div>

                {/* Step 3: Complete */}
                <div className="flex flex-col items-center gap-1.5 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs ${
                    isClockedOut ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-white/10 text-slate-500'
                  }`}>
                    3
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">Finished</span>
                </div>
              </div>

              {/* Action Buttons */}
              {!isClockedIn ? (
                <button
                  onClick={handleClockIn}
                  className="btn-primary w-full justify-center py-4 text-sm gap-3 shadow-indigo-500/10"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Clock In (Start Duty)
                </button>
              ) : !isClockedOut ? (
                <button
                  onClick={handleClockOut}
                  className="btn-danger w-full justify-center py-4 text-sm gap-3 shadow-rose-500/10 animate-pulse"
                >
                  <Square className="w-4 h-4 fill-white" />
                  Clock Out (End Duty)
                </button>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Duty Cycle Completed!
                </div>
              )}

              {/* Quick statistics */}
              {todayLog && (
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-left space-y-1.5">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Shift Performance</p>
                    <span className="text-[10px] font-bold text-slate-300">Elapsed: {getElapsedWorkTime()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">Punch In: <span className="text-indigo-400 font-mono font-bold">{todayLog.clockIn}</span></span>
                    {todayLog.clockOut && (
                      <span className="text-slate-400">Out: <span className="text-rose-400 font-mono font-bold">{todayLog.clockOut}</span></span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400">Mark Status:</span>
                    {getStatusBadge(todayLog.status)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="my-8 p-4 bg-indigo-950/20 border border-indigo-500/15 rounded-2xl text-xs text-slate-400 leading-relaxed text-left">
              <p className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-4.5 h-4.5 text-indigo-400" />
                Administrative Console
              </p>
              Your account is not linked to an active employee profile. Review master rosters and override logs.
            </div>
          )}

          <div className="text-[10px] text-slate-500 font-medium">
            Daily logs close automatically at midnight.
          </div>
        </div>

        {/* Logs and Reports Grid */}
        <div className="glass-card p-6 bg-slate-900/30 lg:col-span-2 flex flex-col justify-between">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-white/5">
            <div>
              <h4 className="text-md font-bold text-slate-200">
                {isAdminOrManager ? 'Roster Attendance Logs' : 'My Punch-in History'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isAdminOrManager ? 'Search and override statuses for all employee cost units.' : 'Log entries for active working days.'}
              </p>
            </div>

            {/* Date filter (Admins only) */}
            {isAdminOrManager && (
              <div className="flex items-center gap-2 bg-slate-950/40 border border-white/5 px-3 py-1.5 rounded-xl">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-slate-300 text-xs font-semibold cursor-pointer"
                  style={{ width: '110px' }}
                />
              </div>
            )}
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-y-auto max-h-[340px]">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                <p className="text-slate-500 text-[11px] font-medium">Updating logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-20 text-center text-slate-500 text-xs">
                No logs recorded for this {isAdminOrManager ? 'specific date' : 'employee yet'}.
              </div>
            ) : (
              <table className="custom-table" style={{ margin: 0, width: '100%' }}>
                <thead>
                  <tr>
                    <th>{isAdminOrManager ? 'Employee' : 'Date'}</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Status</th>
                    {isAdminOrManager && <th className="text-right">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        {isAdminOrManager ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs uppercase">
                              {log.employee?.firstName.substring(0, 1)}{log.employee?.lastName.substring(0, 1)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-200 text-xs">{log.employee?.firstName} {log.employee?.lastName}</p>
                              <p className="text-[10px] text-slate-400">{log.employee?.jobTitle}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-semibold text-xs">{log.date}</span>
                        )}
                      </td>
                      <td>
                        <span className="font-mono text-slate-300 text-xs font-bold">{log.clockIn || '--:--'}</span>
                      </td>
                      <td>
                        <span className="font-mono text-slate-300 text-xs font-bold">{log.clockOut || '--:--'}</span>
                      </td>
                      <td>{getStatusBadge(log.status)}</td>
                      
                      {isAdminOrManager && (
                        <td className="text-right">
                          <select
                            value={log.status}
                            onChange={(e) => handleStatusOverride(log.id, e.target.value)}
                            className="glass-input text-[11px] py-1 px-2 w-28 glass-select"
                            style={{ paddingRight: '24px' }}
                          >
                            <option value="PRESENT">Present</option>
                            <option value="LATE">Late</option>
                            <option value="HALFDAY">Half Day</option>
                            <option value="ABSENT">Absent</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
