import { Link } from "react-router-dom";

import {
  FaHome,
  FaBirthdayCake,
  FaGift,
  FaClipboardList,
  FaBell,
  FaShoppingCart,
} from "react-icons/fa";

import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <div className="logo-section">
        <h1 className="logo">
          Bake<span>Hub</span>
        </h1>

        <p className="tagline">
          CELEBRATIONS. BAKED FRESH.
        </p>
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

        <div className="icon">
          <FaShoppingCart />
        </div>

        <div className="profile">
          P
        </div>

      </div>

    </nav>
  );
}

export default Navbar;