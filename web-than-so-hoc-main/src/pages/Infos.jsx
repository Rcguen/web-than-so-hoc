import React from 'react';

function Infos() {
  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; 
  };

  return (
    <div className="infos section" id="infos">
      <style>{`
        .infos {
          padding-top: 80px;
          padding-bottom: 80px;
          background-color: #f9f9f9;
          position: relative;
        }

        .infos .container {
          max-width: 1200px !important;
          width: 100%;
          padding: 0 15px;
        }

        /* === KHUNG TRẮNG CHÍNH (CARD) === */
        .main-content-card {
          background: #fff;
          border-radius: 24px; /* Bo góc cho cả khối */
          box-shadow: 0 15px 50px rgba(122, 0, 255, 0.1); /* Đổ bóng đẹp */
          overflow: hidden; /* Cắt ảnh thừa để bo góc khớp với khung */
        }

        /* Hàng chứa 2 cột - Xóa khoảng cách mặc định */
        .main-content-card .row {
          margin-left: 0;
          margin-right: 0;
        }

        /* Cột Trái (Chứa Ảnh) - Xóa Padding */
        .image-column {
          padding-left: 0 !important;
          padding-right: 0 !important;
          min-height: 100%; /* Để ảnh luôn cao bằng nội dung bên phải */
        }

        /* Ảnh Tràn Viền */
        .left-image-full {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .left-image-full img {
          width: 100%;
          height: 100%;
          object-fit: cover; /* Quan trọng: Cắt ảnh để lấp đầy khung mà không bị méo */
          display: block;
          min-height: 400px; /* Chiều cao tối thiểu trên mobile */
        }

        /* Cột Phải (Nội Dung) - Thêm Padding bên trong */
        .content-column {
          padding: 50px; /* Khoảng cách chữ với mép khung */
        }

        /* --- STYLE NỘI DUNG CŨ GIỮ NGUYÊN --- */
        .section-heading { margin-bottom: 30px; }
        .section-heading h2 {
          font-size: 34px; font-weight: 800; color: #333; margin-bottom: 20px; line-height: 1.3;
        }
        .section-heading h2 em { font-style: normal; color: #7a00ff; }
        .section-heading h2 span { color: #aa00ff; }
        
        .line-dec {
          width: 80px; height: 4px;
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          margin-bottom: 25px; border-radius: 2px;
        }

        .main-content-card p {
          font-size: 16px; color: #555; line-height: 1.8; margin-bottom: 0;
        }
        
        .skills { margin-top: 35px; }
        .skill-slide { margin-bottom: 25px; }
        .skill-slide h6 {
          font-size: 16px; font-weight: 700; margin-bottom: 8px; color: #444;
          display: flex; justify-content: space-between;
        }
        .skill-slide h6 span { color: #7a00ff; }
        
        .fill-bar {
          width: 100%; height: 8px;
          background-color: #e9ecef; border-radius: 10px;
          position: relative; overflow: hidden;
        }
        .fill-bar::before {
          content: ''; position: absolute; top: 0; left: 0; bottom: 0;
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          border-radius: 10px;
          width: 0;
          animation: fillAnimation 2s ease-out forwards;
        }
        @keyframes fillAnimation { to { width: var(--target-width); } }

        .more-info {
          margin-top: 35px; font-style: italic; color: #666; font-size: 15px;
          border-left: 4px solid #7a00ff; padding-left: 15px;
          background: #f8f9fa; padding: 15px; border-radius: 0 8px 8px 0;
        }

        /* Responsive Mobile */
        @media (max-width: 991px) {
          .content-column { padding: 30px; }
          .section-heading h2 { font-size: 28px; }
        }
      `}</style>

      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            {/* Thay đổi class để áp dụng style mới */}
            <div className="main-content-card">
              <div className="row align-items-stretch"> {/* stretch để 2 cột cao bằng nhau */}
                
                {/* CỘT TRÁI: ẢNH TRÀN VIỀN */}
                <div className="col-lg-6 image-column">
                  <div className="left-image-full">
                    <img 
                      src="/assets/images/left-infos.jpg" 
                      alt="Thần số học" 
                      onError={handleImageError} 
                    />
                  </div>
                </div>
                
                {/* CỘT PHẢI: NỘI DUNG */}
                <div className="col-lg-6 content-column">
                  <div className="section-heading">
                    <h2>Thấu Hiểu <em>Bản Thân</em> &amp; Định Hướng <span>Tương Lai</span></h2>
                    <div className="line-dec"></div>
                    <p>
                      Thần số học là tấm bản đồ chỉ dẫn giúp bạn khám phá tiềm năng ẩn giấu. 
                      Chúng tôi áp dụng phương pháp tính toán <strong>Pythagoras</strong> chuẩn xác để mang đến những phân tích sâu sắc nhất về cuộc đời bạn.
                    </p>
                  </div>

                  <div className="skills">
                    <div className="skill-slide">
                      <h6>Độ Chính Xác Phân Tích <span>98%</span></h6>
                      <div className="fill-bar" style={{"--target-width": "98%"}}></div>
                    </div>
                    <div className="skill-slide">
                      <h6>Sự Hài Lòng Khách Hàng <span>95%</span></h6>
                      <div className="fill-bar" style={{"--target-width": "95%"}}></div>
                    </div>
                    <div className="skill-slide">
                      <h6>Chi Tiết & Chuyên Sâu <span>92%</span></h6>
                      <div className="fill-bar" style={{"--target-width": "92%"}}></div>
                    </div>
                  </div>

                  <p className="more-info">
                    "Con số không biết nói dối. Hãy để chúng tôi giúp bạn giải mã thông điệp vũ trụ gửi gắm qua ngày sinh của bạn."
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Infos;