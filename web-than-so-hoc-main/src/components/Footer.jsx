import React from 'react';

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="col-lg-12">
          {/* ĐÃ SỬA LỖI DỨT ĐIỂM Ở ĐÂY */}
          <p>Copyright © 2025 <a href="/" onClick={(e) => e.preventDefault()}></a>. All rights reserved.
          
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;