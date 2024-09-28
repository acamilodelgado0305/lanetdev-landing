import React, { useState, useMemo } from "react";
import { Outlet, Link } from "react-router-dom";
import { Home, FileText, Users, ShoppingCart, Book, DollarSign, MessageCircle, Menu } from "lucide-react";
import Header from '../components/header/Header';
import UserProfileHeader from './user/UserProfileHeader';
import { useAuth } from '../components/Context/AuthProvider';

// Componente SidebarLink
const SidebarLink = ({ to, icon: Icon, label, isExpanded }) => (
  <Link
    to={to}
    className={`flex items-center p-2 text-sm text-white rounded-md hover:bg-slate-700 transition-colors duration-200 ${isExpanded ? 'justify-start' : 'justify-center'}`}
  >
    <Icon className="w-6 h-6 text-white" />
    {isExpanded && <span className="ml-3">{label}</span>}
  </Link>
);

// Componente SidebarSection
const SidebarSection = ({ title, children, isExpanded }) => (
  <div className="mb-4">
    {isExpanded && <h3 className="px-3 mb-2 text-xs font-semibold text-white uppercase">{title}</h3>}
    {children}
  </div>
);

export default function Root() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadEmailsCount, setUnreadEmailsCount] = useState(0);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  const { userRole } = useAuth();

  // Sidebar links (usando useMemo para evitar renders innecesarios)
  const sidebarLinks = useMemo(
    () => [
      { to: "/index", label: "Dashboard", icon: Home },
      { to: "/index/new", label: "Finanzas", icon: DollarSign },
      { to: "/index/clientes", label: "Clientes", icon: Users },
      { to: "/productos", label: "Productos", icon: ShoppingCart },
      { to: "/index/doc", label: "Documentación", icon: FileText },
      userRole === "superadmin" && { to: "/index/moneymanager", label: "Money Manager", icon: Book },
      { to: "/index/communication", label: "Comunicación", icon: MessageCircle },
    ].filter(Boolean),
    [userRole]
  );

  const handleSidebarCollapse = () => {
    setIsExpanded(false);
    setIsUserProfileOpen(false);
  };

  return (
    <div className="flex h-screen">
      {/* Botón de menú hamburguesa (solo visible en pantallas pequeñas) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-1 z-50 text-white p-2 bg-primary rounded-md"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar en pantallas grandes */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={handleSidebarCollapse}
        className={`${isExpanded ? "lg:w-64" : "lg:w-20"} fixed inset-y-0 left-0 z-40 bg-primary border-r border-gray-200 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 hidden lg:flex flex-col`}
      >
        <UserProfileHeader
          onToggle={() => setIsOpen(false)}
          isUserProfileOpen={isUserProfileOpen}
          setIsUserProfileOpen={setIsUserProfileOpen}
        />
        <nav className="px-4 py-4">
          <SidebarSection title="Menú principal" isExpanded={isExpanded}>
            {sidebarLinks.slice(0, 4).map(link => (
              <div className="flex items-center">
                <SidebarLink key={link.to} to={link.to} icon={link.icon} label={link.label} isExpanded={isExpanded} />
              </div>
            ))}
          </SidebarSection>
          <SidebarSection title="Recursos" isExpanded={isExpanded}>
            {sidebarLinks.slice(4).map(link => (
              <div className="flex items-center">
                <SidebarLink key={link.to} to={link.to} icon={link.icon} label={link.label} isExpanded={isExpanded} />
              </div>
            ))}
          </SidebarSection>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-col w-full">
        <Header unreadEmailsCount={unreadEmailsCount} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 w-full">
          <Outlet context={{ setUnreadEmailsCount }} />
        </main>
      </div>

      {/* Menú desplegable en pantallas pequeñas */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <aside className="fixed inset-y-0 left-0 w-64 bg-primary border-r border-gray-200 z-50">
            <UserProfileHeader onToggle={() => setIsOpen(false)} />
            <nav className="px-4 py-4">
              <SidebarSection title="Menú principal" isExpanded={true}>
                {sidebarLinks.slice(0, 4).map(link => (
                  <SidebarLink key={link.to} to={link.to} icon={link.icon} label={link.label} isExpanded={true} />
                ))}
              </SidebarSection>
              <SidebarSection title="Recursos" isExpanded={true}>
                {sidebarLinks.slice(4).map(link => (
                  <SidebarLink key={link.to} to={link.to} icon={link.icon} label={link.label} isExpanded={true} />
                ))}
              </SidebarSection>
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
