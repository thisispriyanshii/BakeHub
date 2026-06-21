import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminFetchOrders, adminFetchProducts, fetchCoupons } from "../api/client";
import illustrationImg from "../pages/admin-new.png";

function AdminDashboard() {
  const [ordersCount, setOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [couponsCount, setCouponsCount] = useState(0);

  useEffect(() => {
    adminFetchOrders().then((list) => setOrdersCount(list.length)).catch(() => {});
    adminFetchProducts().then((list) => setProductsCount(list.length)).catch(() => {});
    fetchCoupons().then((list) => setCouponsCount(list.length)).catch(() => {});
  }, []);

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div className="hero-left">
          <h1 className="greeting">Hello, Baker <span role="img" aria-label="waving">👋</span></h1>
          <p className="subhead">Here's what's happening in your kitchen today.</p>
        </div>

        <div className="hero-right">
          <img src={illustrationImg} alt="Baking illustration" />
        </div>
      </section>

      <section className="metrics mt-12">
        <div className="metrics-grid">
          <div className="metric-card admin-card">
            <div className="metric-left">
              <div className="metric-icon">🛍️</div>
            </div>
            <div className="metric-body">
              <div className="metric-label">Total Orders</div>
              <div className="metric-number">{ordersCount}</div>
              <Link className="metric-link" to="/admin/orders">View live orders →</Link>
            </div>
          </div>

          <div className="metric-card admin-card">
            <div className="metric-left">
              <div className="metric-icon">🍰</div>
            </div>
            <div className="metric-body">
              <div className="metric-label">Total Products</div>
              <div className="metric-number">{productsCount}</div>
              <Link className="metric-link" to="/admin/products">Manage products →</Link>
            </div>
          </div>

          <div className="metric-card admin-card">
            <div className="metric-left">
              <div className="metric-icon">🎟️</div>
            </div>
            <div className="metric-body">
              <div className="metric-label">Coupons</div>
              <div className="metric-number">{couponsCount}</div>
              <Link className="metric-link" to="/admin/coupons">View coupons →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="quote-banner mt-12">
        <div className="quote-badge">🧁</div>
        <div className="quote-text">"Behind every cake is a story, you're the reason they'll never forget. 💕"</div>
      </section>
    </div>
  );
}

export default AdminDashboard;