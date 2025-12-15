import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface User {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  id?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    fullName: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // ================= INIT APP =================
  useEffect(() => {
    // 🔹 Load user khi F5 / reload
    try {
      const storedUser = sessionStorage.getItem("loggedInUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      setUser(null);
    }

    // 🔹 Seed user (KHÔNG ghi đè user cũ)
    const seedUsers: User[] = [
      {
        id: "u_admin",
        fullName: "Administrator",
        email: "admin@gmail.com",
        phone: "",
        password: "123456",
        role: "admin",
      },
      {
        id: "u_user",
        fullName: "Tan Viet",
        email: "tanviet3105@gmail.com",
        phone: "",
        password: "Tythemen@123",
        role: "user",
      },
    ];

    const existingUsers: User[] = JSON.parse(
      localStorage.getItem("users") || "[]"
    );

    const mergedUsers = [...existingUsers];

    seedUsers.forEach((seed) => {
      if (!mergedUsers.some((u) => u.email === seed.email)) {
        mergedUsers.push(seed);
      }
    });

    localStorage.setItem("users", JSON.stringify(mergedUsers));
  }, []);

  // ================= REGISTER =================
  const register = async (
    fullName: string,
    email: string,
    phone: string,
    password: string
  ): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some((u) => u.email === email)) return false;

    const newUser: User = { fullName, email, phone, password };
    const updatedUsers = [...users, newUser];

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    sessionStorage.setItem("loggedInUser", JSON.stringify(newUser));
    setUser(newUser);

    return true;
  };

  // ================= LOGIN =================
  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]");

    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) return false;

    sessionStorage.setItem("loggedInUser", JSON.stringify(foundUser));
    setUser(foundUser);
    return true;
  };

  // ================= LOGOUT =================
  const logout = () => {
    setUser(null);

    try {
      sessionStorage.removeItem("loggedInUser");
      sessionStorage.removeItem("authToken");
      localStorage.removeItem("cart"); // clear cart khi logout
    } catch {}

    // ✅ CHỈ logout mới reload
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ================= HOOK =================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
