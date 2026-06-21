import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

import { getToken, fetchMyOrders, getStoredUser, clearAuthSession } from "../api/client";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [notifCount, setNotifCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

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

  useEffect(() => {
    if (!getToken()) return;
    fetchMyOrders().then(list => {
      try {
        const now = new Date();
        const twoDays = new Date(now.getFullYear(), now.getMonth(), now.getDate()+2);
        const count = (list || []).filter(o => o.deliveryDate && o.occasion).filter(o => {
          const d = new Date(o.deliveryDate);
          return d.getFullYear()===twoDays.getFullYear() && d.getMonth()===twoDays.getMonth() && d.getDate()===twoDays.getDate();
        }).length;
        setNotifCount(count);
      } catch(e) { setNotifCount(0); }
    }).catch(()=>{});
  }, []);

  useEffect(() => {
    const user = getStoredUser();
    setIsAdmin(user?.role === 'ADMIN');
    const onStorage = () => {
      const u = getStoredUser();
      setIsAdmin(u?.role === 'ADMIN');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const scrollBarGap = window.innerWidth - html.clientWidth;

    if (isDrawerOpen) {
      html.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      if (scrollBarGap > 0) {
        html.style.paddingRight = `${scrollBarGap}px`;
        document.body.style.paddingRight = `${scrollBarGap}px`;
      }
    } else {
      html.style.overflow = "";
      document.body.style.overflow = "";
      html.style.paddingRight = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      html.style.overflow = "";
      document.body.style.overflow = "";
      html.style.paddingRight = "";
      document.body.style.paddingRight = "";
    };
  }, [isDrawerOpen]);

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

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const user = getStoredUser();
  const userInitial = (user && user.name) ? user.name.charAt(0).toUpperCase() : 'P';

  const handleSignOut = () => {
    clearAuthSession();
    navigate('/login');
  };

  const handleMyOrders = () => {
    setUserMenuOpen(false);
    navigate('/orders');
  };

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
          {isAdmin && (
            <Link to="/admin" className="nav-item">
              <FaClipboardList />
              Admin
            </Link>
          )}
        </div>

        <div className="right-icons">
          <Link to="/celebrations" className="icon notification-icon" title="Celebrations">
            <FaBell />
            {notifCount>0 && <span className="notif-badge">{notifCount}</span>}
          </Link>

          <div
            className="icon cart-icon-btn"
            onClick={() => setIsDrawerOpen(true)}
            style={{ cursor: "pointer" }}
            title="Open Cart"
          >
            <FaShoppingCart />
            {totalCartItems > 0 && <span>{totalCartItems}</span>}
          </div>

          <div className="profile-wrap">
            <button className="profile" onClick={()=>setUserMenuOpen(!userMenuOpen)} aria-label="Account">{userInitial}</button>
            {userMenuOpen && (
              <div className="profile-menu" onMouseLeave={()=>setUserMenuOpen(false)}>
                <button className="profile-menu-item" onClick={handleMyOrders}>My orders</button>
                <button className="profile-menu-item" onClick={handleSignOut}>Log out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isDrawerOpen &&
        createPortal(
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
          </div>,
          document.body
        )}
    </>
  );
}

export default Navbar;