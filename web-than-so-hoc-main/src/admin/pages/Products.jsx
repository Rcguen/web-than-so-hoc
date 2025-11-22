import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ product_name: "", price: "", image_url: "" });

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/api/admin/products");
      setProducts(res.data.products || []);
    } catch (err) {
      alert("Không thể tải sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ product_name: "", price: "", image_url: "" });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p.product_id);
    setForm({ product_name: p.product_name, price: p.price, image_url: p.image_url });
    setModalOpen(true);
  };

  const saveProduct = async () => {
    try {
      if (editingProduct) {
        await axios.put(`http://127.0.0.1:5000/api/admin/products/${editingProduct}`, form);
      } else {
        await axios.post("http://127.0.0.1:5000/api/admin/products", form);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert("Lỗi lưu sản phẩm!");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa?") ) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Không thể xóa sản phẩm!");
    }
  };

  if (loading) return <div className="admin-loading">Đang tải...</div>;

  return (
    <div className="admin-products-page">
      <style>{`
        .admin-products-page { padding: 20px; }
        .page-title { font-size: 28px; font-weight: bold; color: #5a00e0; margin-bottom: 20px; }
        .add-btn {
          background: #6d00ff; color: #fff; padding: 10px 18px; border-radius: 8px;
          border: none; cursor: pointer; font-size: 15px; margin-bottom: 20px; transition: 0.2s;
        }
        .add-btn:hover { background: #5500c9; }

        .products-table {
          width: 100%; border-collapse: collapse; background: #fff;
          border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .products-table th {
          background: #6d00ff; color: #fff; padding: 14px; text-align: left; font-size: 15px;
        }
        .products-table td {
          padding: 12px; border-bottom: 1px solid #eee; font-size: 14px;
        }
        .products-table img { border-radius: 8px; }

        .action-btn {
          padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer;
          margin-right: 8px; font-size: 13px; transition: 0.2s;
        }

        .edit-btn { background: #00b894; color: #fff; }
        .edit-btn:hover { background: #009f7a; }
        .delete-btn { background: #d63031; color: #fff; }
        .delete-btn:hover { background: #b02323; }

        /* MODAL */
        .modal {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.5); display: flex; align-items: center;
          justify-content: center; z-index: 2000;
        }
        .modal-box {
          background: #fff; padding: 25px; width: 420px;
          border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          animation: popup 0.25s ease;
        }
        @keyframes popup {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-box h2 {
          margin-bottom: 15px; color: #5a00e0;
        }

        .modal-box input {
          width: 100%; padding: 10px 12px; border-radius: 6px; margin-bottom: 10px;
          border: 1px solid #bbb; font-size: 14px;
        }

        .modal-actions {
          display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;
        }
        .cancel-btn, .save-btn {
          padding: 8px 14px; border-radius: 6px; font-size: 14px; cursor: pointer; border: none;
        }
        .cancel-btn { background: #ccc; }
        .save-btn { background: #6d00ff; color: #fff; }
        .save-btn:hover { background: #5500c9; }
      `}</style>


      <h1 className="page-title">Quản lý sản phẩm</h1>

      <button className="add-btn" onClick={openAdd}>+ Thêm sản phẩm</button>

      <table className="products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.product_id}>
              <td>{p.product_id}</td>
              <td><img src={p.image_url} alt="img" height="50" /></td>
              <td>{p.product_name}</td>
              <td>{Number(p.price).toLocaleString()} đ</td>
              <td>
                <button className="action-btn edit-btn" onClick={() => openEdit(p)}>Sửa</button>
                <button className="action-btn delete-btn" onClick={() => deleteProduct(p.product_id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal">
          <div className="modal-box">
            <h2>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

            <input placeholder="Tên sản phẩm" value={form.product_name} onChange={(e)=>setForm({...form, product_name:e.target.value})}/>
            <input placeholder="Giá" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})}/>
            <input placeholder="URL hình ảnh" value={form.image_url} onChange={(e)=>setForm({...form, image_url:e.target.value})}/>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setModalOpen(false)}>Hủy</button>
              <button className="save-btn" onClick={saveProduct}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
