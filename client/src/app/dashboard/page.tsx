// File: client/src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardCard from "@/components/DashboardCard";
import StatusBadge from "@/components/StatusBadge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { userApi, travelApi } from "@/lib/api";
import { EmployeeDashboardStats, TravelRequest } from "@/lib/types";
import Link from "next/link";

export default function EmployeeDashboard() {
  const [stats, setStats] = useState<EmployeeDashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<TravelRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsData, requestsData] = await Promise.all([
        userApi.getDashboardStats(),
        travelApi.getMyRequests(),
      ]);
      setStats(statsData);
      setRecentRequests(requestsData.slice(0, 5));
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Employee Dashboard" />

          {loading ? (
            <div className="loading-inline">Loading dashboard...</div>
          ) : (
            <>
              <div className="dashboard-cards">
                <DashboardCard
                  title="Total Requests"
                  value={stats?.myTotalRequests || 0}
                  icon="📋"
                  color="#1e3a5f"
                />
                <DashboardCard
                  title="Pending Approval"
                  value={stats?.myPendingRequests || 0}
                  icon="⏳"
                  color="#d69e2e"
                />
                <DashboardCard
                  title="Final Approved"
                  value={stats?.myApprovedRequests || 0}
                  icon="✅"
                  color="#38a169"
                />
                <DashboardCard
                  title="Rejected/Returned"
                  value={stats?.myRejectedRequests || 0}
                  icon="❌"
                  color="#e53e3e"
                />
              </div>

              {/* Quick Actions */}
              <div className="section-card">
                <h3>Quick Actions</h3>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Link href="/travel/new" className="btn btn-primary">
                    ✈️ New Travel Request
                  </Link>
                  <Link href="/travel/history" className="btn btn-outline">
                    📋 View Travel History
                  </Link>
                  <Link href="/profile" className="btn btn-outline">
                    👤 My Profile
                  </Link>
                </div>
              </div>

              {/* Upcoming Trips */}
              {stats?.upcomingTrips && stats.upcomingTrips.length > 0 && (
                <div className="section-card">
                  <h3>Upcoming Trips</h3>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Destination</th>
                        <th>Travel Date</th>
                        <th>Return Date</th>
                        <th>Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.upcomingTrips.map((trip) => (
                        <tr key={trip.id}>
                          <td>{trip.toLocation}</td>
                          <td>
                            {new Date(trip.travelDate).toLocaleDateString("en-IN")}
                          </td>
                          <td>
                            {new Date(trip.returnDate).toLocaleDateString("en-IN")}
                          </td>
                          <td>{trip.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Recent Requests */}
              <div className="data-table-wrapper">
                <div className="table-header">
                  <h3>Recent Travel Requests</h3>
                  <Link href="/travel/history" className="btn btn-sm btn-outline">
                    View All
                  </Link>
                </div>
                {recentRequests.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Destination</th>
                        <th>Travel Date</th>
                        <th>Purpose</th>
                        <th>Status</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((req) => (
                        <tr key={req.id}>
                          <td>{req.toLocation}</td>
                          <td>
                            {new Date(req.travelDate).toLocaleDateString("en-IN")}
                          </td>
                          <td>{req.purpose.substring(0, 40)}...</td>
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
                    <p>No travel requests yet. Submit your first request!</p>
                  </div>
                )}
              </div>

              {/* Company Travel Policy */}
              <div className="section-card">
                <h3>Company Travel Policy</h3>
                <div className="policy-card">
                  <h4>General Guidelines</h4>
                  <ul>
                    <li>All official travel must be pre-approved by your manager</li>
                    <li>Submit travel requests at least 5 business days in advance</li>
                    <li>Keep all receipts and bills for reimbursement</li>
                    <li>Economy class for flights under 4 hours</li>
                    <li>Daily allowance as per company policy for meals</li>
                  </ul>
                </div>
              </div>
              <div style={{ textAlign: "center", padding: "40px", color: "#718096", fontSize: "14px" }}>
                 <p>© 2026 TravelCorp. All rights reserved.</p>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
