import { motion, useReducedMotion } from "motion/react";
import "../styles/About.css";

const EASE_OUT = [0.16, 1, 0.3, 1];

const brands = [
  { name: "Ubiquiti", description: "Enterprise wireless solutions", logo: "ubiquiti.jpg" },
  { name: "MikroTik", description: "Advanced routing systems", logo: "mikrotik.png" },
  { name: "Mimosa", description: "Point-to-point wireless", logo: "mimosa.png" },
  { name: "Tenda", description: "Home and SMB networking", logo: "tenda.png" },
  { name: "TP-Link", description: "Consumer and SMB solutions", logo: "tplink.png" },
  { name: "Netis", description: "Affordable networking", logo: "netis.png" },
];

const values = [
  {
    title: "Quality First",
    description: "Products from official distributors with full manufacturer warranties.",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Customer Focus",
    description: "Expert consultation and reliable support for every networking need.",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: "Innovation",
    description: "Delivering the latest and most advanced networking solutions.",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Reliability",
    description: "Consistent quality, fast delivery, and dependable service.",
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

const stats = [
  { number: "10+", label: "Years of experience" },
  { number: "7", label: "Premium brands" },
  { number: "1000+", label: "Happy customers" },
  { number: "100%", label: "Quality guaranteed" },
];

export const About = () => {
  const reduce = useReducedMotion();
  const fade = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.55, ease: EASE_OUT },
      };

  return (
    <div className="w-100">
      <section className="about-hero">
        <h1 className="about-hero-title">About Us</h1>
        <p className="about-hero-subtitle">
          Your trusted networking solutions partner in Lebanon since 2013.
        </p>
      </section>

      <section className="about-section">
        <div className="about-container">
          <div className="about-content">
            <motion.div {...fade} className="about-text">
              <h2 className="about-heading">Who We Are</h2>
              <p className="about-paragraph">
                <strong>ALL CONNECTIONS SARL</strong> is a telecommunications company
                based in Lebanon, established in 2013. We provide networking solutions
                and products related to network infrastructure.
              </p>
              <p className="about-paragraph">
                Our commitment to excellence and customer satisfaction has made us a
                trusted partner for businesses and individuals seeking reliable
                networking equipment and solutions.
              </p>
            </motion.div>

            <motion.div {...fade} className="about-image-wrapper">
              <img
                src={process.env.PUBLIC_URL + "/assets/brands/about_logo.jpg"}
                alt="Networking equipment workstation"
                className="about-image"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="about-section about-section-accent">
        <div className="about-container">
          <h2 className="about-heading-center">Trusted Brands We Work With</h2>
          <p className="about-paragraph about-paragraph-center">
            We partner with the world's leading networking equipment manufacturers.
          </p>

          <div className="brands-grid">
            {brands.map((brand) => (
              <motion.div {...fade} className="brand-card" key={brand.name}>
                <div className="brand-logo-wrapper">
                  <img
                    src={process.env.PUBLIC_URL + `/assets/brands/${brand.logo}`}
                    alt={brand.name}
                    className="brand-logo-img"
                  />
                </div>
                <h5 className="brand-name">{brand.name}</h5>
                <p className="brand-description">{brand.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <h2 className="about-heading-center">Our Core Values</h2>

          <div className="values-grid">
            {values.map((value) => (
              <motion.div {...fade} className="value-card" key={value.title}>
                <div className="value-icon">{value.icon}</div>
                <h5 className="value-title">{value.title}</h5>
                <p className="value-description">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-section-accent">
        <div className="about-container">
          <div className="stats-grid">
            {stats.map((st) => (
              <motion.div {...fade} className="stat-card" key={st.label}>
                <div className="stat-number">{st.number}</div>
                <div className="stat-label">{st.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container about-mission">
          <h2 className="about-heading-center">Our Mission</h2>
          <p className="about-mission-text">
            To empower businesses and homes in Lebanon with reliable, cutting-edge
            networking solutions that enable seamless connectivity and drive digital
            transformation.
          </p>
        </div>
      </section>
    </div>
  );
};
