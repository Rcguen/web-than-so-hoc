import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, password, gender }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Đăng ký thành công! Hãy đăng nhập nhé.");
        navigate("/login");
      } else {
        setError(data.message || "Lỗi đăng ký!");
      }
    } catch (err) {
      setError("Lỗi kết nối server!");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
      <h2>Đăng Ký Tài Khoản</h2>
      <form onSubmit={handleRegister} style={{ marginTop: "30px" }}>
        <input
          type="text"
          placeholder="Họ và tên..."
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "10px" }}
        />
        <br />
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
          style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "10px" }}
        />
        <br />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
          style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "10px" }}
        >
          <option value="">-- Chọn giới tính --</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
        <br />
        <button
          type="submit"
          style={{ marginTop: "20px", padding: "10px 30px", borderRadius: "8px", backgroundColor: "#5b03e4", color: "white", border: "none", cursor: "pointer" }}
        >
          Đăng ký
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
    </div>
  );
}

export default Register;
