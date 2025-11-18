import React, { useState } from "react";

function reduce(num) {
  while (num > 9 && ![11,22,33].includes(num)) {
    num = num.toString().split("").reduce((a,b) => a + parseInt(b), 0);
  }
  return num;
}

function PersonalYear() {
  const [birthDate, setBirthDate] = useState("");
  const [personalYear, setPersonalYear] = useState(null);

  const calculatePersonalYear = () => {
    if (!birthDate) return;

    const [year, month, day] = birthDate.split("-").map(Number);
    const currentYear = new Date().getFullYear();
    const total = reduce(day + month + currentYear);
    setPersonalYear(total);
  };

  return (
    <div className="lookup-section">
      <div className="lookup-header">
        <h1>🗓️ Tính Năm Cá Nhân</h1>
        <p>
          Năm cá nhân giúp bạn hiểu năng lượng chủ đạo trong năm hiện tại —
          nên tập trung, phát triển, hay nghỉ ngơi.
        </p>
      </div>

      <div className="lookup-form">
        <input
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        <button onClick={calculatePersonalYear}>Tính Ngay</button>
      </div>

      {personalYear && (
        <div className="lookup-result">
          <h2>Năm cá nhân của bạn là: <span style={{ color: "#5b03e4" }}>{personalYear}</span></h2>
          <p>
            {personalYear === 1 && "Khởi đầu mới, đặt nền tảng cho chu kỳ 9 năm."}
            {personalYear === 2 && "Thời gian học cách kiên nhẫn, nuôi dưỡng quan hệ."}
            {personalYear === 3 && "Năm của sáng tạo, biểu đạt và mở rộng xã hội."}
            {personalYear === 4 && "Xây dựng ổn định, tập trung vào công việc và sức khỏe."}
            {personalYear === 5 && "Tự do, thay đổi và cơ hội mới xuất hiện."}
            {personalYear === 6 && "Chăm lo gia đình, trách nhiệm và tình cảm."}
            {personalYear === 7 && "Năm chiêm nghiệm, phát triển tâm linh."}
            {personalYear === 8 && "Năm của thành công vật chất và quyền lực."}
            {personalYear === 9 && "Kết thúc, giải phóng và chuẩn bị cho chương mới."}
            {[11,22,33].includes(personalYear) && "Năm đặc biệt — mang năng lượng tâm linh và trưởng thành mạnh mẽ."}
          </p>
        </div>
      )}
    </div>
  );
}

export default PersonalYear;
