import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { token, user, login, logout } = useAuth(); // login() dùng để update user trong context
  const [form, setForm] = useState({
    full_name: "",
    gender: "Khác",
    phone: "",
    address: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);


  useEffect(() => {
    const load = async () => {
      setErr(""); setMsg("");
      try {
        const res = await fetch("http://127.0.0.1:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          logout();
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          setErr(data.message || "Không lấy được profile");
          return;
        }

        const u = data.user;
        setForm({
          full_name: u.full_name || "",
          gender: u.gender || "Khác",
          phone: u.phone || "",
          address: u.address || "",
        });
      } catch {
        setErr("Lỗi kết nối server!");
      }
    };

    if (token) load();
  }, [token, logout]);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    setErr(""); setMsg("");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "Cập nhật thất bại");
        return;
      }

      // ✅ cập nhật lại user trong AuthContext + localStorage
      login(data.user, token);
      setMsg("✅ Cập nhật thành công!");
    } catch {
      setErr("Lỗi kết nối server!");
    }
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 520, margin: "110px auto 40px", padding: 20 }}>
      <h2>👤 Hồ sơ của tôi</h2>
      <p style={{ color: "#666" }}>Email: <b>{user.email}</b></p>

      {/* ===== UPLOAD AVATAR ===== */}
<div style={{ marginBottom: 24 }}>
  <label style={{ fontWeight: 600 }}>Ảnh đại diện</label>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginTop: 8,
    }}
  >
    <img
      src={
        user.avatar_url
          ? `http://127.0.0.1:5000${user.avatar_url}`
          : "/assets/images/avatar-placeholder.png"
      }
      alt="avatar"
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid #ddd",
      }}
    />

    <input
      type="file"
      accept="image/*"
      onChange={(e) => setAvatarFile(e.target.files[0])}
    />
  </div>

  <button
    type="button"
    onClick={async () => {
      if (!avatarFile) return;

      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await fetch(
        "http://127.0.0.1:5000/api/profile/avatar",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Upload avatar thất bại");
        return;
      }

      // ✅ cập nhật user trong AuthContext
      login(data.user, token);
      setAvatarFile(null);
    }}
    style={{
      marginTop: 10,
      padding: "8px 14px",
      borderRadius: 8,
      border: "none",
      background: "#7a00ff",
      color: "#fff",
      cursor: "pointer",
    }}
  >
    Upload Avatar
  </button>
</div>
      {/* ===== FORM CẬP NHẬT HỒ SƠ ===== */}

      <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
        <label>
          Họ tên
          <input
            value={form.full_name}
            onChange={onChange("full_name")}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          Giới tính
          <select
            value={form.gender}
            onChange={onChange("gender")}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          >
            <option>Nam</option>
            <option>Nữ</option>
            <option>Khác</option>
          </select>
        </label>

        <label>
          Số điện thoại
          <input
            value={form.phone}
            onChange={onChange("phone")}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <label>
          Địa chỉ
          <input
            value={form.address}
            onChange={onChange("address")}
            style={{ width: "100%", padding: 10, marginTop: 6 }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: 12,
            border: "none",
            borderRadius: 10,
            background: "#7a00ff",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Lưu thay đổi
        </button>

        {msg && <div style={{ color: "green" }}>{msg}</div>}
        {err && <div style={{ color: "crimson" }}>{err}</div>}
      </form>
    </div>
  );
}
