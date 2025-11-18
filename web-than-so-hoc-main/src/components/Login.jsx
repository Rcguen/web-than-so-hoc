import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Đăng nhập thất bại");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch {
      setError("Lỗi kết nối server!");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleLogin} style={{ marginTop: 30 }}>
        <input type="email" placeholder="Email..." value={email}
          onChange={(e) => setEmail(e.target.value)} required
          style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #ccc", marginBottom: 10 }} />
        <br />
        <input type="password" placeholder="Mật khẩu..." value={password}
          onChange={(e) => setPassword(e.target.value)} required
          style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #ccc" }} />
        <br />
        <button type="submit"
          style={{ marginTop: 20, padding: "10px 30px", borderRadius: 8, background: "#5b03e4", color: "#fff", border: "none", cursor: "pointer" }}>
          Đăng nhập
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: 15 }}>{error}</p>}
    </div>
  );
}
export default Login;
