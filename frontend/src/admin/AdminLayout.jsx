import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "../pages/Home.css";
import "../pages/Navbar.css";
import "./admin.css";
import ErrorBoundary from "./ErrorBoundary";
import { getStoredUser, clearAuthSession } from "../api/client";

function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = getStoredUser();
  const initial = (user && user.name) ? user.name.charAt(0).toUpperCase() : "A";

  const handleSignOut = () => {
    clearAuthSession();
    navigate('/login');
  };

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

        <div className="admin-actions">
          <div className="admin-user-wrap">
            <button className="admin-user-pill" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Account">{initial}</button>
            {menuOpen && (
              <div className="admin-user-menu">
                <button className="btn btn-ghost" onClick={handleSignOut}>Log out</button>
              </div>
            )}
          </div>
        </div>
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