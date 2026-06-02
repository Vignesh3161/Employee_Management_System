import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Building, LayoutGrid } from 'lucide-react';

export default function Departments({ user, showToast }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState(null); // null means adding

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const isAdmin = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('ems_token');
      const response = await fetch('http://localhost:8888/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Could not fetch corporate departments.');
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setCurrentDept(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (dept) => {
    setCurrentDept(dept);
    setName(dept.name);
    setDescription(dept.description || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Department name is required.', 'warning');
      return;
    }

    const payload = { name, description };
    const token = localStorage.getItem('ems_token');
    const isEditing = !!currentDept;
    const url = isEditing 
      ? `http://localhost:8888/api/departments/${currentDept.id}` 
      : 'http://localhost:8888/api/departments';

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
        throw new Error(data.message || 'Department operation failed.');
      }

      showToast(
        isEditing ? 'Department updated successfully.' : 'New department established successfully.', 
        'success'
      );
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (dept) => {
    const headcount = dept.employees?.length || 0;
    if (headcount > 0) {
      showToast(
        `Cannot delete "${dept.name}" because it contains ${headcount} employee(s). Reassign them first!`, 
        'error'
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the department "${dept.name}"?`)) {
      return;
    }

    const token = localStorage.getItem('ems_token');
    try {
      const response = await fetch(`http://localhost:8888/api/departments/${dept.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Could not remove department.');
      }

      showToast('Department deleted successfully.', 'success');
      fetchDepartments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Corporate Departments</h2>
          <p className="text-xs text-slate-400">Manage business units, cost centers, descriptions, and view allocations.</p>
        </div>

        {isAdmin && (
          <button onClick={openAddModal} className="btn-primary">
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="glass-card p-4 bg-slate-900/30 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search departments by name or description keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input pl-11"
          />
        </div>
      </div>

      {/* Departments Grid Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
          <p className="text-slate-500 text-xs font-medium">Fetching divisions...</p>
        </div>
      ) : filteredDepts.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-sm">
          No departments found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepts.map((dept) => {
            const headcount = dept.employees?.length || 0;
            return (
              <div key={dept.id} className="glass-card p-6 bg-slate-900/40 relative flex flex-col justify-between group overflow-hidden">
                <div className="absolute top-0 right-0 p-3 text-indigo-500/5 group-hover:text-indigo-500/10 transition-colors pointer-events-none">
                  <Building className="w-28 h-28" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                      <Building className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full">
                      Cost Center ID: #{dept.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100">{dept.name}</h3>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed h-12 overflow-hidden text-ellipsis">
                    {dept.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-4 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-slate-300">{headcount} Headcount</span>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(dept)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all duration-200"
                        title="Edit Department"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all duration-200"
                        title="Delete Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card bg-slate-900/90 border border-white/10 w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-indigo-400" />
                {currentDept ? 'Modify Corporate Division' : 'Establish New Department'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Department Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Building className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Engineering"
                    className="glass-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the core focus and operational mandate of this cost center."
                  rows={3}
                  className="glass-input"
                  style={{ resize: 'none' }}
                />
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
                  {currentDept ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
