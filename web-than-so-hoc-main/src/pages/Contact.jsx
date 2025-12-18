import React from 'react';

function Contact() {
  return (
    <div className="contact-us section" id="contact">
      {/* CSS RIÊNG CHO PHẦN CONTACT */}
      <style>{`
        .contact-us {
          padding: 80px 0;
          background-color: #f5f5f5;
        }

        .contact-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 15px 40px rgba(122, 0, 255, 0.1);
          padding: 40px;
          overflow: hidden;
        }

        /* MAP STYLE */
        #map {
          height: 100%;
          min-height: 400px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        #map iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }

        /* FORM STYLE */
        .section-heading {
          margin-bottom: 30px;
        }
        .section-heading h2 {
          font-size: 30px;
          font-weight: 800;
          color: #333;
          margin-bottom: 15px;
        }
        .section-heading h2 span {
          color: #7a00ff;
        }
        
        fieldset {
          margin-bottom: 20px;
          border: none;
          padding: 0;
        }

        input, textarea {
          width: 100%;
          padding: 12px 20px;
          border: 1px solid #eee;
          border-radius: 50px;
          background-color: #f9f9f9;
          font-size: 14px;
          color: #333;
          outline: none;
          transition: all 0.3s;
        }
        textarea {
          border-radius: 20px;
          height: 150px;
          resize: none;
        }
        
        input:focus, textarea:focus {
          border-color: #7a00ff;
          background-color: #fff;
          box-shadow: 0 0 0 4px rgba(122, 0, 255, 0.1);
        }

        /* BUTTON */
        .orange-button {
          background: linear-gradient(to right, #7a00ff, #aa00ff);
          color: #fff;
          border: none;
          padding: 12px 30px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: 0.3s;
          width: 100%;
          box-shadow: 0 10px 20px rgba(122, 0, 255, 0.3);
        }
        .orange-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(122, 0, 255, 0.4);
        }

        /* INFO ITEMS */
        .contact-info-row {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #eee;
        }
        .info-item {
          text-align: center;
          padding: 20px;
          transition: 0.3s;
          border-radius: 15px;
        }
        .info-item:hover {
          background: #f9f9f9;
          transform: translateY(-5px);
        }
        .info-item i {
          font-size: 24px;
          color: #7a00ff;
          margin-bottom: 15px;
          display: inline-block;
          width: 50px; height: 50px;
          line-height: 50px;
          border-radius: 50%;
          background: #f0f0f0;
        }
        .info-item h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .info-item a {
          color: #555;
          text-decoration: none;
          transition: 0.2s;
          font-size: 14px;
        }
        .info-item a:hover {
          color: #7a00ff;
        }

        /* Responsive */
        @media (max-width: 991px) {
          .contact-card { padding: 20px; }
          #map { height: 300px; margin-bottom: 30px; }
        }
      `}</style>

      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            
            <div className="contact-card">
              <div className="row">
                
                {/* CỘT TRÁI: BẢN ĐỒ */}
                <div className="col-lg-5">
                  <div id="map">
                    {/*<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1265616109854!2d106.71188097458447!3d10.80161748934869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528a459cb43ab%3A0x6c3d29d370b52a7e!2zSFVURUNIIC0gxJDhuqFpIGjhu41jIEPDtG5nIG5naOG7hyBUUC5IQ00gKFNhaSBHb24gQ2FtcHVzKQ!5e0!3m2!1svi!2s!4v1765307726304!5m2!1svi!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe> */}
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1265616109854!2d106.71188097458447!3d10.80161748934869!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528a459cb43ab%3A0x6c3d29d370b52a7e!2zSFVURUNIIC0gxJDhuqFpIGjhu41jIEPDtG5nIG5naOG7hyBUUC5IQ00gKFNhaSBHb24gQ2FtcHVzKQ!5e0!3m2!1svi!2s!4v1765307726304!5m2!1svi!2s"
                      allowFullScreen="" 
                      loading="lazy"
                      title="Google Maps Location"
                    ></iframe>
                  </div>
                </div>

                {/* CỘT PHẢI: FORM LIÊN HỆ */}
                <div className="col-lg-7">
                  <form id="contact-form" action="" method="post">
                    <div className="row">
                      
                      <div className="col-lg-12">
                        <div className="section-heading">
                          <h2>Liên Hệ <em>Với Chúng Tôi</em> &amp; <span>Kết Nối</span></h2>
                          <p style={{color: '#666', fontSize: '15px'}}>Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn về Thần số học.</p>
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <fieldset>
                          <input type="text" name="name" id="name" placeholder="Họ tên của bạn..." autoComplete="on" required />
                        </fieldset>
                      </div>
                      <div className="col-lg-6">
                        <fieldset>
                          <input type="text" name="surname" id="surname" placeholder="Số điện thoại..." autoComplete="on" required />
                        </fieldset>
                      </div>
                      <div className="col-lg-12">
                        <fieldset>
                          <input type="email" name="email" id="email" pattern="[^ @]*@[^ @]*" placeholder="Địa chỉ Email..." required />
                        </fieldset>
                      </div>
                      
                      <div className="col-lg-12">
                        <fieldset>
                          <textarea name="message" id="message" placeholder="Nội dung tin nhắn..."></textarea>
                        </fieldset>
                      </div>
                      
                      <div className="col-lg-12">
                        <fieldset>
                          <button type="submit" id="form-submit" className="orange-button">Gửi Tin Nhắn Ngay</button>
                        </fieldset>
                      </div>

                    </div>
                  </form>

                  {/* THÔNG TIN LIÊN HỆ DƯỚI CÙNG */}
                  <div className="contact-info-row">
                    <div className="row">
                      
                      <div className="col-lg-4">
                        <div className="info-item">
                          <i className="fa fa-phone"></i>
                          <h4>Điện Thoại</h4>
                          <a href="tel:010-020-0340">010-020-0340</a>
                        </div>
                      </div>
                      
                      <div className="col-lg-4">
                        <div className="info-item">
                          <i className="fa fa-envelope"></i>
                          <h4>Email</h4>
                          <a href="mailto:info@company.com">info@numerology.com</a>
                        </div>
                      </div>
                      
                      <div className="col-lg-4">
                        <div className="info-item">
                          <i className="fa fa-map-marker"></i>
                          <h4>Địa Chỉ</h4>
                          <a href="#">TP. Hồ Chí Minh, Việt Nam</a>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;