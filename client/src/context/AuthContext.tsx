import { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

interface AuthContextType {
  user: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser("authenticated");
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await API.post("/api/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    setUser("authenticated");
  };

  const register = async (name: string, email: string, password: string) => {
    await API.post("/api/auth/register", { name, email, password });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthContext not found");
  return context;
};