"use client";

// --- Mentorship Note ---
// This is the main dashboard page (the "/" route).
// It is protected by our middleware — only logged-in users reach here.
// We use the useAuth() hook to display the user's email and provide a logout button.

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        color: "var(--color-text)",
      }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: "700" }}>
        Welcome to Chitti Dashboard 🎉
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        Logged in as: <strong>{user?.email}</strong>
      </p>
      <button
        onClick={handleLogout}
        style={{
          padding: "10px 24px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "8px",
          color: "var(--color-text)",
          cursor: "pointer",
          fontSize: "14px",
          fontFamily: "var(--font-sans)",
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
