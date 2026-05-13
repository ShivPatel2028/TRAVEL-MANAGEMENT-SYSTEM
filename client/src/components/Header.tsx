// File: client/src/components/Header.tsx
"use client";

import { useAuth } from "@/lib/auth";

export default function Header({ title }: { title: string }) {
  const { user } = useAuth();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-date">{today}</p>
      </div>
      <div className="header-right">
        <span className="welcome-text">Welcome, {user?.name}</span>
      </div>
    </header>
  );
}
