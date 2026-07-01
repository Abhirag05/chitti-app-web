"use client";

// --- Mentorship Note ---
// This is the Registration page (/register route).
// We use Firebase's createUserWithEmailAndPassword function.
// It is almost identical to the login page, just a different Firebase function.
// Notice how we reuse the exact same CSS classes from globals.css — this is the
// power of having a design system. Consistent UI with zero extra CSS needed.

import { useState, FormEvent } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation before even calling Firebase
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // createUserWithEmailAndPassword creates a new user in Firebase Auth.
      // On success, Firebase ALSO automatically logs in the new user.
      // So after registration, the user is instantly authenticated.
      await createUserWithEmailAndPassword(auth, email, password);

      // The onAuthStateChanged listener in AuthContext will fire automatically,
      // set the session cookie, and then we redirect to the dashboard.
      router.replace("/");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err) {
        const firebaseError = err as { code: string };
        switch (firebaseError.code) {
          case "auth/email-already-in-use":
            setError("An account with this email already exists.");
            break;
          case "auth/invalid-email":
            setError("Please enter a valid email address.");
            break;
          case "auth/weak-password":
            setError("Password is too weak. Use at least 6 characters.");
            break;
          default:
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
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">Chitti App — Financial Dashboard</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
              placeholder="Minimum 6 characters"
              className="form-input"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="form-input"
              required
              autoComplete="new-password"
            />
          </div>

          {/* Error message */}
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
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Link back to Login */}
        <p className="auth-switch-text">
          Already have an account?{" "}
          <Link href="/login" className="auth-switch-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
