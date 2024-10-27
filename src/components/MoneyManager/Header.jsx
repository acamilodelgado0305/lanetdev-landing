// src/components/Header/Header.jsx
import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart2,
  Send,
  DollarSign,
  CreditCard,
  MoreHorizontal,
  User,
  Repeat 
} from 'lucide-react';
import { CiSettings } from "react-icons/ci";

const NavItem = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center px-3 h-10 text-sm transition-colors duration-200 relative group
        ${isActive
          ? 'text-blue-600 font-medium'
          : 'text-gray-600 hover:text-gray-900'}`}
    >
      <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
      <span>{children}</span>
      {isActive && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
      )}
    </Link>
  );
};

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const closeDropdown = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', closeDropdown);
    return () => document.removeEventListener('mousedown', closeDropdown);
  }, []);

  return (
    <header className="bg-white shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
           
          </div>

          {/* Navegación principal */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavItem to="/index/moneymanager/estadisticas" icon={BarChart2}>
              Dashboard
            </NavItem>
            <NavItem to="/index/moneymanager/transactions" icon={Send}>
              Transacciones
            </NavItem>
            <NavItem to="/index/moneymanager/Pagos-Pendientes" icon={Repeat}>
              Pagos Recurrentes
            </NavItem>



            {/* Dropdown "Más" */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center px-3 h-10 text-sm rounded-md transition-colors duration-200
                  ${isDropdownOpen ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <MoreHorizontal className="w-4 h-4 mr-2" />
                <span>Otros</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-20 py-1 border border-gray-200">
                  <NavItem to="/index/moneymanager/accounts" icon={DollarSign}>
                    Cuentas
                  </NavItem>
                  <NavItem to="/index/moneymanager/categorias" icon={User}>
                    Categorías
                  </NavItem>

                  <NavItem to="/index/moneymanager/calendario" icon={CreditCard}>
                    Calendario
                  </NavItem>
                  <NavItem to="/index/moneymanager/configuracion" icon={CiSettings}>
                    Configuración
                  </NavItem>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;