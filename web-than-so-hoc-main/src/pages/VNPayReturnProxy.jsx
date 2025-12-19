import React, { useEffect } from "react";

const VNPayReturnProxy = () => {
  useEffect(() => {
    // Forward the query string to backend return handler
    const search = window.location.search || "";
    // Use backend host (127.0.0.1:5000) - ensure backend is running and accessible
    const backendReturn = `http://127.0.0.1:5000/api/vnpay/return${search}`;
    // Use replace so history doesn't keep the proxy URL
    window.location.replace(backendReturn);
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 60 }}>
      <h2>Đang xử lý thanh toán VNPAY...</h2>
      <p>Nếu không tự động chuyển, vui lòng chờ hoặc bấm làm mới trang.</p>
    </div>
  );
};

export default VNPayReturnProxy;
