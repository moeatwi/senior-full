import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/NavBar.css";
import { useAuth } from "../context/AuthContext";

export const Navbar = function () {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const cart = useCart();
  const auth = useAuth();

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  function handleSearch(event) {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    navigate("/search?q=" + encodeURIComponent(searchQuery));
    setSearchQuery("");
  }

  function goToCart() {
    navigate("/cart");
  }

  return (
    <nav className="navbar navbar-expand sticky-top acs-navbar">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img
            src={process.env.PUBLIC_URL + "/assets/brands/logo.png"}
            alt="ACS Logo"
            className="navbar-logo-img-large"
          />
        </Link>

        <div className="navbar-collapse">
          <ul className="navbar-nav me-auto mb-0">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/shop" className="nav-link">Shop</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link" >About</Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link">Contact</Link>
            </li>
            <li className="nav-item ms-lg-3">
              <button
                type="button"
                className="nav-link nav-link-admin"
                onClick={() => {
                  if (auth.user) navigate("/admin");
                  else navigate("/login");
                }}
              >
                Admin
              </button>
            </li>
          </ul>

          <div className="navbar-right">
            <form className="navbar-search-form" onSubmit={handleSearch}>
              <input
                className="navbar-search-input"
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="navbar-search-btn" type="submit" aria-label="Search">
                <i className="bi bi-search" />
              </button>
            </form>

            <button
              type="button"
              onClick={goToCart}
              className="navbar-cart-btn"
              aria-label="Cart"
            >
              <i className="bi bi-bag fs-6" />
              {totalItems > 0 && (
                <span className="navbar-cart-badge">{totalItems}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
