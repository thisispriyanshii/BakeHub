import Navbar from "./Navbar";
import "./Celebrations.css";
import { useEffect, useState } from "react";
import AlertBanner from "../components/AlertBanner";
import { fetchReviews, fetchCoupons } from "../api/client";

function Celebrations() {
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [alert, setAlert] = useState({ type: "", title: "", message: "" });
  const [appliedCouponCode, setAppliedCouponCode] = useState(() => localStorage.getItem("bakehub_coupon") || "");

  useEffect(() => {
    fetchReviews(3.5, 10).then(setReviews).catch(() => setReviews([]));
    fetchCoupons().then(setCoupons).catch(() => setCoupons([]));
  }, []);

  const applyCoupon = (code) => {
    localStorage.setItem("bakehub_coupon", code);
    window.dispatchEvent(new Event("cart-updated"));
    setAppliedCouponCode(code);
    setAlert({ type: "success", title: "Success!", message: `✓ Coupon ${code} applied successfully to cart!` });
  };

  return (
    <div className="celebrations-page">
      <Navbar />

      <section className="celebrations-hero">
        <h1>Reviews & Offers</h1>
        <p>Top reviews from customers and available coupon codes for celebrations.</p>
      </section>

      <AlertBanner
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ type: "", title: "", message: "" })}
      />

      <section className="celebrations-list">
        <h2>Customer Reviews</h2>
        <div className="celebration-grid">
          {reviews.length === 0 ? (
            <p style={{padding:20}}>No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="celebration-card">
                <div style={{fontSize:20, marginBottom:8}}><strong>{r.user?.name || 'Anonymous'}</strong> — {r.rating} ⭐</div>
                <p>{r.text}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="offers-section">
        <h2>Available Coupon Codes</h2>
        <div className="offers-grid">
          {coupons.length === 0 ? (
            <p style={{padding:20}}>No coupons available.</p>
          ) : (
            coupons.map((c) => (
              <article key={c.id} className="offer-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px" }}>
                  <div>
                    <h3>{c.code}</h3>
                  </div>
                  {appliedCouponCode === c.code && (
                    <div className="coupon-applied-badge">✓ Applied</div>
                  )}
                </div>
                <p>
                  {c.type === "FLAT"
                    ? `Flat ₹${c.flatAmount || 0} off`
                    : `${c.discountPercent || 0}% off`}
                  {' '}• Min ₹{c.minAmount || 0}
                </p>
                <p>{c.expiresAt ? `Expires ${c.expiresAt}` : "No expiry"}</p>
                <div className="offer-qualifier">{c.active ? 'Active' : 'Inactive'}</div>
                <button 
                  className={`btn btn-primary ${appliedCouponCode === c.code ? "applied" : ""}`}
                  style={{marginTop:12}} 
                  onClick={() => applyCoupon(c.code)}
                  disabled={appliedCouponCode === c.code}
                >
                  {appliedCouponCode === c.code ? "✓ Applied" : "Use Code"}
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Celebrations;