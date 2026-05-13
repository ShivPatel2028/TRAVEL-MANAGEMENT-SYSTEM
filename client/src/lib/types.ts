// File: client/src/lib/types.ts

export interface User {
  id: number;
  employeeId: string;
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  designation: string;
  phoneNumber: string;
  joiningDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface TravelRequest {
  id: number;
  userId: number;
  employeeId: string;
  userName: string;
  email: string;
  phoneNumber: string;
  department: string;
  fromLocation: string;
  toLocation: string;
  travelDate: string;
  returnDate: string;
  purpose: string;
  transportation: string;
  accommodation: string;
  miscExpenses: number;
  managerRemarks: string;
  financeRemarks: string;
  status: string;
  requestedBudget: number;
  approvedBudget: number | null;
  approvedBy: string | null;
  createdAt: string;
  
  // Report fields
  tripTitle: string | null;
  workCompleted: string | null;
  meetingDetails: string | null;
  travelSummary: string | null;
  issuesFaced: string | null;
  finalOutcome: string | null;
  reportSubmittedAt: string | null;

  actualExpense: number;
  expenses: Expense[];
  bills: Bill[];
  logs: RequestLog[];
}

export interface Expense {
  id: number;
  title: string;
  type: string; // Category
  estimatedAmount: number;
  actualAmount: number;
  date: string;
  notes: string | null;
}

export interface Bill {
  id: number;
  filePath: string;
  uploadDate: string;
}

export interface RequestLog {
  id: number;
  action: string;
  performedBy: string;
  timestamp: string;
}

export interface AdminDashboardStats {
  totalEmployees: number;
  totalTravelRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  reportSubmitted: number;
  reimbursed: number;
  recentRequests: {
    id: number;
    name: string;
    employeeId: string;
    toLocation: string;
    status: string;
    createdAt: string;
  }[];
}

export interface EmployeeDashboardStats {
  myTotalRequests: number;
  myPendingRequests: number;
  myApprovedRequests: number;
  myRejectedRequests: number;
  upcomingTrips: {
    id: number;
    toLocation: string;
    travelDate: string;
    returnDate: string;
    purpose: string;
  }[];
}
