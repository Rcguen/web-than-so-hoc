import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";



function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();


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
      // localStorage.setItem("token", data.token);
      // localStorage.setItem("user", JSON.stringify(data.user));
      // sau khi login thành công
      login(data.user, data.token);

      // ✅ Toast thành công
      toast.success(`👋 Xin chào ${data.user.full_name}!`);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

      toast.error(data.message || "❌ Đăng nhập thất bại");

    } catch {
      setError("Lỗi kết nối server!");
    }
  };

  return (
    <div className="auth-container">
      {/* CSS STYLE - DÙNG CHUNG STYLE VỚI TRANG REGISTER */}
      <style>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f5f5f5;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .auth-card {
          background: #fff;
          width: 100%;
          max-width: 400px; /* Form Login hẹp hơn Register xíu cho gọn */
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(122, 0, 255, 0.15);
          text-align: center;
        }

        .auth-title {
          color: #333;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .auth-subtitle {
          color: #666;
          font-size: 14px;
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 20px;
          text-align: left;
        }
        
        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #555;
          font-weight: 600;
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s;
          outline: none;
          box-sizing: border-box;
        }

        .form-input:focus {
          border-color: #7a00ff;
          box-shadow: 0 0 0 3px rgba(122, 0, 255, 0.1);
        }

        .btn-submit {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 50px;
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          color: #fff;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 10px;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(122, 0, 255, 0.3);
        }

        .error-msg {
          color: #ff4d4f;
          background: #fff1f0;
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 15px;
          border: 1px solid #ffccc7;
        }

        .auth-switch {
          margin-top: 25px;
          font-size: 14px;
          color: #666;
        }
        .auth-link {
          color: #7a00ff;
          font-weight: 600;
          text-decoration: none;
          margin-left: 5px;
        }
        .auth-link:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="auth-card">
        <h2 className="auth-title">Chào Mừng Trở Lại!</h2>
        <p className="auth-subtitle">Đăng nhập để tiếp tục hành trình</p>

        <form onSubmit={handleLogin}>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input"
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="Nhập mật khẩu..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Đăng Nhập
          </button>

        </form>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <div className="auth-switch">
          Chưa có tài khoản? 
          <Link to="/register" className="auth-link">Đăng Ký Ngay</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;