import React from "react";
import { Link, Outlet } from "react-router-dom";
import "../pages/Home.css";
import "../pages/Navbar.css";
import "./admin.css";
import ErrorBoundary from "./ErrorBoundary";

function AdminLayout() {
  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>BakeHub</h2>
          <span className="admin-sub">Administrator</span>
        </div>
        <nav className="admin-nav">
          <ul>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/orders">Live Orders</Link></li>
            <li><Link to="/admin/products">Menu & Products</Link></li>
            <li><Link to="/admin/coupons">Coupons</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-container">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;