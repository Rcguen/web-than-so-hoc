import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [gender, setGender]       = useState("Khác");
  const [error, setError]         = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, password, gender }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Đăng ký thất bại");
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
      <h2>Đăng Ký</h2>
      <form onSubmit={handleRegister} style={{ marginTop: 30 }}>
        <input placeholder="Họ tên..." value={full_name}
          onChange={(e) => setFullName(e.target.value)} required
          style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #ccc", marginBottom: 10 }} />
        <br />
        <input type="email" placeholder="Email..." value={email}
          onChange={(e) => setEmail(e.target.value)} required
          style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #ccc", marginBottom: 10 }} />
        <br />
        <input type="password" placeholder="Mật khẩu..." value={password}
          onChange={(e) => setPassword(e.target.value)} required
          style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #ccc", marginBottom: 10 }} />
        <br />
        <select value={gender} onChange={(e) => setGender(e.target.value)}
          style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #ccc" }}>
          <option>Khác</option><option>Nam</option><option>Nữ</option>
        </select>
        <br />
        <button type="submit"
          style={{ marginTop: 20, padding: "10px 30px", borderRadius: 8, background: "#5b03e4", color: "#fff", border: "none", cursor: "pointer" }}>
          Đăng ký
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: 15 }}>{error}</p>}
    </div>
  );
}
export default Register;
