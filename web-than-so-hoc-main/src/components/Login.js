import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/"); // về trang chủ
      } else {
        setError(data.message || "Sai thông tin đăng nhập");
      }
    } catch (err) {
      setError("Lỗi kết nối server!");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleLogin} style={{ marginTop: "30px" }}>
        <input
          type="email"
          placeholder="Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "10px" }}
        />
        <br />
        <input
          type="password"
          placeholder="Mật khẩu..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <br />
        <button
          type="submit"
          style={{ marginTop: "20px", padding: "10px 30px", borderRadius: "8px", backgroundColor: "#5b03e4", color: "white", border: "none", cursor: "pointer" }}
        >
          Đăng nhập
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
    </div>
  );
}

export default Login;
