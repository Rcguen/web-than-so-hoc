import { useEffect, useState } from "react";
import axios from "axios";

export default function ShippingSelect({ onChange }) {
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");

  // load tỉnh
  useEffect(() => {
    axios.get("https://esgoo.net/api-tinhthanh/1/0.htm")
      .then(res => setCities(res.data.data || []));
  }, []);

  // load quận
  useEffect(() => {
    if (!city) return;
    axios.get(`https://esgoo.net/api-tinhthanh/2/${city}.htm`)
      .then(res => setDistricts(res.data.data || []));
  }, [city]);

  // load phường
  useEffect(() => {
    if (!district) return;
    axios.get(`https://esgoo.net/api-tinhthanh/3/${district}.htm`)
      .then(res => setWards(res.data.data || []));
  }, [district]);

  useEffect(() => {
    onChange({ city, district, ward });
  }, [city, district, ward]);

  return (
    <>
      <select onChange={e => setCity(e.target.value)}>
        <option value="">Tỉnh / Thành</option>
        {cities.map(c => (
          <option key={c.id} value={c.id}>{c.full_name}</option>
        ))}
      </select>

      <select onChange={e => setDistrict(e.target.value)}>
        <option value="">Quận / Huyện</option>
        {districts.map(d => (
          <option key={d.id} value={d.id}>{d.full_name}</option>
        ))}
      </select>

      <select onChange={e => setWard(e.target.value)}>
        <option value="">Phường / Xã</option>
        {wards.map(w => (
          <option key={w.id} value={w.full_name}>{w.full_name}</option>
        ))}
      </select>
    </>
  );
}
