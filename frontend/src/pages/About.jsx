import { useEffect } from "react";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import "./About.css";

function About() {
  useEffect(() => {
    // ensure we start at the top of the About page when navigated to
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      <Navbar />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Our Story</h1>
          <p className="about-subtitle">Crafted with love, delivered with care</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="story-section">
        <div className="story-container">
          <div className="story-card">
            <div className="story-icon"></div>
            <h2>A Little About Us🌸</h2>
            <p>
              BakeHub was created to make celebrations effortless. From birthdays and anniversaries 
              to last-minute sweet cravings, we believe every occasion deserves freshly baked treats 
              delivered with care.
            </p>
            <p>
              As a cloud kitchen, we focus on quality baking and seamless delivery, allowing us to 
              serve customers efficiently without the overhead of a traditional storefront.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose BakeHub Section */}
      <section className="why-section">
        <div className="why-container">
          <h2 className="section-title">Why Choose BakeHub🎂 </h2>
          <div className="benefits-grid">
            {[
              {
                icon: "🍰",
                title: "Freshly Baked Daily",
                desc: "Made to order using quality ingredients"
              },
              {
                icon: "✨",
                title: "Custom Cake Design",
                desc: "Personalize flavors, shapes, frostings and messages"
              },
              {
                icon: "🤝",
                title: "Doorstep Delivery",
                desc: "Reliable delivery for every celebration"
              },
              {
                icon: "💝",
                title: "Gift Hampers",
                desc: "Curated collections for your loved ones"
              }
            ].map((benefit, idx) => (
              <div key={idx} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different Section */}
      <section className="difference-section">
        <div className="difference-container">
          <h2 className="section-title">What Makes Us Different🎉 </h2>
          <div className="difference-content">
            <div className="difference-list">
              <div className="difference-item">
                <span className="checkmark">✓</span>
                <span>Freshly Baked Daily</span>
              </div>
              <div className="difference-item">
                <span className="checkmark">✓</span>
                <span>Premium Ingredients</span>
              </div>
              <div className="difference-item">
                <span className="checkmark">✓</span>
                <span>Handcrafted Desserts</span>
              </div>
              <div className="difference-item">
                <span className="checkmark">✓</span>
                <span>Curated Gift Hampers</span>
              </div>
              <div className="difference-item">
                <span className="checkmark">✓</span>
                <span>Doorstep Delivery</span>
              </div>
            </div>
            <div className="difference-message">
              <div className="made-with-care">Made with Care</div>
              <p>Every order is prepared with attention to detail and passion for baking excellence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="cta-content">
          <h2>Ready to Experience BakeHub?</h2>
          <p>Start exploring our menu and discover freshly baked treats for every celebration</p>
          <Link to="/menu" className="cta-btn">Explore Menu →</Link>
        </div>
      </section>
    </div>
  );
}

export default About;
