import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * @param children Component cần bảo vệ
 * @param role role yêu cầu (optional) – ví dụ "admin"
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // ⏳ Chờ AuthContext load xong (tránh nháy màn hình)
  if (loading) return null;

  // ❌ Chưa đăng nhập → về login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Có login nhưng sai role
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // ✅ OK
  return children;
}
