// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// ✅ Base URL (simple, pas besoin de MODE)
const API_URL = "http://localhost:5000/api/auth";

// Optionnel mais pratique: toutes les requêtes axios envoient les cookies
axios.defaults.withCredentials = true;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState(null);
  // 1) CHECK AUTH AU DÉMARRAGE
  const checkAuth = async () => {
    setIsCheckingAuth(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/check-auth`);
      setUser(res.data.user);
      setIsAuthenticated(true);
      return res.data.user;
    } catch (err) {
      // 401 normal si pas connecté
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 2) LOGIN
  const login = async (email, password) => {
    setError(null);
    const res = await axios.post(`${API_URL}/login`, { email, password });
    setUser(res.data.user);
    setIsAuthenticated(true);
    return res.data.user;
  };
  // 3) LOGOUT
  const logout = async () => {
    setError(null);
    try {
      // ⚠️ body {} obligatoire pour axios.post + config
      await axios.post(`${API_URL}/logout`, {});
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };
  // 4) SIGNUP
  const signup = async ({ name, prenom, email, password }) => {
    setError(null);
    // Si ton backend NE connecte pas directement après signup, c'est ok.
    // Tu rediriges vers /verify-email comme tu fais.
    const res = await axios.post(`${API_URL}/signup`, {
  name: prenom,        // prénom → first name
  familyName: name,    // nom → family name
  email,
  password,
}, { withCredentials: true });
    return res.data; // {success, message, user?}
  };

  // =========================
  // 5) VERIFY EMAIL
  // =========================
  const verifyEmail = async (email) => {
    setError(null);
    const res = await axios.post(`${API_URL}/forgot-password`, { email });
    if (res.data?.user) {
      setUser(res.data.user);
      setIsAuthenticated(true);
    }
    return res.data;
  };

  // =========================
  // 6) FORGOT PASSWORD
  // =========================
  const forgotPassword = async (email) => {
    setError(null);
    const res = await axios.post(`${API_URL}/forgot-password`, { email });
    return res.data; // message
  };

  // =========================
  // 7) RESET PASSWORD
  // =========================
  const resetPassword = async (token, password) => {
    setError(null);
    const res = await axios.post(`${API_URL}/reset-password/${token}`, {
      password,
    });
    return res.data;
  };

  // =========================
  // 8) HELPER: HOME ROUTE SELON ROLE
  // =========================
  // (Pratique pour faire navigate("/"))
  const roleHome = (u = user) => {
    if (!u) return "/login";
    return u.role === "admin" ? "/admin" : "/user";
  };

  // Value memo pour éviter re-render excessif
  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated,
      setIsAuthenticated,
      isCheckingAuth,
      error,
      setError,

      checkAuth,
      login,
      logout,
      signup,
      verifyEmail,
      forgotPassword,
      resetPassword,

      roleHome,
    }),
    [user, isAuthenticated, isCheckingAuth, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
