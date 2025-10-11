import React from 'react';

function Services() {
  return (
    <div className="services section" id="services">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-6">
            <div className="row">
              <div className="col-lg-12">
                <div className="section-heading">
                  <h2>Các <em>Chỉ Số</em> &amp; <span>Công Cụ</span> Phổ Biến</h2>
                  <div className="line-dec"></div>
                  <p>Khám phá ý nghĩa của những con số quan trọng nhất định hình nên con người bạn.</p>
                </div>
              </div>
              {/* Sửa các mục dịch vụ ở đây */}
              <div className="col-lg-6 col-sm-6">
                <div className="service-item">
                  <div className="icon">
                    <img src="/assets/images/services-01.jpg" alt="Con số chủ đạo" className="templatemo-feature" />
                  </div>
                  <h4>Con Số Chủ Đạo</h4>
                </div>
              </div>
              <div className="col-lg-6 col-sm-6">
                <div className="service-item">
                  <div className="icon">
                    <img src="/assets/images/services-02.jpg" alt="Chỉ số đường đời" className="templatemo-feature" />
                  </div>
                  <h4>Chỉ Số Đường Đời</h4>
                </div>
              </div>
              <div className="col-lg-6 col-sm-6">
                <div className="service-item">
                  <div className="icon">
                    <img src="/assets/images/services-03.jpg" alt="Chỉ số sứ mệnh" className="templatemo-feature" />
                  </div>
                  <h4>Chỉ Số Sứ Mệnh</h4>
                </div>
              </div>
              <div className="col-lg-6 col-sm-6">
                <div className="service-item">
                  <div className="icon">
                    <img src="/assets/images/services-04.jpg" alt="Biểu đồ ngày sinh" className="templatemo-feature" />
                  </div>
                  <h4>Biểu Đồ Ngày Sinh</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;