// src/components/LifePinnacleSection.js
import React, { useEffect, useState } from "react";
import "./LifePinnacleSection.css";

function LifePinnacleSection({ birthDate }) {
  const [pinnacles, setPinnacles] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!birthDate) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:5000/api/numerology/life-pinnacles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birth_date: birthDate }),
        });
        const data = await res.json();
        setPinnacles(data.pinnacles || []);
        setChallenges(data.challenges || []);
      } catch (err) {
        console.error("Lỗi tải life pinnacles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [birthDate]);

  return (
    <div className="life-pinnacle-section">
      <h2>🌄 Các Đỉnh Cao Cuộc Đời</h2>
      <p>
        Kim tự tháp đại diện cho 4 giai đoạn phát triển quan trọng trong đời. 
        Biểu đồ dưới đây minh họa các đỉnh cao và thử thách tương ứng của bạn.
      </p>

      {loading && <p>Đang tải dữ liệu...</p>}

      {!loading && pinnacles.length > 0 && (
        <>
          <div className="pyramid">
            <div className="row top">
              <div className="node">
                <div className="circle">{pinnacles[3]?.value}</div>
                <p>{pinnacles[3]?.age} tuổi</p>
              </div>
            </div>

            <div className="row mid">
              <div className="node">
                <div className="circle">{pinnacles[2]?.value}</div>
                <p>{pinnacles[2]?.age} tuổi</p>
              </div>
            </div>

            <div className="row base">
              <div className="node">
                <div className="circle">{pinnacles[0]?.value}</div>
                <p>{pinnacles[0]?.age} tuổi</p>
              </div>
              <div className="node">
                <div className="circle">{pinnacles[1]?.value}</div>
                <p>{pinnacles[1]?.age} tuổi</p>
              </div>
            </div>
          </div>

          <div className="challenges">
            <h3>⚠️ Các Thử Thách Cuộc Đời</h3>
            <ul>
              {challenges.map((c) => (
                <li key={c.index}>
                  Thử thách {c.index}: <b>{c.value}</b>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default LifePinnacleSection;
