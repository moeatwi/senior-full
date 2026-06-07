import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../context/ProductContext";
import { categories } from "../data/products";
import "../styles/Home.css";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

const EASE_OUT = [0.16, 1, 0.3, 1];

export function Home() {
  const { products, loading, error } = useProducts();
  const reduce = useReducedMotion();

  const featuredProducts = products.filter(product => product.featured);
  const newArrivals = products.filter(product => product.newarrival);
  const bestSellers = products.filter(product => product.bestseller);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h3>Error Loading Products</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const heroEnter = reduce
    ? {}
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-background">
          <div className="hero-overlay" />
        </div>

        <div className="hero-content">
          <motion.div
            {...heroEnter}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className="hero-eyebrow"
          >
            Lebanon's networking distributor since 2013
          </motion.div>

          <motion.h1
            {...heroEnter}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.05 }}
            className="hero-title"
          >
            Your trusted partner for
            <span className="hero-title-highlight"> networking solutions</span>
          </motion.h1>

          <motion.p
            {...heroEnter}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 }}
            className="hero-description"
          >
            Premium networking equipment from leading brands. WiFi routers, enterprise
            switches, outdoor wireless, and fiber gear supplied across Lebanon.
          </motion.p>

          <motion.div
            {...heroEnter}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 }}
            className="hero-buttons"
          >
            <Link to="/shop" className="hero-button hero-button-primary">
              Shop Now
              <svg className="hero-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/about" className="hero-button hero-button-secondary">
              Learn More
            </Link>
          </motion.div>

          <motion.div
            {...heroEnter}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.25 }}
            className="hero-stats"
          >
            <div>
              <div className="hero-stat-value">10+</div>
              <div className="hero-stat-label">Years in business</div>
            </div>
            <div>
              <div className="hero-stat-value">7</div>
              <div className="hero-stat-label">Premium brands</div>
            </div>
            <div>
              <div className="hero-stat-value">1000+</div>
              <div className="hero-stat-label">Happy customers</div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Shop by Brand</h2>
            <p className="section-description">
              Explore our collection of premium networking brands.
            </p>
          </div>
          <div className="categories-grid">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to="/shop"
                  state={{ brand: category.id }}
                  className="category-card"
                >
                  <div className="category-icon">
                    <img
                      src={process.env.PUBLIC_URL + `/assets/brands/${category.logo}`}
                      alt={category.name}
                      className="brand-logo"
                    />
                  </div>
                  <h3 className="category-name">{category.name}</h3>
                  <span className="category-count">
                    {(category.subcategories || []).length} types
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="section section-accent">
        <div className="section-container">
          <div className="section-header">
            <div className="section-eyebrow">Curated selection</div>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-description">
              Hand-picked products for your networking needs.
            </p>
          </div>
          <div className="products-grid">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.pid} product={product} />
              ))
            ) : (
              <p className="section-empty">No featured products available at the moment.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="home-split">
            <div className="home-split-section">
              <div className="section-header-small">
                <h3 className="section-title-small">New Arrivals</h3>
                <Link to="/shop" className="section-link">
                  View All
                  <svg className="section-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="home-products-list">
                {newArrivals.length > 0 ? (
                  newArrivals.slice(0, 4).map((product) => (
                    <Link
                      key={product.pid}
                      to={`/product/${product.pid}`}
                      className="home-product-item"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="home-product-image"
                      />
                      <div className="home-product-info">
                        <h4 className="home-product-name">{product.name}</h4>
                        <p className="home-product-price">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="section-empty">No new arrivals available at the moment.</p>
                )}
              </div>
            </div>

            <div className="home-split-section">
              <div className="section-header-small">
                <h3 className="section-title-small">Best Sellers</h3>
                <Link to="/shop" className="section-link">
                  View All
                  <svg className="section-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="home-products-list">
                {bestSellers.length > 0 ? (
                  bestSellers.slice(0, 4).map((product) => (
                    <Link
                      key={product.pid}
                      to={`/product/${product.pid}`}
                      className="home-product-item"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="home-product-image"
                      />
                      <div className="home-product-info">
                        <h4 className="home-product-name">{product.name}</h4>
                        <p className="home-product-price">{formatPrice(product.price)}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="section-empty">No best sellers available at the moment.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-container">
          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h4 className="trust-title">Quality Guaranteed</h4>
              <p className="trust-description">
                All products from official distributors with full warranty.
              </p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="trust-title">Fast Delivery</h4>
              <p className="trust-description">
                Quick delivery across Lebanon.
              </p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.5M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h4 className="trust-title">Expert Support</h4>
              <p className="trust-description">
                Professional technical support whenever you need it.
              </p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="trust-title">Best Prices</h4>
              <p className="trust-description">
                Competitive pricing on every product we stock.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
