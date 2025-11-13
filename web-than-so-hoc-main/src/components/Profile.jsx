import React from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h2>Thông tin người dùng</h2>
      <p><b>Họ tên:</b> {user.full_name}</p>
      <p><b>Email:</b> {user.email}</p>
      <p><b>Vai trò:</b> {user.role}</p>
      <p><b>Giới tính:</b> {user.gender}</p>
    </div>
  );
}

export default Profile;
