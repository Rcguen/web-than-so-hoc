import { createContext, useContext, useEffect, useState } from "react";

// 1️⃣ Tạo Context
const AuthContext = createContext(null);

// 2️⃣ Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3️⃣ Load user từ localStorage khi F5
  useEffect(() => {
  try {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  } catch (err) {
    // dữ liệu lỗi → xoá
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  } finally {
    setLoading(false);
  }
}, []);


  // 4️⃣ Login
  const login = (userData, tokenData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);

    setUser(userData);
    setToken(tokenData);
  };

  // 5️⃣ Logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 6️⃣ Hook dùng nhanh
export function useAuth() {
  return useContext(AuthContext);
}
