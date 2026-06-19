import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaHome,
  FaBirthdayCake,
  FaGift,
  FaClipboardList,
  FaBell,
  FaShoppingCart,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import { getToken } from "../api/client";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("bakehub_cart") || "[]");
      setCartItems(cart);
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    loadCart();
    window.addEventListener("cart-updated", loadCart);
    window.addEventListener("storage", loadCart);
    return () => {
      window.removeEventListener("cart-updated", loadCart);
      window.removeEventListener("storage", loadCart);
    };
  }, []);

  const handleRemoveItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    localStorage.setItem("bakehub_cart", JSON.stringify(updated));
    setCartItems(updated);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    setIsDrawerOpen(false);
    navigate("/cart");
  };

  const totalCartItems = cartItems.reduce((sum, item) => {
    const qty = Math.max(0, Math.min(1000, Number(item.quantity) || 1));
    return sum + qty;
  }, 0);

  const totalCartPrice = cartItems.reduce(
    (sum, item) => sum + (item.estimatedPrice || 0),
    0
  );

  return (
    <>
      <nav className="navbar">
        <div className="logo-section">
          <h1 className="logo">
            Bake<span>Hub</span>
          </h1>
          <p className="tagline">CELEBRATIONS. BAKED FRESH.</p>
        </div>

        <div className="nav-links">
          <Link to="/home" className="nav-item">
            <FaHome />
            Home
          </Link>
          <Link to="/menu" className="nav-item">
            <FaClipboardList />
            Menu
          </Link>
          <Link to="/custom-cakes" className="nav-item">
            <FaBirthdayCake />
            Custom Cakes
          </Link>
          <Link to="/celebrations" className="nav-item">
            <FaGift />
            Celebrations
          </Link>
          <Link to="/orders" className="nav-item">
            <FaClipboardList />
            Orders
          </Link>
        </div>

        <div className="right-icons">
          <div className="icon">
            <FaBell />
          </div>

          <div
            className="icon cart-icon-btn"
            onClick={() => setIsDrawerOpen(true)}
            style={{ cursor: "pointer" }}
            title="Open Cart"
          >
            <FaShoppingCart />
            {totalCartItems > 0 && <span>{totalCartItems}</span>}
          </div>

          <div className="profile">P</div>
        </div>
      </nav>

      {/* Cart Drawer */}
      {isDrawerOpen && (
        <div className="cart-drawer-backdrop" onClick={() => setIsDrawerOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <h2>Your Cart ({cartItems.length})</h2>
              <button
                className="close-drawer-btn"
                onClick={() => setIsDrawerOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="cart-drawer-body">
              {feedback.message && (
                <div className={`cart-feedback ${feedback.type}`}>
                  {feedback.message}
                </div>
              )}

              {cartItems.length === 0 ? (
                <div className="cart-empty-state">
                  <span className="empty-cart-icon">🛒</span>
                  <p>Your cart is empty.</p>
                  <Link
                    to="/custom-cakes"
                    className="shop-now-btn"
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    Design a Custom Cake
                  </Link>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item-card">
                              <div className="cart-item-info">
                                <h3>{item.name || item.flavor}</h3>
                                <div className="cart-item-details">
                                  {item.category?.name && <p><span>Category:</span> {item.category.name}</p>}
                                  {item.quantity != null && <p><span>Qty:</span> {item.quantity}</p>}
                                  {item.price != null && <p><span>Unit:</span> ₹{item.price.toFixed(2)}</p>}
                                  <p><span>Total:</span> ₹{(item.estimatedPrice ?? item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              </div>
                          <div className="cart-item-actions">
                            <button
                              className="remove-cart-item-btn"
                              onClick={() => handleRemoveItem(item.id)}
                              title="Remove item"
                            >
                              <FaTrash />
                            </button>
                          </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-total-section">
                  <span>Total Est. Price</span>
                  <strong>₹{totalCartPrice}</strong>
                </div>
                <button
                  className="cart-checkout-btn"
                  onClick={handleCheckout}
                >
                  View Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;