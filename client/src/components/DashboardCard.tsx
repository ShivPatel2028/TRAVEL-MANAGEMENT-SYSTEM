// File: client/src/components/DashboardCard.tsx
"use client";

interface Props {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

export default function DashboardCard({ title, value, icon, color = "#1e3a5f" }: Props) {
  return (
    <div className="dashboard-card" style={{ borderLeftColor: color }}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <p className="card-value">{value}</p>
        <p className="card-title">{title}</p>
      </div>
    </div>
  );
}
