import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  CreditCard,
  BarChart2,
  Send,
  MoreHorizontal,
  User,
  DollarSign
} from "lucide-react";
import { CiSettings } from "react-icons/ci";

const NavLink = ({ to, icon: Icon, children }) => (
  <Link
    to={to}
    className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
  >
    <Icon className="w-5 h-5 mr-2 text-gray-500" />
    <span>{children}</span>
  </Link>
);

const IndexMoneyManager = () => {
  const [name, setName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Estado para el menú desplegable
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Referencia para el menú desplegable

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Cierra el menú desplegable si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    // Redirigir automáticamente a la ruta de transacciones cuando se monte el componente
    navigate("/index/moneymanager/transactions");
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header with navigation */}
      <header className="bg-white shadow-sm w-full">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-800">
                Money Manager
              </span>
            </div>
          </div>
          <nav className="flex items-center justify-center hidden md:flex space-x-4">
            <NavLink to="/index/moneymanager/transactions" icon={Send}>
              Transacciones
            </NavLink>

            <NavLink to="/index/moneymanager/accounts" icon={DollarSign}>
              Cuentas
            </NavLink>
            <NavLink to="/index/moneymanager/calendario" icon={CreditCard}>
              Calendario
            </NavLink>
            <NavLink to="/index/moneymanager/estadisticas" icon={BarChart2}>
              Estadísticas
            </NavLink>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
              >
                <MoreHorizontal className="w-5 h-5 mr-2 text-gray-500" />
                <span>Más</span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                  <NavLink to="/index/moneymanager/categorias" icon={User}>
                    Categorias
                  </NavLink>
                  <NavLink to="/index/moneymanager/option2" icon={CiSettings}>
                    Configuración
                  </NavLink>
                </div>
              )}
            </div>
          </nav>
        </div>
        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/index/moneymanager/transactions" icon={Send}>
              Transferencias
            </NavLink>
            <NavLink to="/index/moneymanager/accounts" icon={CreditCard}>
              Cuentas
            </NavLink>
            <NavLink to="/index/moneymanager/estadisticas" icon={BarChart2}>
              Estadísticas
            </NavLink>
            <NavLink to="/index/moneymanager/mas" icon={MoreHorizontal}>
              Más
            </NavLink>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-gray-100 w-full">
        <div className="w-full py-4">
          {/* El componente Outlet renderizará el contenido de la ruta hija activa */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default IndexMoneyManager;
