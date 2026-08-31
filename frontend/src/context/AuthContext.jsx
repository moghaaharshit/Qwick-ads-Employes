import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { firebaseGetCurrentUser, firebaseSignOut } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await firebaseGetCurrentUser();
          if (profile && profile.active !== false) {
            setUser(profile);
            localStorage.setItem("qa_user", JSON.stringify(profile));
          } else {
            setUser(null);
            localStorage.removeItem("qa_user");
          }
        } catch (e) {
          setUser(null);
          localStorage.removeItem("qa_user");
        }
      } else {
        setUser(null);
        localStorage.removeItem("qa_user");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    // The actual Firebase sign-in is handled inside api.js firebaseLogin
    // We import it dynamically to avoid circular deps
    const { default: api } = await import("@/lib/api");
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    localStorage.setItem("qa_user", JSON.stringify(data.user));
    return data.user;
  };

  const logout = async () => {
    await firebaseSignOut();
    setUser(null);
    localStorage.removeItem("qa_user");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
