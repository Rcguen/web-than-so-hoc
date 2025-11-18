import React from 'react';
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero-section" id="top">
      <style>{`
        /* --- LAYOUT NỀN TRẮNG --- */
        .hero-section {
          padding: 120px 0 80px; 
          background-color: #fff; 
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden; /* QUAN TRỌNG: Ẩn phần tràn ra ngoài của ảnh */
        }

        /* Container chứa chữ (text) và giữ khoảng cách với ảnh */
        .hero-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          /* KHÔNG DÙNG GAP Ở ĐÂY NỮA, ĐỂ ẢNH ĐƯỢC TỰ DO */
          position: relative; /* QUAN TRỌNG: Để ảnh có thể định vị tương đối với container nhưng tràn ra ngoài */
          z-index: 2; /* Đảm bảo nội dung chữ nằm trên ảnh */
        }

        /* --- CỘT TRÁI: TEXT --- */
        .hero-content {
          flex-shrink: 0; /* KHÔNG CHO PHÉP TEXT CO LẠI KHI ẢNH TO RA */
          width: 50%; /* CHIẾM 1 NỬA CHIỀU RỘNG CONTAINER */
          max-width: 600px; /* Nhưng không bao giờ vượt quá 600px */
          text-align: left; 
          padding-right: 30px; /* Thêm padding bên phải để text không dính vào ảnh */
          z-index: 2;
        }

        /* Badge nhỏ trên cùng */
        .hero-badge {
          display: inline-block;
          font-size: 14px;
          font-weight: 700;
          color: #7a00ff; 
          margin-bottom: 15px;
          letter-spacing: 1px;
          text-transform: uppercase;
          position: relative;
        }
        /* Gạch chân trang trí */
        .hero-badge::after {
            content: ''; display: block; width: 40px; height: 3px; background: #7a00ff; margin-top: 5px;
        }

        /* Tiêu đề lớn */
        .hero-title {
          font-size: 64px; 
          font-weight: 900;
          line-height: 1.1; 
          color: #333; 
          margin-bottom: 25px;
          text-transform: uppercase; 
        }

        /* Tô màu nhấn THẦN SỐ HỌC */
        .highlight-text {
          color: #7a00ff; 
        }
        
        /* Tô màu và kích thước riêng cho chữ ONLINE */
        .highlight-online {
           background: linear-gradient(to right, #a855f7, #d946ef); 
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
           display: block; 
           font-size: 72px; 
           font-weight: 900; 
        }

        .hero-desc {
          font-size: 17px; 
          color: #666; 
          line-height: 1.6;
          margin-bottom: 40px;
          max-width: 95%; 
        }

        /* Nút bấm */
        .hero-buttons {
          display: flex; gap: 15px; align-items: center;
        }

        .btn-primary-hero {
          padding: 14px 36px;
          background: #5b03e4; 
          color: #fff;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(91, 3, 228, 0.3);
          transition: all 0.3s ease;
        }
        .btn-primary-hero:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(91, 3, 228, 0.4);
          background: #4a02bd;
          color: #fff;
        }

        .btn-secondary-hero {
          padding: 14px 30px;
          background: #f3e8ff; 
          color: #5b03e4;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .btn-secondary-hero:hover {
          background: #e9d5ff;
          color: #4a02bd;
        }

        /* --- CỘT PHẢI: ẢNH (BANNER RIGHT) --- */
        .hero-image-wrapper {
          position: absolute; /* QUAN TRỌNG: Định vị tuyệt đối để ảnh tràn ra ngoài */
          right: 0; /* BÁM SÁT VÀO MÉP PHẢI */
          top: 50%;
          transform: translateY(-50%); /* Căn giữa theo chiều dọc */
          width: 55%; /* TĂNG CHIỀU RỘNG CỦA ẢNH */
          max-width: 900px; /* Giới hạn độ to của ảnh trên màn hình siêu rộng */
          height: auto;
          display: flex;
          justify-content: flex-end; /* Ảnh con căn về phía cuối */
          z-index: 1; /* Nằm dưới nội dung chữ */
        }

        .hero-main-img {
          max-width: 100%;
          height: auto;
          filter: drop-shadow(0 20px 40px rgba(122, 0, 255, 0.15)); 
          animation: floatImage 6s ease-in-out infinite alternate;
        }

        /* Hình tròn trang trí mờ phía sau ảnh */
        .bg-blob {
          position: absolute;
          top: 50%; right: 0;
          transform: translateY(-50%) translateX(20%); /* Dịch sang phải 1 chút */
          width: 600px; height: 600px; /* TO HƠN */
          background: radial-gradient(circle, rgba(122,0,255,0.1) 0%, rgba(255,255,255,0) 70%);
          z-index: -1;
        }

        @keyframes floatImage {
          0% { transform: translateY(0); }
          100% { transform: translateY(-20px); }
        }

        /* --- RESPONSIVE --- */
        @media (max-width: 1200px) { 
            .hero-title { font-size: 56px; }
            .highlight-online { font-size: 64px; }
            .hero-image-wrapper { width: 50%; } /* Điều chỉnh ảnh trên màn hình laptop */
            .bg-blob { width: 500px; height: 500px; }
        }

        @media (max-width: 991px) {
          .hero-container { flex-direction: column-reverse; text-align: center; gap: 40px; padding-top: 40px; }
          .hero-content { padding-right: 0; max-width: 100%; width: 100%; }
          .hero-badge::after { margin: 5px auto 0; }
          .hero-title { font-size: 44px; }
          .highlight-online { font-size: 52px; }
          .hero-desc { margin: 0 auto 30px; max-width: 80%; }
          .hero-buttons { justify-content: center; }
          
          /* ẢNH TRÊN MOBILE */
          .hero-image-wrapper { 
            position: relative; /* Trở về vị trí bình thường trên mobile */
            top: auto; transform: none; right: auto;
            width: 80%; /* Giữ ảnh vừa phải */
            max-width: 400px; /* Giới hạn thêm */
            margin: 0 auto; /* Căn giữa ảnh */
            margin-bottom: 30px; /* Tạo khoảng trống với text */
          }
          .bg-blob { display: none; } /* Ẩn blob trên mobile */
        }
        @media (max-width: 576px) {
          .hero-title { font-size: 36px; }
          .highlight-online { font-size: 42px; }
          .hero-desc { font-size: 15px; }
        }
      `}</style>

      <div className="hero-container">
        
        {/* CỘT TRÁI: CHỮ (TEXT) */}
        <div className="hero-content">
          <span className="hero-badge">KHÁM PHÁ BẢN THÂN QUA NHỮNG CON SỐ</span>
          
          <h1 className="hero-title">
            WEB TRA CỨU <span className="highlight-text">THẦN SỐ HỌC</span>
            <span className="highlight-online">ONLINE</span>
          </h1>
          
          <p className="hero-desc">
            Nhập tên và ngày sinh của bạn để khám phá những bí ẩn về Con số chủ đạo, Biểu đồ ngày sinh, Sứ mệnh và Đường đời. Hoàn toàn miễn phí!
          </p>
          
          <div className="hero-buttons">
            <Link to="/lookup" className="btn-primary-hero">
              Tra Cứu Ngay
            </Link>
            <span style={{color: '#999', fontSize: '14px'}}>hoặc</span>
            <a href="#infos" className="btn-secondary-hero">
              Tìm Hiểu Thêm
            </a>
          </div>
        </div>

        {/* CỘT PHẢI: HÌNH ẢNH */}
        {/* Đặt ngoài hero-container để ảnh có thể tràn viền */}
      </div> 
      {/* Đóng hero-container sớm để ảnh riêng ra */}
      
      <div className="hero-image-wrapper">
          <div className="bg-blob"></div> {/* Vệt sáng nền */}
          <img 
            src="/assets/images/banner-right.png" 
            alt="Banner Thần Số Học" 
            className="hero-main-img"
          />
      </div>

    </section>
  );
}

export default Hero;