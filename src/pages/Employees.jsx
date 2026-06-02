import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  DollarSign, 
  Calendar,
  Building,
  UserCheck,
  Grid,
  List,
  MapPin,
  Tag
} from 'lucide-react';

export default function Employees({ user, showToast }) {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null); 

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [salary, setSalary] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [gender, setGender] = useState('MALE');
  const [address, setAddress] = useState('');

  const isAdminOrManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('ems_token');
      const response = await fetch('http://localhost:8888/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Could not fetch employee directory.');
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('ems_token');
      const response = await fetch('http://localhost:8888/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = () => {
    setCurrentEmployee(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setJobTitle('');
    setDateOfJoining(new Date().toISOString().split('T')[0]);
    setSalary('');
    setDepartmentId(departments[0]?.id || '');
    setStatus('ACTIVE');
    setGender('MALE');
    setAddress('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setCurrentEmployee(emp);
    setFirstName(emp.firstName);
    setLastName(emp.lastName);
    setEmail(emp.email);
    setPhone(emp.phone || '');
    setJobTitle(emp.jobTitle);
    setDateOfJoining(emp.dateOfJoining);
    setSalary(emp.salary);
    setDepartmentId(emp.department?.id || '');
    setStatus(emp.status);
    setGender(emp.gender || 'MALE');
    setAddress(emp.address || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !jobTitle || !dateOfJoining || !salary || !departmentId) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      jobTitle,
      dateOfJoining,
      salary: parseFloat(salary),
      departmentId: parseInt(departmentId),
      status,
      gender,
      address
    };

    const token = localStorage.getItem('ems_token');
    const isEditing = !!currentEmployee;
    const url = isEditing 
      ? `http://localhost:8888/api/employees/${currentEmployee.id}` 
      : 'http://localhost:8888/api/employees';

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Operation failed.');
      }

      showToast(
        isEditing ? 'Employee profile updated successfully.' : 'New employee registered successfully.', 
        'success'
      );
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this employee? This action is irreversible.')) {
      return;
    }

    const token = localStorage.getItem('ems_token');
    try {
      const response = await fetch(`http://localhost:8888/api/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not delete employee.');
      }

      showToast('Employee deleted successfully.', 'success');
      fetchEmployees();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filter and Search Logic
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const searchMatch = fullName.includes(search.toLowerCase()) ||
                        emp.email.toLowerCase().includes(search.toLowerCase()) ||
                        emp.jobTitle.toLowerCase().includes(search.toLowerCase());
    const deptMatch = !deptFilter || emp.department?.id === parseInt(deptFilter);
    return searchMatch && deptMatch;
  });

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return <span className="badge badge-active">Active</span>;
      case 'INACTIVE': return <span className="badge badge-inactive">Inactive</span>;
      case 'SUSPENDED': return <span className="badge badge-suspended">Suspended</span>;
      default: return <span className="badge badge-inactive">{status}</span>;
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Employee Directory</h2>
          <p className="text-xs text-slate-400">View and manage detailed employee records, structures, and workspace credentials.</p>
        </div>

        {isAdminOrManager && (
          <button onClick={openAddModal} className="btn-primary">
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        )}
      </div>

      {/* Filters & View Mode Card */}
      <div className="glass-card p-4 bg-slate-900/30 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-11"
          />
        </div>

        {/* Department Filter & View Mode Switcher */}
        <div className="flex gap-4 w-full md:w-auto items-center shrink-0">
          <div className="w-full md:w-56">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="glass-input glass-select"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Grid / List Switcher Buttons */}
          <div className="flex p-1 bg-black/35 rounded-xl border border-white/5 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Grid Cards View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              title="Table Spreadsheet View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Renders Based on View Mode */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <p className="text-slate-500 text-xs font-medium">Fetching directory index...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="glass-card py-20 text-center text-slate-500 text-sm">
          No employee records match the current filters.
        </div>
      ) : viewMode === 'grid' ? (
        
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="glass-card p-6 bg-slate-900/40 relative flex flex-col justify-between group overflow-hidden">
              
              {/* Header details */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  {/* Initials Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-md uppercase">
                    {emp.firstName.substring(0, 1)}{emp.lastName.substring(0, 1)}
                  </div>
                  
                  {/* Status badge */}
                  {getStatusBadge(emp.status)}
                </div>

                <h3 className="text-md font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                  {emp.firstName} {emp.lastName}
                </h3>
                <p className="text-xs text-indigo-300 font-medium flex items-center gap-1.5 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  {emp.jobTitle}
                </p>

                {/* Contact list details */}
                <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {emp.department?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action and financial details */}
              <div className="pt-5 border-t border-white/5 flex items-center justify-between mt-5 relative z-10">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Salary Bracket</p>
                  <p className="text-xs font-black text-slate-200">${emp.salary.toLocaleString()}/yr</p>
                </div>

                {isAdminOrManager && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(emp)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all duration-200"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all duration-200"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        
        /* TABLE LIST VIEW */
        <div className="glass-card bg-slate-900/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="custom-table" style={{ margin: '12px 20px', width: 'calc(100% - 40px)' }}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Job Title</th>
                  <th>Salary</th>
                  <th>Joined</th>
                  <th>Status</th>
                  {isAdminOrManager && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm uppercase">
                          {emp.firstName.substring(0, 1)}{emp.lastName.substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 text-sm">{emp.firstName} {emp.lastName}</p>
                          <p className="text-[11px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-slate-300 text-sm font-semibold bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                        {emp.department?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <p className="text-slate-300 text-sm font-medium">{emp.jobTitle}</p>
                    </td>
                    <td>
                      <p className="text-slate-200 text-sm font-bold">${emp.salary.toLocaleString()}</p>
                    </td>
                    <td>
                      <p className="text-slate-400 text-xs font-semibold">{emp.dateOfJoining}</p>
                    </td>
                    <td>{getStatusBadge(emp.status)}</td>
                    
                    {isAdminOrManager && (
                      <td className="text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all duration-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(emp.id)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all duration-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card bg-slate-900/90 border border-white/10 w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                {currentEmployee ? 'Edit Employee Profile' : 'Register New Employee'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Form Section 1: Personal Particulars */}
              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Personal Particulars
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="glass-input"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      className="glass-input"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane.smith@company.com"
                      className="glass-input"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="glass-input"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="glass-input glass-select"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other / Non-binary</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Section 2: Corporate & Professional Mapping */}
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Corporate Structure
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Job Title */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Job Title *</label>
                    <input
                      type="text"
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Software Engineer"
                      className="glass-input"
                    />
                  </div>

                  {/* Salary */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Annual Salary ($) *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-semibold text-sm">$</span>
                      <input
                        type="number"
                        required
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        placeholder="85000"
                        className="glass-input pl-8"
                      />
                    </div>
                  </div>

                  {/* Date of Joining */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Joining *</label>
                    <input
                      type="date"
                      required
                      value={dateOfJoining}
                      onChange={(e) => setDateOfJoining(e.target.value)}
                      className="glass-input"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cost Center Division *</label>
                    <select
                      required
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="glass-input glass-select"
                    >
                      <option value="" disabled>Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Employment Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="glass-input glass-select"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Section 3: Contact & Location */}
              <div className="pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Address Location
                </h4>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Residential Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street name, Suite, City, Zip"
                    rows={2}
                    className="glass-input"
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
                  {currentEmployee ? 'Save Profile Changes' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
