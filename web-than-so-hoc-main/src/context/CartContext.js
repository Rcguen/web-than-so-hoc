import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart từ localStorage khi mở web
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Lưu lại cart vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Thêm sản phẩm vào cart
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.product_id === product.product_id);

      if (existing) {
        return prev.map((p) =>
          p.product_id === product.product_id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Giảm số lượng
  const decreaseItem = (product_id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product_id === product_id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Xóa sản phẩm
  const removeItem = (product_id) => {
    setCart((prev) => prev.filter((item) => item.product_id !== product_id));
  };

  // Xóa hết cart
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, decreaseItem, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
