import React from 'react';

function Header() {
  return (
    <>
      <div className="pre-header">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-sm-9">
              <div className="left-info">
                <ul>
                  {/* Sửa thông tin liên hệ ở đây */}
                  <li><a href="/" onClick={(e) => e.preventDefault()}><i className="fa fa-phone"></i>0987.654.321</a></li>
                  <li><a href="/" onClick={(e) => e.preventDefault()}><i className="fa fa-envelope"></i>info@thansohoc.com</a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-4 col-sm-3">
              <div className="social-icons">
                <ul>
                  <li><a href="/" onClick={(e) => e.preventDefault()}><i className="fab fa-facebook"></i></a></li>
                  <li><a href="/" onClick={(e) => e.preventDefault()}><i className="fab fa-twitter"></i></a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <header className="header-area header-sticky">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <nav className="main-nav">
                <a href="/" className="logo">
                  <img src="/assets/images/logo.png" alt="" style={{ maxWidth: '112px' }} />
                </a>
                <ul className="nav">
                  {/* Sửa các mục menu ở đây */}
                  <li className="scroll-to-section"><a href="#top" className="active">Trang Chủ</a></li>
                  <li className="scroll-to-section"><a href="#services">Các Chỉ Số</a></li>
                  <li className="scroll-to-section"><a href="#projects">Báo Cáo Mẫu</a></li>
                  <li className="scroll-to-section"><a href="#infos">Giới Thiệu</a></li>
                  <li className="scroll-to-section"><a href="#contact">Liên Hệ</a></li>
                </ul>
                <a className='menu-trigger'>
                  <span>Menu</span>
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;