import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await axios.get("http://127.0.0.1:5000/api/admin/users");
    setUsers(res.data.users || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (id, role) => {
    await axios.put(
      `http://127.0.0.1:5000/api/admin/users/${id}/role`,
      { role }
    );
    fetchUsers();
  };

  const toggleUser = async (id) => {
    await axios.put(
      `http://127.0.0.1:5000/api/admin/users/${id}/toggle`
    );
    fetchUsers();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Quản lý User</h1>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Role</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {users.map(u => (
            <tr key={u.user_id}>
              <td>{u.user_id}</td>
              <td>{u.full_name}</td>
              <td>{u.email}</td>

              <td>
                <select
                  value={u.role}
                  onChange={e => changeRole(u.user_id, e.target.value)}
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>

              <td>
                {u.is_active ? "Hoạt động" : "Bị khóa"}
              </td>

              <td>
                <button onClick={() => toggleUser(u.user_id)}>
                  {u.is_active ? "Khóa" : "Mở"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
