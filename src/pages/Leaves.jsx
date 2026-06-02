import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  X, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Umbrella,
  HeartPulse,
  Award,
  CircleDollarSign
} from 'lucide-react';

export default function Leaves({ user, showToast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Remarks state for approving/rejecting
  const [activeRemarkId, setActiveRemarkId] = useState(null);
  const [remarks, setRemarks] = useState('');

  const employeeId = user?.employeeId;
  const isAdminOrManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem('ems_token');
    try {
      if (isAdminOrManager) {
        // Fetch all requests
        const response = await fetch('http://localhost:8888/api/leaves', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setRequests(data.reverse()); 
        }
      } else if (employeeId) {
        // Fetch personal requests
        const response = await fetch(`http://localhost:8888/api/leaves/employee/${employeeId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setRequests(data.reverse());
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error syncing leave applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();

    if (!employeeId) {
      showToast('No linked employee profile found to request leaves.', 'warning');
      return;
    }

    if (!startDate || !endDate || !reason.trim()) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast('Start date cannot be after end date.', 'warning');
      return;
    }

    const payload = {
      employeeId,
      startDate,
      endDate,
      leaveType,
      reason
    };

    const token = localStorage.getItem('ems_token');
    try {
      const response = await fetch('http://localhost:8888/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Time-off booking failed.');
      }

      showToast('Leave request submitted successfully.', 'success');
      setIsModalOpen(false);
      
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      setLeaveType('CASUAL');

      fetchRequests();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleProcessRequest = async (id, status) => {
    if (!remarks.trim() && status === 'REJECTED') {
      showToast('Please enter manager remarks when rejecting requests.', 'warning');
      return;
    }

    const token = localStorage.getItem('ems_token');
    try {
      const response = await fetch(`http://localhost:8888/api/leaves/${id}/approve?status=${status}&remarks=${encodeURIComponent(remarks)}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to process leave approval.');

      showToast(`Leave request ${status.toLowerCase()} successfully.`, 'success');
      setActiveRemarkId(null);
      setRemarks('');
      fetchRequests();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return <span className="badge badge-pending">Pending Approval</span>;
      case 'APPROVED': return <span className="badge badge-approved">Approved</span>;
      case 'REJECTED': return <span className="badge badge-rejected">Rejected</span>;
      default: return <span className="badge badge-inactive">{status}</span>;
    }
  };

  const getLeaveLabel = (type) => {
    switch (type?.toUpperCase()) {
      case 'SICK': return 'Sick Leave';
      case 'CASUAL': return 'Casual Leave';
      case 'VACATION': return 'Vacation';
      case 'UNPAID': return 'Unpaid Leave';
      default: return type;
    }
  };

  // Color map for leave category tags
  const getLeaveTagStyle = (type) => {
    switch (type?.toUpperCase()) {
      case 'SICK': return 'text-sky-400 bg-sky-950/20 border border-sky-500/10';
      case 'CASUAL': return 'text-amber-400 bg-amber-950/20 border border-amber-500/10';
      case 'VACATION': return 'text-purple-400 bg-purple-950/20 border border-purple-500/10';
      default: return 'text-slate-400 bg-slate-950/20 border border-slate-500/10';
    }
  };

  // Helper values for personal leave summaries
  const leaveSummary = [
    { title: 'Vacation', icon: <Umbrella className="w-5 h-5 text-purple-400" />, limit: '18 Days', spent: '12 allocated', glow: 'shadow-purple-950/20 border-purple-500/10' },
    { title: 'Casual Leave', icon: <Award className="w-5 h-5 text-amber-400" />, limit: '12 Days', spent: '4 allocated', glow: 'shadow-amber-950/20 border-amber-500/10' },
    { title: 'Sick Leave', icon: <HeartPulse className="w-5 h-5 text-sky-400" />, limit: '10 Days', spent: '2 allocated', glow: 'shadow-sky-950/20 border-sky-500/10' },
    { title: 'Unpaid Days', icon: <CircleDollarSign className="w-5 h-5 text-rose-400" />, limit: 'No Limit', spent: '0 allocated', glow: 'shadow-rose-950/20 border-rose-500/10' }
  ];

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Time Off Requests</h2>
          <p className="text-xs text-slate-400">File leave applications and manage department approval pipelines.</p>
        </div>

        {employeeId && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="w-5 h-5" />
            Apply For Leave
          </button>
        )}
      </div>

      {/* Leave Balance Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {leaveSummary.map((sum, i) => (
          <div key={i} className={`glass-card p-5 bg-slate-900/40 border flex items-center gap-4 relative overflow-hidden ${sum.glow}`}>
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-slate-200">
              {sum.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{sum.title}</p>
              <h3 className="text-lg font-black text-slate-100 mt-0.5">{sum.limit}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{sum.spent}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Roster / Applications list */}
      <div className="glass-card bg-slate-900/20 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
            <p className="text-slate-500 text-xs font-medium">Fetching time-off records...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            No time-off requests filed {isAdminOrManager ? 'across the workspace' : 'by you yet'}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="custom-table" style={{ margin: '12px 20px', width: 'calc(100% - 40px)' }}>
              <thead>
                <tr>
                  <th>{isAdminOrManager ? 'Employee' : 'Leave Type'}</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Remarks / Review</th>
                  <th>Status</th>
                  {isAdminOrManager && <th className="text-right">Review Action</th>}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      {isAdminOrManager ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-xs uppercase">
                            {req.employee?.firstName.substring(0, 1)}{req.employee?.lastName.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200 text-xs">{req.employee?.firstName} {req.employee?.lastName}</p>
                            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${getLeaveTagStyle(req.leaveType)}`}>
                              {getLeaveLabel(req.leaveType)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getLeaveTagStyle(req.leaveType)}`}>
                          {getLeaveLabel(req.leaveType)}
                        </span>
                      )}
                    </td>
                    <td>
                      <div>
                        <p className="text-slate-300 text-xs font-bold font-mono">{req.startDate} to {req.endDate}</p>
                        <p className="text-[9px] text-indigo-400 font-bold mt-0.5">
                          {Math.round((new Date(req.endDate) - new Date(req.startDate)) / (1000 * 60 * 60 * 24)) + 1} Calendar Days
                        </p>
                      </div>
                    </td>
                    <td>
                      <p className="text-slate-400 text-xs max-w-xs leading-relaxed truncate" title={req.reason}>
                        {req.reason}
                      </p>
                    </td>
                    <td>
                      <p className="text-slate-400 text-xs italic max-w-xs truncate">
                        {req.managerRemarks || <span className="text-slate-600 font-medium">No remarks logged</span>}
                      </p>
                    </td>
                    <td>{getStatusBadge(req.status)}</td>
                    
                    {isAdminOrManager && (
                      <td className="text-right">
                        {req.status === 'PENDING' ? (
                          activeRemarkId === req.id ? (
                            <div className="flex flex-col gap-2 w-48 ml-auto animate-fade-in">
                              <input
                                type="text"
                                placeholder="Enter review remarks..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="glass-input text-[11px] py-1 px-2.5"
                              />
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => handleProcessRequest(req.id, 'APPROVED')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleProcessRequest(req.id, 'REJECTED')}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold transition-all"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => { setActiveRemarkId(null); setRemarks(''); }}
                                  className="px-2 py-1 bg-white/10 hover:bg-white/15 text-slate-300 rounded text-[10px] font-semibold transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setActiveRemarkId(req.id); setRemarks(''); }}
                              className="px-3.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-semibold transition-all duration-200"
                            >
                              Review Request
                            </button>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Processed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card bg-slate-900/90 border border-white/10 w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                Book Personal Leave
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleApplyLeave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Leave Type */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Leave Category *</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="glass-input glass-select"
                  >
                    <option value="CASUAL">Casual Leave (General Time Off)</option>
                    <option value="SICK">Sick Leave (Medical Emergency)</option>
                    <option value="VACATION">Annual Paid Vacation</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Date *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Calendar className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="glass-input pl-10"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">End Date *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Calendar className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="glass-input pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detailed Reason *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 flex items-center pointer-events-none text-slate-500">
                    <FileText className="w-4.5 h-4.5" />
                  </span>
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a comprehensive reason for booking time off to inform your manager's approval..."
                    rows={4}
                    className="glass-input pl-10"
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
