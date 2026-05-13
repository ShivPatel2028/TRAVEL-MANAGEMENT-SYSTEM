// File: client/src/lib/api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    throw new Error("Unauthorized");
  }

  if (res.status === 403) {
    throw new Error("Access denied");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return res.json();
}

// Auth
export const authApi = {
  login: (idOrUsername: string, password: string) => {
    // Try to detect if it's an employee ID (starts with EMP) or a username
    const body = idOrUsername.toUpperCase().startsWith("EMP") 
      ? { employeeId: idOrUsername, password }
      : { username: idOrUsername, password };

    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  createEmployee: (data: {
    employeeId: string;
    username: string;
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    department?: string;
    designation?: string;
    role?: string;
  }) =>
    request("/auth/create-employee", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// User / Employee Management
export const userApi = {
  getProfile: () => request("/user/profile"),

  updateProfile: (data: { name?: string; phoneNumber?: string }) =>
    request("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getAllEmployees: () => request("/user/all"),

  getEmployee: (id: number) => request(`/user/${id}`),

  updateEmployee: (
    id: number,
    data: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      department?: string;
      designation?: string;
      role?: string;
      isActive?: boolean;
    }
  ) =>
    request(`/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteEmployee: (id: number) =>
    request(`/user/${id}`, { method: "DELETE" }),

  resetPassword: (id: number, newPassword: string) =>
    request(`/user/${id}/reset-password`, {
      method: "PUT",
      body: JSON.stringify({ newPassword }),
    }),

  getDashboardStats: () => request("/user/dashboard-stats"),
};

// Travel Requests
export const travelApi = {
  createRequest: (data: {
    fromLocation: string;
    toLocation: string;
    travelDate: string;
    returnDate: string;
    purpose: string;
    transportation?: string;
    accommodation?: string;
    requestedBudget: number;
    miscExpenses?: number;
  }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    return request("/travel/request", {
      method: "POST",
      body: formData,
    });
  },

  getAllRequests: () => request("/travel/all"),

  getMyRequests: () => request("/travel/my-requests"),

  approveRequest: (id: number, approvedBudget?: number, remarks?: string) =>
    request(`/travel/approve/${id}`, {
      method: "PUT",
      body: JSON.stringify({ approvedBudget, remarks }),
    }),

  rejectRequest: (id: number, remarks?: string) =>
    request(`/travel/reject/${id}`, {
      method: "PUT",
      body: JSON.stringify({ remarks }),
    }),

  financeApprove: (id: number, remarks?: string) =>
    request(`/travel/finance-approve/${id}`, {
      method: "PUT",
      body: JSON.stringify({ remarks }),
    }),

  financeReject: (id: number, remarks?: string) =>
    request(`/travel/finance-reject/${id}`, {
      method: "PUT",
      body: JSON.stringify({ remarks }),
    }),

  submitReport: (id: number, report: any, expenses: any[], files: File[]) => {
    const formData = new FormData();
    formData.append("reportJson", JSON.stringify(report));
    formData.append("expensesJson", JSON.stringify(expenses));
    files.forEach(file => {
      formData.append("receipts", file);
    });
    return request(`/travel/submit-report/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  validateReport: (id: number, isValid: boolean) =>
    request(`/travel/validate-bill/${id}`, {
      method: "PUT",
      body: JSON.stringify(isValid),
    }),

  getStats: () => request("/travel/stats"),
};
