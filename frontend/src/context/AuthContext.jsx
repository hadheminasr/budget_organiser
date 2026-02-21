import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const API_URL = "http://localhost:5000/api/auth";

axios.defaults.withCredentials = true;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState(null);
  //  CHECK AUTH AU DÉMARRAGE
  const checkAuth = async () => {
    setIsCheckingAuth(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/check-auth`);
      setUser(res.data.user);
      setIsAuthenticated(true);
      return res.data.user;
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();

  }, []);
  // LOGIN
  const login = async (email, password) => {
    setError(null);
    const res = await axios.post(`${API_URL}/login`, { email, password });
    setUser(res.data.user);
    setIsAuthenticated(true);
    return res.data.user;
  };
  // LOGOUT
  const logout = async () => {
    setError(null);
    try {
      await axios.post(`${API_URL}/logout`, {});
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };
  // SIGNUP
  const signup = async ({ name, prenom, email, password }) => {
    setError(null);
    const res = await axios.post(`${API_URL}/signup`, {
      name: prenom,        
      familyName: name,    
      email,
      password,
    }, { withCredentials: true });
    return res.data; 
  };
  //  VERIFY EMAIL
  const verifyEmail = async (code) => {
    setError(null);
    const res = await axios.post(`${API_URL}/verify-email`, { code });
    if (res.data?.user) {
      setUser(res.data.user);
      setIsAuthenticated(true);
    }
    return res.data;
  };
  // FORGOT PASSWORD
  const forgotPassword = async (email) => {
    setError(null);
    const res = await axios.post(`${API_URL}/forgot-password`, { email });
    return res.data; 
  };
  //  RESET PASSWORD
  const resetPassword = async (token, password) => {
    setError(null);
    const res = await axios.post(`${API_URL}/reset-password/${token}`, {
      password,
    });
    return res.data;
  };
  const roleHome = (u = user) => {
    if (!u) return "/login";
    return u.role === "admin" ? "/admin" : "/user";
  };
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
