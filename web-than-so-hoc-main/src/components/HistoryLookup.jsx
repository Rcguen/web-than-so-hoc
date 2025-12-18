import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HistoryLookup() {
  const navigate = useNavigate();

  // ✅ Lấy user 1 lần duy nhất
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH HISTORY =================
  useEffect(() => {
    if (!user?.user_id) {
      setError("Bạn chưa đăng nhập");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchHistory() {
      try {
        setLoading(true);

        const res = await fetch(
          `http://127.0.0.1:5000/api/numerology/history/${user.user_id}`
        );
        const data = await res.json();

        if (!cancelled) {
          setHistory(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) setError("Không tải được lịch sử tra cứu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [user?.user_id]);

  // ================= PHÂN TÍCH LẠI =================
  const handleAnalyzeAgain = (item) => {
    navigate("/report", {
      state: {
        name: item.name,
        birth_date: item.birth_date,
        email: user.email,
        numbers: {
          life_path: item.life_path_number,
          destiny: item.destiny_number,
          soul: item.soul_number,
          personality: 0, // DB chưa có → set tạm
        },
      },
    });
  };

  // ================= UI =================
  if (loading) {
    return <p style={{ padding: 20 }}>⏳ Đang tải lịch sử...</p>;
  }

  if (error) {
    return (
      <p style={{ padding: 20, color: "red" }}>
        ❌ {error}
      </p>
    );
  }

  if (history.length === 0) {
    return <p style={{ padding: 20 }}>📭 Chưa có lịch sử tra cứu</p>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto" }}>
      <h2>🗂️ Lịch sử tra cứu Thần số học</h2>

      {history.map((item) => (
        <div
          key={item.result_id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            background: "#fff",
          }}
        >
          <h4 style={{ margin: 0 }}>{item.name}</h4>

          <p style={{ margin: "6px 0", color: "#555" }}>
            📅 Ngày sinh: {item.birth_date}
          </p>

          <p style={{ margin: "6px 0" }}>
            🔢 Life Path: <b>{item.life_path_number}</b> | Destiny:{" "}
            <b>{item.destiny_number}</b> | Soul:{" "}
            <b>{item.soul_number}</b>
          </p>

          <p style={{ fontSize: 13, color: "#888" }}>
            ⏱ {item.created_at}
          </p>

          <button
            onClick={() => handleAnalyzeAgain(item)}
            style={{
              marginTop: 8,
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#f6f6f6",
            }}
          >
            🔁 Phân tích lại bằng AI
          </button>

          <button
  onClick={() => navigate(`/details/${item.result_id}`)}
  style={{
    backgroundColor: "#5b03e4",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
  }}
>
  Xem chi tiết
</button>
        </div>
      ))}
    </div>
  );
}
