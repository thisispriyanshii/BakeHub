import Navbar from "./Navbar";
import "./Celebrations.css";
import { useEffect, useState } from "react";
import { fetchReviews, fetchCoupons } from "../api/client";

function Celebrations() {
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    fetchReviews(3.5, 10).then(setReviews).catch(() => setReviews([]));
    fetchCoupons().then(setCoupons).catch(() => setCoupons([]));
  }, []);

  const applyCoupon = (code) => {
    localStorage.setItem("bakehub_coupon", code);
    window.dispatchEvent(new Event("cart-updated"));
    alert(`Coupon ${code} applied. It will show up in your cart.`);
  };

  return (
    <div className="celebrations-page">
      <Navbar />

      <section className="celebrations-hero">
        <h1>Reviews & Offers</h1>
        <p>Top reviews from customers and available coupon codes for celebrations.</p>
      </section>

      <section className="celebrations-list">
        <h2>Customer Reviews (Top rated)</h2>
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
                <h3>{c.code}</h3>
                <p>{c.discountPercent ? `${c.discountPercent}% off` : "Special offer"} • Min ₹{c.minAmount || 0}</p>
                <div className="offer-qualifier">{c.active ? 'Active' : 'Inactive'}</div>
                <button className="btn btn-primary" style={{marginTop:12}} onClick={() => applyCoupon(c.code)}>Use Code</button>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Celebrations;