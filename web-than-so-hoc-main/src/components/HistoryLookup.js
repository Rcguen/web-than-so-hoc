import React, { useEffect, useState } from "react";

function HistoryLookup() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/numerology/history")
      .then((res) => res.json())
      .then((data) => setHistory(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "80px 0", textAlign: "center" }}>
      <h2>Lịch sử tra cứu</h2>
      <table style={{ margin: "20px auto", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Họ tên</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Ngày sinh</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Con số chủ đạo</th>
            <th style={{ border: "1px solid #ccc", padding: "10px" }}>Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item.id}>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{item.name}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{item.birth_date}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{item.life_path}</td>
              <td style={{ border: "1px solid #ccc", padding: "10px" }}>{item.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HistoryLookup;
