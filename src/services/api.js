const API_BASE_URL = 'https://java-application-latest-q1ml.onrender.com/api';

const getHeaders = () => {
  const token = localStorage.getItem('ems_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const isLoginRequest = response.url && response.url.includes('/auth/login');

  if ((response.status === 401 || response.status === 403) && !isLoginRequest) {
    // Session expired or unauthorized
    localStorage.removeItem('ems_token');
    localStorage.removeItem('ems_user');
    window.dispatchEvent(new Event('auth-change'));
    throw new Error('Session expired or unauthorized');
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMsg = (data && data.message) || response.statusText || 'An error occurred';
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth API
  auth: {
    login: async (username, password) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, password }),
      });
      return handleResponse(response);
    },
    register: async (userData) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },
    me: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    }
  },

  // Dashboard API
  dashboard: {
    getStats: async () => {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    }
  },

  // Employees API
  employees: {
    getAll: async (search = '') => {
      const url = search ? `${API_BASE_URL}/employees?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/employees`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getByDepartment: async (deptId) => {
      const response = await fetch(`${API_BASE_URL}/employees/department/${deptId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    create: async (employeeData) => {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(employeeData),
      });
      return handleResponse(response);
    },
    update: async (id, employeeData) => {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(employeeData),
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(response);
    }
  },

  // Departments API
  departments: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    create: async (departmentData) => {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(departmentData),
      });
      return handleResponse(response);
    },
    update: async (id, departmentData) => {
      const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(departmentData),
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(response);
    }
  },

  // Leave Requests API
  leaves: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/leaves`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getByEmployee: async (employeeId) => {
      const response = await fetch(`${API_BASE_URL}/leaves/employee/${employeeId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    create: async (leaveData) => {
      const response = await fetch(`${API_BASE_URL}/leaves`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(leaveData),
      });
      return handleResponse(response);
    },
    approveOrReject: async (id, status, remarks = '') => {
      const response = await fetch(`${API_BASE_URL}/leaves/${id}/approve?status=${status}&remarks=${encodeURIComponent(remarks)}`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      return handleResponse(response);
    }
  },

  // Attendance API
  attendance: {
    getAll: async (date = '') => {
      const url = date ? `${API_BASE_URL}/attendance?date=${date}` : `${API_BASE_URL}/attendance`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getByEmployee: async (employeeId) => {
      const response = await fetch(`${API_BASE_URL}/attendance/employee/${employeeId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    clockIn: async (attendanceDto) => {
      const response = await fetch(`${API_BASE_URL}/attendance/clock-in`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(attendanceDto),
      });
      return handleResponse(response);
    },
    clockOut: async (attendanceDto) => {
      const response = await fetch(`${API_BASE_URL}/attendance/clock-out`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(attendanceDto),
      });
      return handleResponse(response);
    },
    updateStatus: async (id, status) => {
      const response = await fetch(`${API_BASE_URL}/attendance/${id}/status?status=${status}`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      return handleResponse(response);
    }
  }
};
