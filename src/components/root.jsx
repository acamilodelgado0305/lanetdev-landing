import React, { useState, useMemo } from "react";
import { Outlet, Link } from "react-router-dom";
import { Home, FileText, Users, ShoppingCart, Book, DollarSign, MessageCircle, Menu } from "lucide-react"; // Importamos el icono de hamburguesa
import Header from '../components/header/Header';
import UserProfileHeader from './user/UserProfileHeader';

// Componente SidebarLink
const SidebarLink = ({ to, icon: Icon, children }) => (
  <Link
    to={to}
    className="flex items-center p-2 text-sm text-white rounded-md hover:bg-slate-700 transition-colors duration-200"
  >
    <Icon className="w-5 h-5 mr-3 text-white" />
    <span>{children}</span>
  </Link>
);

// Componente SidebarSection
const SidebarSection = ({ title, children }) => (
  <div className="mb-4">
    <h3 className="px-3 mb-2 text-xs font-semibold text-white uppercase">{title}</h3>
    {children}
  </div>
);

export default function Root() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadEmailsCount, setUnreadEmailsCount] = useState(0); // Estado global de correos no leídos

  // Sidebar links (usando useMemo para evitar renders innecesarios)
  const sidebarLinks = useMemo(
    () => [
      { to: "/index", label: "Dashboard", icon: Home },
      { to: "/index/new", label: "Finanzas", icon: DollarSign },
      { to: "/index/clientes", label: "Clientes", icon: Users },
      { to: "/productos", label: "Productos", icon: ShoppingCart },
      { to: "/index/doc", label: "Documentación", icon: FileText },
      { to: "/index/moneymanager", label: "Money Manager", icon: Book },
      { to: "/index/communication", label: "Comunicación", icon: MessageCircle },
    ],
    []
  );

  return (
    <div className="flex h-screen">
      {/* Botón de menú hamburguesa (solo visible en pantallas pequeñas) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-1 z-50 text-white p-2 bg-primary rounded-md"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={`${isOpen ? "translate-x-0" : "-translate-x-full"
          } fixed inset-y-0 left-0 z-40 w-64 bg-primary border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <UserProfileHeader onToggle={() => setIsOpen(false)} />

        <nav className="px-4 py-4">
          <SidebarSection title="Menú principal">
            {sidebarLinks.slice(0, 4).map(link => (
              <SidebarLink key={link.to} to={link.to} icon={link.icon}>
                {link.label}
              </SidebarLink>
            ))}
          </SidebarSection>
          <SidebarSection title="Recursos">
            {sidebarLinks.slice(4).map(link => (
              <SidebarLink key={link.to} to={link.to} icon={link.icon}>
                {link.label}
              </SidebarLink>
            ))}
          </SidebarSection>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-col w-full">
        {/* Header global que recibe el contador de correos no leídos */}
        <Header unreadEmailsCount={unreadEmailsCount} />

        {/* Outlet donde se pasa el setUnreadEmailsCount al componente EmailManagement */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 w-full">
          <Outlet context={{ setUnreadEmailsCount }} />
        </main>
      </div>
    </div>
  );
}
