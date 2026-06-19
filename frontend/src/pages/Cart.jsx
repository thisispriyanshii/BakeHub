import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { submitMenuOrder, getToken } from "../api/client";
import "./Cart.css";

const CART_KEY = "bakehub_cart";

function parseStoredCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => ({
      ...item,
      quantity: Number(item.quantity) || 1,
      estimatedPrice: Number(item.estimatedPrice) || Number(item.price) * (Number(item.quantity) || 1),
      type: item.type || (item.price != null ? "menu" : "custom"),
    }));
  } catch {
    return [];
  }
}

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(() => parseStoredCart());
  const [address, setAddress] = useState("");
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0),
    [cartItems]
  );

  useEffect(() => {
    const handleCartUpdated = () => setCartItems(parseStoredCart());
    window.addEventListener("cart-updated", handleCartUpdated);
    window.addEventListener("storage", handleCartUpdated);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
      window.removeEventListener("storage", handleCartUpdated);
    };
  }, []);

  const handleRemove = (id) => {
    const nextItems = cartItems.filter((item) => item.id !== id);
    localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cart-updated"));
    setCartItems(nextItems);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setFeedback({ type: "error", message: "Your cart is empty." });
      return;
    }

    if (!address.trim()) {
      setFeedback({ type: "error", message: "Please enter a delivery address." });
      return;
    }

    if (!getToken()) {
      setFeedback({ type: "error", message: "Please log in to complete checkout." });
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const menuItems = cartItems.filter((item) => item.type === "menu");
    if (menuItems.length === 0) {
      setFeedback({ type: "error", message: "No menu items found in cart." });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const orderPayload = {
        userId: null,
        deliveryAddress: address.trim(),
        latitude: null,
        longitude: null,
        items: menuItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          customizationDetails: JSON.stringify({
            name: item.name,
          }),
        })),
      };

      await submitMenuOrder(orderPayload);

      const remainingItems = cartItems.filter((item) => item.type !== "menu");
      localStorage.setItem(CART_KEY, JSON.stringify(remainingItems));
      window.dispatchEvent(new Event("cart-updated"));
      setCartItems(remainingItems);

      setFeedback({ type: "success", message: "Order placed successfully! Redirecting to orders..." });
      setTimeout(() => navigate("/orders"), 2000);
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Order submission failed." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-page">
      <Navbar />
      <section className="cart-hero">
        <div>
          <span className="eyebrow">Your Cart</span>
          <h1>Review your items and delivery details.</h1>
          <p>Add a delivery address, then place your order for fast checkout.</p>
        </div>
      </section>

      <main className="cart-content">
        <div className="cart-left">
          {feedback.message && <div className={`cart-feedback ${feedback.type}`}>{feedback.message}</div>}

          <div className="cart-items">
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <p>Your cart is empty.</p>
                <button type="button" onClick={() => navigate("/menu")}>Browse Menu</button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="cart-item-row">
                  <div className="cart-item-image">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : null}
                  </div>
                  <div className="cart-item-meta">
                    <h3>{item.name || item.flavor}</h3>
                    <p>Quantity: {item.quantity}</p>
                    <p>₹{(item.estimatedPrice || item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button type="button" className="remove-btn" onClick={() => handleRemove(item.id)}>
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="cart-aside">
          <div className="cart-summary">
            <h2>Delivery details</h2>
            <label>
              Address
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Enter your delivery address"
              />
            </label>
            <div className="summary-row">
              <span>Total</span>
              <strong>₹{totalPrice.toFixed(2)}</strong>
            </div>
            <button type="button" className="checkout-btn" onClick={handleCheckout} disabled={isSubmitting}>
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Cart;
