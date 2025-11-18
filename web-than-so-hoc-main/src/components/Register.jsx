import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
    <div className="auth-container">
      {/* CSS STYLE RIÊNG CHO TRANG NÀY */}
      <style>{`
        /* Container chính căn giữa màn hình */
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh; /* Full màn hình */
          background: #f5f5f5; /* Nền xám nhẹ cho nổi bật form */
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* Thẻ Card chứa Form */
        .auth-card {
          background: #fff;
          width: 100%;
          max-width: 420px; /* Độ rộng tối đa */
          padding: 40px;
          border-radius: 20px; /* Bo góc mềm mại */
          box-shadow: 0 10px 30px rgba(122, 0, 255, 0.15); /* Đổ bóng tím nhẹ */
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

        /* Style cho các ô nhập liệu */
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

        .form-input, .form-select {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-size: 15px;
          transition: all 0.3s;
          outline: none;
          box-sizing: border-box; /* Để padding không làm vỡ khung */
        }

        /* Hiệu ứng khi bấm vào ô nhập */
        .form-input:focus, .form-select:focus {
          border-color: #7a00ff;
          box-shadow: 0 0 0 3px rgba(122, 0, 255, 0.1);
        }

        /* Nút Đăng Ký Gradient */
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

        /* Link chuyển qua đăng nhập */
        .auth-switch {
          margin-top: 20px;
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
        <h2 className="auth-title">Tạo Tài Khoản</h2>
        <p className="auth-subtitle">Khám phá bản thân qua những con số</p>

        <form onSubmit={handleRegister}>
          
          <div className="form-group">
            <label className="form-label">Họ và Tên</label>
            <input 
              className="form-input"
              placeholder="Ví dụ: Nguyễn Văn A" 
              value={full_name}
              onChange={(e) => setFullName(e.target.value)} 
              required
            />
          </div>

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

          <div className="form-group">
            <label className="form-label">Giới tính</label>
            <select 
              className="form-select"
              value={gender} 
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Khác">Khác</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <button type="submit" className="btn-submit">
            Đăng Ký Ngay
          </button>

        </form>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <div className="auth-switch">
          Đã có tài khoản? 
          <Link to="/login" className="auth-link">Đăng Nhập</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;