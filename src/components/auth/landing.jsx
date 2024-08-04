import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import "./auth.css";

function Landing() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="landing-container">
      <div
        className={`sidebar ${isSidebarOpen ? "open" : ""}`}
        style={{ width: isSidebarOpen ? "250px" : "0" }}
      >
        <a
          href="javascript:void(0)"
          className="closebtn"
          onClick={closeSidebar}
        >
          &times;
        </a>
        <a href="http://clientes.la-net.co/saldo/level9/">Consulta Pagos</a>
        <a href="#services">Test Velocidad</a>
        <a href="#coverage">Cobertura</a>
        <a href="#contact">Contacto</a>
      </div>

      <div className="impresion-1">
        <Header openSidebar={openSidebar} />
        <HeroSection />
      </div>

      <div className="content">
        <div className="back1">
          <div className="contentback">
            <h3 className="h3">
              VEA PELÍCULAS, HAGA VIDEOLLAMADAS, JUEGUE Y MÁS
            </h3>
            <div className="card">
              <div className="title">HOGAR</div>
              <div className="subtitle">Ideal para familias pequeñas</div>
              <div className="price">
                $ 65.000<span style={{ fontSize: "16px" }}>/MES</span>
              </div>
              <div className="details">
                Datos móviles ilimitados en territorio continental
              </div>
            </div>

            <button className="btn btn-primary">Ver más planes</button>
            <button className="btn btn-primary btn-large">Cotizar</button>
          </div>
        </div>
        <div className="image1"></div>
        <ServicesSection />
        <div className="image1"></div>

        <CoverageSection />
        <div className="image1"></div>
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}

const Header = ({ openSidebar }) => (
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
        <button className="btn btn-secondary">Iniciar Sesión</button>
      </Link>
      <button
        onClick={() => (window.location.href = "https://app.la-net.co")}
        className="btn btn-primary"
      >
        Comenzar
      </button>

      <GiHamburgerMenu
        size={30}
        style={{ paddingTop: "1em" }}
        onClick={openSidebar}
      />
    </div>
  </header>
);

const HeroSection = () => (
  <main className="landing-main">
    <section className="hero">
      <h2>LANET PARA EL HOGAR</h2>
      <p>
        Si necesitas internet para tu hogar, en LANET tenemos la solución
        perfecta para ti.
      </p>
      <button
        onClick={() =>
          (window.location.href = "https://wa.me/message/HPOPXUYQANINN1")
        }
        className="btn btn-primary btn-large"
      >
        Cotizar
      </button>
    </section>
  </main>
);

const ServicesSection = () => (
  <section id="services" className="info-section">
    <div className="contentback">
      <h3>Nuestros Servicios</h3>
      <ul>
        <li>Internet de alta velocidad</li>
        <li>Conexiones de baja latencia</li>
        <li>Alta fiabilidad</li>
        <li>Soporte al cliente 24/7</li>
      </ul>
    </div>
  </section>
);

const CoverageSection = () => (
  <section id="coverage" className="info-section">
    <div className="contentback">
      <h3>Mapa de Cobertura</h3>
      <div className="coverage-map">
        {/* Añadir un mapa o imagen aquí */}
        <p>
          Nuestra red cubre más del 90% de la región. Verifica si el servicio
          está disponible en tu área.
        </p>
      </div>
    </div>
  </section>
);

const ContactSection = () => (
  <section id="contact" className="info-section">
    <div className="contentback">
      <h3>Contáctanos</h3>
      <p>Ponte en contacto para más información o soporte.</p>
      <button className="btn btn-secondary">Soporte</button>
    </div>
  </section>
);

const Footer = () => (
  <footer className="landing-footer">
    <p>&copy; 2024 LANET. Todos los derechos reservados.</p>
  </footer>
);

export default Landing;
