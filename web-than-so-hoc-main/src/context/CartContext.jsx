import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // --- Load cart từ localStorage ---
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(saved);
  }, []);

  // --- Lắng nghe cập nhật từ các trang khác (ví dụ Shop cập nhật localStorage trực tiếp) ---
  useEffect(() => {
    const handler = () => {
      const saved = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(saved);
    };
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  // --- Hàm cập nhật localStorage + gửi event cho Header ---
  const syncCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // báo cho Header cập nhật badge
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // --- ADD TO CART ---
  const addToCart = (product) => {
    const price = Number(product.price);

    let updated = [...cart];
    const existed = updated.find((p) => p.product_id === product.product_id);

    if (existed) {
      existed.qty += 1;
    } else {
      updated.push({
        product_id: product.product_id,
        product_name: product.product_name,
        image_url: product.image_url,
        price: price,
        qty: 1,
      });
    }

    syncCart(updated);
  };

  // --- REMOVE ITEM ---
  const removeFromCart = (id) => {
    const updated = cart.filter((item) => item.product_id !== id);
    syncCart(updated);
  };

  // --- UPDATE QUANTITY ---
  const updateQty = (id, qty) => {
    let updated = [...cart];
    const item = updated.find((p) => p.product_id === id);

    if (!item) return;

    if (qty <= 0) {
      updated = updated.filter((p) => p.product_id !== id);
    } else {
      item.qty = qty;
    }

    syncCart(updated);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty }}
    >
      {children}
    </CartContext.Provider>
  );
}
