import React, { useState } from "react";

function Lookup() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState(null);
  const [meaning, setMeaning] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:5000/api/numerology/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, birth_date: birthDate }),
    });

    const data = await res.json();
    setResult(data);

    const meaningRes = await fetch(
      `http://127.0.0.1:5000/api/numerology/meaning/${data.lifePath}`
    );
    const meaningData = await meaningRes.json();
    setMeaning(meaningData);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f6f0ff 0%, #ffffff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 0",
      }}
    >
      <h2 style={{ color: "#5b03e4", marginBottom: "20px" }}>
        🔮 Tra Cứu Số Chủ Đạo
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          background: "white",
          padding: "30px 40px",
          borderRadius: "20px",
          boxShadow: "0 8px 20px rgba(91, 3, 228, 0.15)",
          textAlign: "center",
          width: "350px",
        }}
      >
        <input
          type="text"
          placeholder="Nhập họ tên..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px 15px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            marginBottom: "15px",
          }}
        />
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px 15px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            marginBottom: "20px",
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            backgroundColor: "#5b03e4",
            color: "white",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            transition: "0.3s",
          }}
        >
          Tra cứu ngay
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: "40px",
            background:
              "linear-gradient(135deg, #7b2ff7 0%, #f107a3 100%)",
            color: "white",
            borderRadius: "20px",
            padding: "30px",
            width: "380px",
            textAlign: "center",
            boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            animation: "fadeIn 1s ease-in-out",
          }}
        >
          <h3>Kết quả tra cứu</h3>
          <p>
            <b>Tên:</b> {result.name}
          </p>
          <p>
            <b>Ngày sinh:</b> {result.birthDate}
          </p>
          <p>
            <b>Con số chủ đạo:</b> {result.lifePath}
          </p>

          {meaning && (
            <div style={{ marginTop: "20px" }}>
              <h4>{meaning.title}</h4>
              <p style={{ fontSize: "14px" }}>{meaning.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Lookup;
