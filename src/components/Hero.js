import React from 'react';

function Hero() {
  return (
    <div className="main-banner" id="top">
      <div className="container">
        <div className="row">
          <div className="col-lg-7">
            <div className="caption header-text">
              {/* Sửa nội dung banner ở đây */}
              <h6>KHÁM PHÁ BẢN THÂN QUA NHỮNG CON SỐ</h6>
              <div className="line-dec"></div>
              <h4>WEB TRA CỨU <em>THẦN SỐ HỌC</em> <span>ONLINE</span></h4>
              <p>Nhập tên và ngày sinh của bạn để khám phá những bí ẩn về Con số chủ đạo, Biểu đồ ngày sinh, Sứ mệnh và Đường đời. Hoàn toàn miễn phí!</p>
              <div className="main-button scroll-to-section"><a href="#contact">Tra Cứu Ngay</a></div>
              <span>hoặc</span>
              <div className="second-button"><a href="#infos">Tìm Hiểu Thêm</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;