import { useCart } from "../context/CartContext";

export default function CartPage() {
  const { cart, updateQty, removeFromCart } = useCart();

  return (
    <div>
      <h1>Giỏ hàng</h1>

      {cart.map(item => (
        <div key={item.product_id} className="cart-item">
          <img src={item.image_url} width={60} />

          <div>{item.product_name}</div>

          <div>
            <button onClick={() => updateQty(item.product_id, -1)}>-</button>
            {item.qty}
            <button onClick={() => updateQty(item.product_id, +1)}>+</button>
          </div>

          <button onClick={() => removeFromCart(item.product_id)}>
            Xóa
          </button>
        </div>
      ))}
    </div>
  );
}
