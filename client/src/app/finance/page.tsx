"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardCard from "@/components/DashboardCard";
import StatusBadge from "@/components/StatusBadge";
import ProtectedRoute from "@/components/ProtectedRoute";
import { travelApi } from "@/lib/api";
import Link from "next/link";

export default function FinanceDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await travelApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={["Finance", "Admin"]}>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header title="Finance Dashboard" />

          {loading ? (
            <div className="loading-inline">Loading statistics...</div>
          ) : (
            <>
              <div className="dashboard-cards">
                <DashboardCard
                  title="Total Budget Requested"
                  value={`₹${stats?.totalBudgetRequested?.toLocaleString("en-IN")}`}
                  icon="💰"
                  color="#1e3a5f"
                />
                <DashboardCard
                  title="Total Budget Approved"
                  value={`₹${stats?.totalBudgetApproved?.toLocaleString("en-IN")}`}
                  icon="✅"
                  color="#3182ce"
                />
                <DashboardCard
                  title="Pending Budget Approval"
                  value={stats?.pendingFinance || 0}
                  icon="⏳"
                  color="#d69e2e"
                />
                <DashboardCard
                  title="Pending Expense Review"
                  value={stats?.expenseSubmitted || 0}
                  icon="🧾"
                  color="#e53e3e"
                />
              </div>

              <div className="dashboard-cards" style={{ marginTop: "24px" }}>
                <DashboardCard
                   title="Total Actual Spending"
                   value={`₹${stats?.totalActualExpense?.toLocaleString("en-IN")}`}
                   icon="📊"
                   color="#38a169"
                />
                <DashboardCard
                  title="Reimbursements Done"
                  value={stats?.reimbursed || 0}
                  icon="💸"
                  color="#805ad5"
                />
              </div>

              {/* Finance Quick Actions */}
              <div className="section-card" style={{ marginTop: "24px" }}>
                <h3>Finance Quick Actions</h3>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
                  <Link href="/finance/travel" className="btn btn-primary">
                    💰 Review Travel Budgets
                  </Link>
                  <Link href="/finance/expenses" className="btn btn-outline">
                    🧾 Verify Expense Claims
                  </Link>
                </div>
              </div>

              <div className="login-footer" style={{ marginTop: "auto", paddingTop: "40px", textAlign: "center", color: "#718096" }}>
                 <p>© 2026 TravelCorp. Internal Finance Portal.</p>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
