import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    product_name: "",
    price: "",
    image_url: "",
    description: "",
    category_id: ""
  });

  // Load danh sách sản phẩm
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

  useEffect(() => {
    fetchProducts();
  }, []);

  // Mở modal thêm
  const openAdd = () => {
    setEditingProduct(null);
    setForm({
      product_name: "",
      price: "",
      image_url: "",
      description: "",
      category_id: ""
    });
    setModalOpen(true);
  };

  // Mở modal sửa
  const openEdit = (p) => {
    setEditingProduct(p.product_id);
    setForm({
      product_name: p.product_name,
      price: p.price,
      image_url: p.image_url,
      description: p.description,
      category_id: p.category_id
    });
    setModalOpen(true);
  };

  // Lưu sản phẩm
  const saveProduct = async () => {
    try {
      if (editingProduct) {
        await axios.put(
          `http://127.0.0.1:5000/api/admin/products/${editingProduct}`,
          form
        );
      } else {
        await axios.post("http://127.0.0.1:5000/api/admin/products", form);
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert("Lỗi lưu sản phẩm!");
    }
  };

  // Xóa sản phẩm
  const deleteProduct = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/api/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Không thể xóa sản phẩm!");
    }
  };

  if (loading) return <div>Đang tải sản phẩm...</div>;

  return (
    <div className="admin-products-page">
      <style>{`
        .admin-products-page { padding: 20px; }

        .page-title {
          font-size: 28px;
          font-weight: bold;
          color: #6d00ff;
          margin-bottom: 20px;
        }

        .add-btn {
          background: #6d00ff;
          color: #fff;
          padding: 10px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 15px;
          margin-bottom: 20px;
        }
        .add-btn:hover { background: #5500c9; }

        /* Table */
        .products-table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .products-table th {
          background: #6d00ff;
          color: #fff;
          padding: 14px;
        }
        .products-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }

        .action-btn {
          padding: 6px 12px;
          border-radius: 6px;
          margin-right: 10px;
          border: none;
          cursor: pointer;
          font-size: 14px;
        }
        .edit-btn { background: #00b894; color: white; }
        .delete-btn { background: #d63031; color: white; }

        /* Modal */
        .modal {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.45);
          display: flex; justify-content: center; align-items: center;
        }

        .modal-box {
          background: white;
          width: 420px;
          border-radius: 12px;
          padding: 25px;
          animation: popup 0.25s ease;
        }

        @keyframes popup {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-box input, .modal-box textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 12px;
          border-radius: 6px;
          border: 1px solid #aaa;
        }

        .modal-actions {
          display: flex; justify-content: flex-end; gap: 10px;
        }

        .cancel-btn {
          background: #ccc; padding: 8px 14px; border-radius: 6px; cursor: pointer;
        }
        .save-btn {
          background: #6d00ff; color: #fff;
          padding: 8px 14px; border-radius: 6px; cursor: pointer;
        }
      `}</style>

      <h1 className="page-title">Quản lý sản phẩm</h1>

      <button className="add-btn" onClick={openAdd}>
        + Thêm sản phẩm
      </button>

      <table className="products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ảnh</th>
            <th>Tên</th>
            <th>Giá</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.product_id}>
              <td>{p.product_id}</td>
              <td>
                <img src={p.image_url} height="55" alt="" />
              </td>
              <td>{p.product_name}</td>
              <td>{Number(p.price).toLocaleString()} đ</td>
              <td>
                <button className="action-btn edit-btn" onClick={() => openEdit(p)}>
                  Sửa
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => deleteProduct(p.product_id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal">
          <div className="modal-box">
            <h2>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

            <input
              placeholder="Tên sản phẩm"
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
            />

            <input
              placeholder="Giá"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            <input
              placeholder="URL hình ảnh"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />

            <textarea
              placeholder="Mô tả"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            ></textarea>

            <input
              placeholder="Category ID"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            />

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setModalOpen(false)}>
                Hủy
              </button>
              <button className="save-btn" onClick={saveProduct}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
