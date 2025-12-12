import { Navigate } from "react-router-dom";

export function RequireAuth({ children }) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return <Navigate to="/login" />;
    return children;
}

export function RequireAdmin({ children }) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "Admin") {
        return <Navigate to="/" />;
    }
    return children;
}
