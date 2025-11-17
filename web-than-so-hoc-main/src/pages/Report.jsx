import React from "react";
import Lookup from "../components/Lookup.jsx";
import BirthChart from "./BirthChart.jsx";
import LifePinnaclePyramid from "../components/LifePinnaclePyramid.jsx";

function Report() {
  return (
    <div className="lookup-section">
      <h1 style={{ color: "#5b03e4", marginBottom: "30px" }}>📜 Báo Cáo Tổng Hợp Thần Số Học</h1>
      <Lookup />
      <hr style={{ margin: "50px 0", border: "1px dashed #ddd" }} />
      <BirthChart />
      <hr style={{ margin: "50px 0", border: "1px dashed #ddd" }} />
      <LifePinnaclePyramid />
    </div>
  );
}

export default Report;
