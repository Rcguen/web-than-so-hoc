import React from 'react';

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="col-lg-12">
          {/* ĐÃ SỬA LỖI DỨT ĐIỂM Ở ĐÂY */}
          <p>Copyright © 2036 <a href="/" onClick={(e) => e.preventDefault()}>Tale SEO Agency</a>. All rights reserved.
            <br />Design: <a href="https://templatemo.com" target="_blank" rel="noopener noreferrer">TemplateMo</a> Distribution: <a
              href="https://themewagon.com" rel="noopener noreferrer">ThemeWagon</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;