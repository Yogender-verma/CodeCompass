import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  firebaseSignOut,
  onAuthStateChanged,
  isFirebaseConfigured,
} from "../firebase/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [configStatus, setConfigStatus] = useState(false);

  useEffect(() => {
    const configured = isFirebaseConfigured();
    setConfigStatus(configured);

    // Check for demo user session in localStorage first if Firebase is not configured
    const demoUserRaw = localStorage.getItem("codecompass_demo_user");
    if (demoUserRaw && !configured) {
      try {
        const parsed = JSON.parse(demoUserRaw);
        setUser(parsed);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("codecompass_demo_user");
      }
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    // Subscribe to Firebase Auth state changes (persisted session)
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          setUser({
            uid: currentUser.uid,
            displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Developer",
            email: currentUser.email || "developer@codecompass.dev",
            photoURL:
              currentUser.photoURL ||
              `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.email || "developer"}`,
            isAnonymous: currentUser.isAnonymous,
            providerId: currentUser.providerData[0]?.providerId || "password",
          });
          localStorage.removeItem("codecompass_demo_user");
        } else {
          // If no firebase user, check if we had demo user
          const demo = localStorage.getItem("codecompass_demo_user");
          if (demo) {
            try {
              setUser(JSON.parse(demo));
            } catch (e) {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      },
      (err) => {
        console.error("Auth state change error:", err);
        setAuthError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Helper to translate Firebase error codes to friendly strings
  const formatAuthError = (err) => {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Invalid email or password. Please check your credentials.";
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Please sign in instead.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/operation-not-allowed":
        return "Email/Password sign-in is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.";
      case "auth/popup-closed-by-user":
        return "Sign-in cancelled: The Google popup window was closed.";
      case "auth/popup-blocked":
        return "Sign-in popup was blocked by your browser. Please allow popups.";
      case "auth/unauthorized-domain":
        return "Domain not authorized in Firebase Console. Add 'localhost' under Authentication > Settings > Authorized domains.";
      default:
        return err.message || "An authentication error occurred.";
    }
  };

  // 1. Google Authentication
  const loginWithGoogle = async () => {
    setAuthError(null);
    setLoading(true);

    if (!isFirebaseConfigured() || !auth) {
      setLoading(false);
      setAuthError("FIREBASE_NOT_CONFIGURED");
      throw new Error("FIREBASE_NOT_CONFIGURED");
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;
      const userPayload = {
        uid: currentUser.uid,
        displayName: currentUser.displayName || "Open Source Contributor",
        email: currentUser.email,
        photoURL:
          currentUser.photoURL ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.email}`,
        providerId: "google.com",
      };
      setUser(userPayload);
      return userPayload;
    } catch (err) {
      console.error("Google sign-in failed:", err);
      const friendlyMessage = formatAuthError(err);
      setAuthError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // 2. Email/Password Login
  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    setLoading(true);

    if (!isFirebaseConfigured() || !auth) {
      setLoading(false);
      setAuthError("FIREBASE_NOT_CONFIGURED");
      throw new Error("FIREBASE_NOT_CONFIGURED");
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = result.user;
      const userPayload = {
        uid: currentUser.uid,
        displayName: currentUser.displayName || email.split("@")[0] || "Developer",
        email: currentUser.email,
        photoURL:
          currentUser.photoURL ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.email}`,
        providerId: "password",
      };
      setUser(userPayload);
      return userPayload;
    } catch (err) {
      console.error("Email login failed:", err);
      const message = formatAuthError(err);
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Email/Password Signup
  const signupWithEmail = async (name, email, password) => {
    setAuthError(null);
    setLoading(true);

    if (!isFirebaseConfigured() || !auth) {
      setLoading(false);
      setAuthError("FIREBASE_NOT_CONFIGURED");
      throw new Error("FIREBASE_NOT_CONFIGURED");
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = result.user;

      if (name && name.trim()) {
        try {
          await updateProfile(currentUser, { displayName: name.trim() });
        } catch (profileErr) {
          console.warn("Could not update profile name:", profileErr);
        }
      }

      const userPayload = {
        uid: currentUser.uid,
        displayName: name.trim() || email.split("@")[0] || "Developer",
        email: currentUser.email,
        photoURL:
          currentUser.photoURL ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.email}`,
        providerId: "password",
      };
      setUser(userPayload);
      return userPayload;
    } catch (err) {
      console.error("Email signup failed:", err);
      const message = formatAuthError(err);
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Demo Sign-In helper for instant evaluation
  const loginWithDemo = (demoData = {}) => {
    const demoPayload = {
      uid: "demo-eval-user-" + Date.now(),
      displayName: demoData.displayName || "Alex Mercer (Demo)",
      email: demoData.email || "alex.mercer@codecompass.dev",
      photoURL:
        demoData.photoURL ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      providerId: "demo.codecompass",
      isDemo: true,
    };
    setUser(demoPayload);
    localStorage.setItem("codecompass_demo_user", JSON.stringify(demoPayload));
    setAuthError(null);
    return demoPayload;
  };

  // Sign out from both Firebase and demo session
  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      if (auth && user && !user.isDemo) {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.error("Sign-out error:", err);
    } finally {
      localStorage.removeItem("codecompass_demo_user");
      setUser(null);
      setLoading(false);
    }
  };

  const clearAuthError = () => setAuthError(null);

  const value = {
    user,
    loading,
    authError,
    clearAuthError,
    isConfigured: configStatus,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    loginWithDemo,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
