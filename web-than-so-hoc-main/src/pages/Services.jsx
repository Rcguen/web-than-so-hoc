import React from "react";
import { useNavigate } from "react-router-dom";
import "./Services.css"; // (chúng ta sẽ thêm CSS riêng cho phần này)

function Services() {
  const navigate = useNavigate();

  const services = [
    {
      title: "Con Số Chủ Đạo",
      desc: "Khám phá con số đại diện cho con đường cuộc đời của bạn.",
      img: "/assets/images/services-01.jpg",
      link: "/lookup",
      color: "#6A5ACD",
    },
    {
      title: "Chỉ Số Đường Đời",
      desc: "Phân tích ý nghĩa sâu xa của con số định hình tính cách bạn.",
      img: "/assets/images/services-02.jpg",
      link: "/lookup",
      color: "#8A2BE2",
    },
    {
      title: "Chỉ Số Sứ Mệnh",
      desc: "Tìm hiểu con số nói lên lý do tồn tại và hướng đi cuộc đời bạn.",
      img: "/assets/images/services-03.jpg",
      link: "/lookup",
      color: "#FF69B4",
    },
    {
      title: "Biểu Đồ Ngày Sinh",
      desc: "Xem biểu đồ Pythagoras thể hiện năng lượng của ngày sinh.",
      img: "/assets/images/services-04.jpg",
      link: "/birth-chart",
      color: "#FF7F50",
    },
    {
      title: "Năm Cá Nhân",
      desc: "Dự đoán xu hướng và cơ hội của bạn trong năm hiện tại.",
      img: "/assets/images/services-05.jpg",
      link: "/personal-year",
      color: "#32CD32",
    },
    {
      title: "Báo Cáo Tổng Hợp",
      desc: "Tạo báo cáo đầy đủ các chỉ số thần số học của riêng bạn.",
      img: "/assets/images/services-06.jpg",
      link: "/report",
      color: "#1E90FF",
    },
    {
      title: "Tình Yêu & Mối Quan Hệ",
      desc: "Tạo báo cáo đầy đủ các chỉ số thần số học của riêng bạn.",
      img: "/assets/images/services-07.jpg",
      link: "/love-page",
      color: "#f81effff",
    },
  ];

  return (
    <div className="services section" id="services">
      <div className="container">
        <div className="section-heading text-center">
          <h2>
            Các <em>Chỉ Số</em> &amp; <span>Công Cụ</span> Phổ Biến
          </h2>
          <div className="line-dec"></div>
          <p>
            Khám phá ý nghĩa của những con số quan trọng nhất định hình nên con người bạn.
          </p>
        </div>

        <div className="service-grid">
          {services.map((service, index) => (
            <div
              className="service-card"
              key={index}
              onClick={() => navigate(service.link)}
              style={{ "--accent-color": service.color }}
            >
              <div className="service-icon">
                <img src={service.img} alt={service.title} />
              </div>
              <h4>{service.title}</h4>
              <p>{service.desc}</p>
              <button className="service-btn">Khám Phá</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Services;
