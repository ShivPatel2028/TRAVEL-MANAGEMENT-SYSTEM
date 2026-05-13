// File: client/src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Sidebar() {
  const { user, isAdmin, isManager, isFinance, logout } = useAuth();
  const pathname = usePathname();
  const isAdminOrManager = isAdmin || isManager;

  const employeeLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/travel/new", label: "New Travel Request", icon: "✈️" },
    { href: "/travel/history", label: "Travel History", icon: "📋" },
    { href: "/profile", label: "My Profile", icon: "👤" },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/employees", label: "Employee Management", icon: "👥" },
    { href: "/admin/travel", label: "Travel Requests", icon: "✈️" },
    { href: "/profile", label: "My Profile", icon: "👤" },
  ];

  const financeLinks = [
    { href: "/finance", label: "Dashboard", icon: "📊" },
    { href: "/finance/travel", label: "Budget Reviews", icon: "💰" },
    { href: "/finance/expenses", label: "Expense Verification", icon: "🧾" },
    { href: "/profile", label: "My Profile", icon: "👤" },
  ];

  const links = isAdmin || isManager ? adminLinks : isFinance ? financeLinks : employeeLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="company-logo">🏢</div>
        <h2 className="company-name">TravelCorp</h2>
        <p className="company-subtitle">Travel Management</p>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${pathname === link.href ? "active" : ""}`}
          >
            <span className="nav-icon">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name}</p>
            <p className="user-role">{user?.role} • {user?.employeeId}</p>
          </div>
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </aside>
  );
}
