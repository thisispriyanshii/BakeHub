import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import "../pages/Home.css";
import "../pages/Navbar.css";
import "./admin.css";
import ErrorBoundary from "./ErrorBoundary";

function AdminLayout() {
  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="admin-brand">
          <h2>BakeHub</h2>
          <span className="admin-sub">Administrator</span>
        </div>

        <nav className="admin-nav">
          <ul>
            <li><NavLink to="/admin" end>Dashboard</NavLink></li>
            <li><NavLink to="/admin/orders">Live Orders</NavLink></li>
            <li><NavLink to="/admin/products">Menu & Products</NavLink></li>
            <li><NavLink to="/admin/coupons">Coupons</NavLink></li>
          </ul>
        </nav>
      </header>

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