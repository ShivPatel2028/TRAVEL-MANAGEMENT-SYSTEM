// File: client/src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardCard from "@/components/DashboardCard";
import StatusBadge from "@/components/StatusBadge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { userApi } from "@/lib/api";
import { AdminDashboardStats } from "@/lib/types";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await userApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={["Admin", "Manager"]}>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Admin Dashboard" />

          {loading ? (
            <div className="loading-inline">Loading dashboard...</div>
          ) : (
            <>
              <div className="dashboard-cards">
                <DashboardCard
                  title="Total Employees"
                  value={stats?.totalEmployees || 0}
                  icon="👥"
                  color="#1e3a5f"
                />
                <DashboardCard
                  title="Travel Requests"
                  value={stats?.totalTravelRequests || 0}
                  icon="📋"
                  color="#3182ce"
                />
                <DashboardCard
                  title="Pending Approval"
                  value={stats?.pendingRequests || 0}
                  icon="⏳"
                  color="#d69e2e"
                />
                <DashboardCard
                  title="Approved"
                  value={stats?.approvedRequests || 0}
                  icon="✅"
                  color="#38a169"
                />
              </div>

              {/* Quick Actions */}
              <div className="section-card">
                <h3>Quick Actions</h3>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Link href="/admin/employees" className="btn btn-primary">
                    👥 Manage Employees
                  </Link>
                  <Link href="/admin/travel" className="btn btn-outline">
                    ✈️ Travel Requests
                  </Link>
                </div>
              </div>

              {/* Recent Travel Requests */}
              <div className="data-table-wrapper">
                <div className="table-header">
                  <h3>Recent Travel Requests</h3>
                  <Link href="/admin/travel" className="btn btn-sm btn-outline">
                    View All
                  </Link>
                </div>
                {stats?.recentRequests && stats.recentRequests.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Employee ID</th>
                        <th>Destination</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentRequests.map((req) => (
                        <tr key={req.id}>
                          <td>{req.name}</td>
                          <td>{req.employeeId}</td>
                          <td>{req.toLocation}</td>
                          <td>
                            <StatusBadge status={req.status} />
                          </td>
                          <td>
                            {new Date(req.createdAt).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <p>No travel requests yet.</p>
                  </div>
                )}
              </div>
              <div style={{ textAlign: "center", padding: "40px", color: "#718096", fontSize: "14px" }}>
                 <p>© 2026 TravelCorp. Administrative Portal.</p>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
