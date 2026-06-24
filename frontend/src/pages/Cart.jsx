import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import rightImg from "../assets/custom.jpeg";
import { fetchCoupons, submitMenuOrder, submitCustomCakeOrder, getToken } from "../api/client";
import "./Cart.css";

const CART_KEY = "bakehub_cart";

function parseStoredCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => ({
      ...item,
      productId: item.productId || item.id,
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
  const [couponCode, setCouponCode] = useState(() => localStorage.getItem("bakehub_coupon") || "");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0),
    [cartItems]
  );

  const loadCoupons = async () => {
    setCouponLoading(true);
    try {
      const coupons = await fetchCoupons();
      setAvailableCoupons(coupons);
      const code = localStorage.getItem("bakehub_coupon") || "";
      setCouponCode(code);
      setAppliedCoupon(coupons.find((coupon) => coupon.code === code) || null);
    } catch (error) {
      console.error("Failed to load coupons", error);
      setAvailableCoupons([]);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    const handleCartUpdated = () => {
      setCartItems(parseStoredCart());
      const code = localStorage.getItem("bakehub_coupon") || "";
      setCouponCode(code);
      setAppliedCoupon(availableCoupons.find((coupon) => coupon.code === code) || null);
    };

    window.addEventListener("cart-updated", handleCartUpdated);
    window.addEventListener("storage", handleCartUpdated);
    loadCoupons();

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
      window.removeEventListener("storage", handleCartUpdated);
    };
  }, [availableCoupons]);

  const handleRemove = (id) => {
    const nextItems = cartItems.filter((item) => item.id !== id);
    localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cart-updated"));
    setCartItems(nextItems);
  };

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || totalPrice <= 0) return 0;
    const minAmount = Number(appliedCoupon.minAmount) || 0;
    if (totalPrice < minAmount) return 0;

    const type = appliedCoupon.type || "PERCENTAGE";
    if (type === "FLAT") {
      return Math.min(Number(appliedCoupon.flatAmount) || 0, totalPrice);
    }

    const discountPercent = Number(appliedCoupon.discountPercent) || 0;
    if (discountPercent <= 0) return 0;
    return totalPrice * (discountPercent / 100);
  }, [appliedCoupon, totalPrice]);

  const discountedTotal = useMemo(() => {
    return Math.max(0, totalPrice - couponDiscount);
  }, [totalPrice, couponDiscount]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setFeedback({ type: "error", message: "Your cart is empty." });
      return;
    }

    const trimmedAddress = (address || '').trim();
    if (!trimmedAddress) {
      setFeedback({ type: "error", message: "Please enter a delivery address." });
      return;
    }

    // Basic delivery address validation: require reasonable length and at least one alphanumeric character
    if (trimmedAddress.length < 10) {
      setFeedback({ type: "error", message: "Please enter a more detailed delivery address (at least 10 characters)." });
      return;
    }

    if (!/[A-Za-z0-9]/.test(trimmedAddress)) {
      setFeedback({ type: "error", message: "Please enter a valid delivery address." });
      return;
    }

    // Require a 6-digit pincode (e.g., Indian pincode) somewhere in the address
    const pincodeMatch = trimmedAddress.match(/\b(\d{6})\b/);
    if (!pincodeMatch) {
      setFeedback({ type: "error", message: "Please include a valid 6-digit pincode in the delivery address." });
      return;
    }
    const deliveryPincode = pincodeMatch[1];

    if (!getToken()) {
      setFeedback({ type: "error", message: "Please log in to complete checkout." });
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    const menuItems = cartItems.filter((item) => item.type === "menu");
    const customItems = cartItems.filter((item) => item.type === "custom");

    if (menuItems.length === 0 && customItems.length === 0) {
      setFeedback({ type: "error", message: "No items found in cart." });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const appliedCoupon = localStorage.getItem("bakehub_coupon") || null;

      if (menuItems.length > 0) {
        const orderPayload = {
          deliveryAddress: trimmedAddress,
          deliveryPincode,
          items: menuItems.map((item) => ({
            productId: item.productId || item.id,
            quantity: item.quantity,
            customizationDetails: item.customizationDetails ?? null,
          })),
          couponCode: appliedCoupon,
        };

        await submitMenuOrder(orderPayload);
      }

      for (const item of customItems) {
        const customPayload = {
          ...item,
          deliveryAddress: trimmedAddress,
          deliveryPincode,
          couponCode: localStorage.getItem("bakehub_coupon") || null,
        };
        await submitCustomCakeOrder(customPayload);
      }

      const remainingItems = [];
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
          <h1>Review your items and delivery details!</h1>
          <p>Add a delivery address, then place your order for fast checkout</p>
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
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : item.type === "custom" ? (
                      <img src={rightImg} alt="Custom Cake" className="cart-item-custom-image" />
                    ) : null}
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
            {couponCode ? (
              <div style={{ marginTop: 12 }}>
                <div>
                  <strong>Applied Coupon:</strong> {couponCode}
                  {appliedCoupon ? (
                    <span>
                      {' '}
                      — {appliedCoupon.type === "FLAT"
                        ? `Flat ₹${appliedCoupon.flatAmount || 0} off`
                        : `${appliedCoupon.discountPercent || 0}% off`}
                    </span>
                  ) : couponLoading ? (
                    <span> — validating...</span>
                  ) : (
                    <span> — invalid or expired</span>
                  )}
                </div>
                <button
                  type="button"
                  className="coupon-remove-text"
                  onClick={() => {
                    localStorage.removeItem("bakehub_coupon");
                    window.dispatchEvent(new Event("cart-updated"));
                    setCouponCode("");
                    setAppliedCoupon(null);
                    setFeedback({ type: "success", message: "Coupon removed" });
                  }}
                >
                  Remove
                </button>
              </div>
            ) : null}
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₹{totalPrice.toFixed(2)}</strong>
            </div>
            {couponDiscount > 0 ? (
              <>
                <div className="summary-row">
                  <span>Coupon discount</span>
                  <strong>-₹{couponDiscount.toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>Total after discount</span>
                  <strong>₹{discountedTotal.toFixed(2)}</strong>
                </div>
              </>
            ) : couponCode ? (
              <div className="summary-row">
                <span>Coupon not applied</span>
                <strong>₹{totalPrice.toFixed(2)}</strong>
              </div>
            ) : null}
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
