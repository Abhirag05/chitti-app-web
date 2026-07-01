"use client";

// --- Mentorship Note ---
// "use client" is a Next.js directive. It tells Next.js that this component
// runs in the BROWSER, not on the server. It is required for any component
// that uses browser-only features like useState, useEffect, or event handlers.
// Since our login form needs user interaction (onClick, onChange), it MUST be a Client Component.

import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission (page reload)
    setError("");
    setLoading(true);

    try {
      // signInWithEmailAndPassword is the Firebase function to log in.
      // It returns the logged-in user object on success.
      // It throws an error on failure (wrong password, user not found, etc.)
      await signInWithEmailAndPassword(auth, email, password);

      // On success, redirect to the main dashboard page.
      // router.replace instead of router.push means the login page is removed
      // from history — the user can't press "Back" to return to login.
      router.replace("/");
    } catch (err: unknown) {
      // Firebase gives detailed error codes. We translate them into friendly messages.
      if (err && typeof err === "object" && "code" in err) {
        const firebaseError = err as { code: string };
        if (
          firebaseError.code === "auth/user-not-found" ||
          firebaseError.code === "auth/wrong-password" ||
          firebaseError.code === "auth/invalid-credential"
        ) {
          setError("Invalid email or password. Please try again.");
        } else {
          setError("Something went wrong. Please try again later.");
        }
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-logo">₹</div>
          <h1 className="login-title">Chitti App</h1>
          <p className="login-subtitle">Financial Management Dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="form-input"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Error message shown when login fails */}
          {error && (
            <div className="form-error" role="alert">
              <span>⚠ </span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <span className="button-loading">
                <span className="spinner" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Link to Registration */}
        <p className="auth-switch-text">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="auth-switch-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
