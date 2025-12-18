import { useEffect, useState } from "react";
import axios from "axios";

export default function ShippingSelector({ onChange }) {
  // danh sách
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // ID để gọi API esgoo
  const [cityId, setCityId] = useState("");
  const [districtId, setDistrictId] = useState("");

  // TÊN để gửi backend
  const [cityName, setCityName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const [shippingFee, setShippingFee] = useState(0);

  // 1️⃣ Load tỉnh
  useEffect(() => {
    axios
      .get("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then((res) => setCities(res.data.data || []));
  }, []);

  // 2️⃣ Load quận theo ID tỉnh
  useEffect(() => {
    if (!cityId) return;

    axios
      .get(`https://esgoo.net/api-tinhthanh/2/${cityId}.htm`)
      .then((res) => {
        setDistricts(res.data.data || []);
        setWards([]);
        setDistrictId("");
        setDistrictName("");
        setWardName("");
      });
  }, [cityId]);

  // 3️⃣ Load phường theo ID quận
  useEffect(() => {
    if (!districtId) return;

    axios
      .get(`https://esgoo.net/api-tinhthanh/3/${districtId}.htm`)
      .then((res) => {
        setWards(res.data.data || []);
        setWardName("");
      });
  }, [districtId]);

  // 4️⃣ Lấy phí ship khi đã đủ địa chỉ
  useEffect(() => {
    if (!cityName || !districtName || !wardName) return;

    axios
      .get("http://127.0.0.1:5000/api/shipping", {
        params: {
          city: cityName,
          district: districtName,
          ward: wardName,
        },
      })
      .then((res) => {
        const fee = Number(res.data.shipping_fee || 0);
setShippingFee(fee);

onChange({
  city: cityName,
  district: districtName,
  ward: wardName,
  shipping_fee: fee,
});

      });
  }, [cityName, districtName, wardName]);

  return (
    <div className="shipping-box">
      <h3>📍 Địa chỉ giao hàng</h3>

      {/* TỈNH */}
      <select
        value={cityId}
        onChange={(e) => {
          const id = e.target.value;
          const name =
            e.target.options[e.target.selectedIndex].text;

          setCityId(id);
          setCityName(name);
        }}
      >
        <option value="">Tỉnh / Thành</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.full_name}
          </option>
        ))}
      </select>

      {/* QUẬN */}
      <select
        value={districtId}
        onChange={(e) => {
          const id = e.target.value;
          const name =
            e.target.options[e.target.selectedIndex].text;

          setDistrictId(id);
          setDistrictName(name);
        }}
        disabled={!districts.length}
      >
        <option value="">Quận / Huyện</option>
        {districts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.full_name}
          </option>
        ))}
      </select>

      {/* PHƯỜNG */}
      <select
        value={wardName}
        onChange={(e) => setWardName(e.target.value)}
        disabled={!wards.length}
      >
        <option value="">Phường / Xã</option>
        {wards.map((w) => (
          <option key={w.id} value={w.full_name}>
            {w.full_name}
          </option>
        ))}
      </select>

      <p>
        🚚 Phí vận chuyển:{" "}
        <b>{shippingFee.toLocaleString()} đ</b>
      </p>
    </div>
  );
}
