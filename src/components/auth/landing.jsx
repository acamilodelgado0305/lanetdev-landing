import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./auth.css";
import { GiHamburgerMenu } from "react-icons/gi";

function Landing() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="landing-container">
      <div className="impresion-1">
        <header className="landing-header">
          <div className="header-content">
            <h1>LANET</h1>
            <nav>
              <a href="#about">Hogar</a>
              <a href="#services">Empresas</a>
            </nav>
          </div>
          <div className="button-container">
            <Link to="/signin">
              <button className="btn btn-secondary">Sign In</button>
            </Link>
            <button className="btn btn-primary" onClick={openModal}>
              Get Started
            </button>
            <GiHamburgerMenu size={30} style={{ paddingTop: "1em" }} />
          </div>
        </header>

        <main className="landing-main">
          <section className="hero">
            <h2>LANET PARA EL HOGAR</h2>
            <p>
              Si necesitas internet para tu hogar, en LANET
              tenemos la solución perfecta para ti
            </p>
            <button className="btn btn-primary btn-large">
              Cotizar
            </button>
          </section>
        </main>
      </div>

      <div className="content">
        <section id="about" className="info-section">
          <h3>VEA PELÍCULAS, HAGA VIDEOLLAMADAS, JUEGUE Y MÁS</h3>
          <p>
          
          </p>
        </section>

        <section id="services" className="info-section">
          <h3>Our Services</h3>
          <ul>
            <li>High-speed broadband</li>
            <li>Low latency connections</li>
            <li>Reliable uptime</li>
            <li>24/7 customer support</li>
          </ul>
        </section>

        <section id="coverage" className="info-section">
          <h3>Coverage Map</h3>
          <div className="coverage-map">
            {/* Add a map or image here */}
            <p>
              Our network covers over 90% of the country. Check if service is
              available in your area.
            </p>
          </div>
        </section>

        <section id="contact" className="info-section">
          <h3>Contact Us</h3>
          <p>Get in touch for more information or support.</p>
          <button className="btn btn-secondary">Contact Support</button>
        </section>

        <footer className="landing-footer">
          <p>&copy; 2024 LANET. All rights reserved.</p>
        </footer>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
            <h2>Get Started with LANET</h2>
            {/* Add a form or content for getting started */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
