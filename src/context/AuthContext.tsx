"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../../lib/firebase";

// --- Mentorship Note ---
// A "Context" in React is a way to share data globally across your entire app
// without having to pass it as a prop through every single component.
// Think of it like a "store" that any component can subscribe to.
// Here, we are storing the logged-in user object so any component can access it.

interface AuthContextType {
  user: User | null;       // The Firebase user object. null means not logged in.
  loading: boolean;         // True while Firebase is checking the login state on app start.
  logout: () => Promise<void>; // A function to log the user out from anywhere in the app.
}

// Step 1: Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

// Step 2: Create the Provider component
// This component wraps our entire app and "provides" the auth state to all children.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged is a Firebase listener.
    // It fires every time the user's login state changes (login, logout, or on app start).
    // This is the core of our authentication system.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser); // Set the user (or null if logged out)
      setLoading(false);     // We now know the auth state, stop loading

      // --- Mentorship Note on Cookies ---
      // Our middleware needs a signal to know if someone is logged in.
      // Since middleware runs on the server and can't read Firebase state directly,
      // we use a simple browser cookie as a "flag".
      // When Firebase confirms user is logged in → set the cookie.
      // When Firebase confirms user is logged out → delete the cookie.
      if (firebaseUser) {
        // Set a session cookie (no expiry = session cookie, deleted when browser closes)
        document.cookie = "chitti-auth-session=true; path=/; SameSite=Strict";
      } else {
        // Delete the cookie by setting its expiry to the past
        document.cookie =
          "chitti-auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
      }
    });

    // Cleanup: When the component unmounts, stop listening to avoid memory leaks.
    return () => unsubscribe();
  }, []);

  // Logout function — can be called from any component using useAuth()
  const logout = async () => {
    await signOut(auth);
    // Cookie will be cleared automatically by the onAuthStateChanged listener above
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 3: Create a custom hook for easy access
// Instead of writing useContext(AuthContext) everywhere, we write useAuth().
export function useAuth() {
  return useContext(AuthContext);
}
