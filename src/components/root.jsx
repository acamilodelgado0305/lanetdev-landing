import React, { useState, useMemo, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import {
  HomeIcon,
  FileTextIcon,
  UsersIcon,
  ShoppingCartIcon,
  BookIcon,
  DollarSignIcon,
  MessageCircleIcon,
  MenuIcon,
  ChevronRightIcon,
  PinIcon,
  PinOffIcon,
  ChevronDownIcon,
  WaypointsIcon,
  DotIcon
} from "lucide-react";
import Header from '../components/header/Header';
import UserProfileHeader from './user/UserProfileHeader';
import { useAuth } from '../components/Context/AuthProvider';

// Componente SidebarLink mejorado
const SidebarLink = ({ to, icon: Icon, label, isExpanded, hasSubmenu, isSubmenuOpen, onSubmenuClick, submenuItems }) => {
  // Check if the current route is active or is a child route
  const isActive = window.location.pathname === to;
  const isNestedRouteActive = hasSubmenu && submenuItems 
    ? submenuItems.some(item => window.location.pathname.startsWith(item.to)) 
    : false;

  const LinkContent = () => (
    <>
      <Icon className={`w-5 h-5 
        ${(isActive || isNestedRouteActive) ? 'text-green-500' : ''}
        ${isExpanded ? '' : 'group-hover:scale-110 transition-transform duration-200'}
      `} />
      {isExpanded && (
        <span className={`ml-2 font-medium flex-1 
          ${(isActive || isNestedRouteActive) ? 'text-white' : 'text-gray-300'}
        `}>
          {label}
        </span>
      )}
      {isExpanded && hasSubmenu && (
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''}`}
        />
      )}
      {!isExpanded && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          {label}
        </div>
      )}
    </>
  );

  if (hasSubmenu) {
    return (
      <div>
        <button
          onClick={onSubmenuClick}
          className={`
            w-full flex items-center p-3 my-1 text-sm rounded-xl transition-all duration-300
            ${(isActive || isNestedRouteActive)
              ? 'bg-gray-700 text-white shadow-lg backdrop-blur-sm' 
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
            ${isExpanded ? 'justify-start mx-2' : 'justify-center mx-auto w-12'}
            group relative
          `}
        >
          <LinkContent />
        </button>
        {isExpanded && isSubmenuOpen && (
          <div className="ml-4 pl-4 border-l border-white/10">
            {submenuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex items-center p-1 text-sm 
                  ${window.location.pathname === item.to 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                  transition-all duration-200
                `}
              >
                {item.icon && <item.icon className={`w-4 h-4 mr-2 
                  ${window.location.pathname === item.to ? 'text-green-500' : ''}
                `} />}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <Link
      to={to}
      className={`
        flex items-center p-2 my-1 text-sm transition-all duration-300
        ${isActive 
          ? 'bg-gray-700 text-white shadow-lg backdrop-blur-sm' 
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
        ${isExpanded ? 'justify-start mx-2' : 'justify-center mx-auto w-12'}
        group relative
      `}
    >
      <LinkContent />
    </Link>
  );
};

// Componente SidebarSection mejorado
const SidebarSection = ({ title, children, isExpanded }) => (
  <div className="relative group">
    {isExpanded && (
      <div className="px-4 mb-2 flex items-center">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="flex-1 ml-2 border-t border-gray-700/50"></div>
      </div>
    )}
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

export default function Root() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [unreadEmailsCount, setUnreadEmailsCount] = useState(0);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isMoneyManagerOpen, setIsMoneyManagerOpen] = useState(false);
  const { userRole } = useAuth();

  const mainMenuLinks = useMemo(
    () => [
      { to: "/index", label: "Inicio", icon: HomeIcon },
      { to: "/index/network", label: "Gestion de Red", icon: WaypointsIcon },
      

      userRole === "superadmin" && { to: "/index/clientes", label: "Clientes", icon: UsersIcon },
      { to: "/productos", label: "Productos", icon: ShoppingCartIcon },
    ].filter(Boolean),
    [userRole]
  );

  const moneyManagerSubmenuItems = [
    { to: "/index/moneymanager/estadisticas", label: "Resumen", icon: DotIcon },
    { to: "/index/moneymanager/transactions", label: "Transacciones", icon: DotIcon },
    { to: "/index/moneymanager/terceros", label: "Terceros", icon: DotIcon },
    { to: "/index/moneymanager/Pagos-Pendientes", label: "Pagos Recurrentes", icon: DotIcon },
    { to: "/index/moneymanager/informes", label: "Informes", icon: DotIcon },
    { to: "/index/moneymanager/calendario", label: "Calendario", icon: DotIcon },
    { to: "/index/moneymanager/config", label: "Configuración", icon: DotIcon },
  ];

  const resourcesMenuLinks = useMemo(
    () => [
      (userRole === "admin" || userRole === "superadmin") && {
        label: "Contabilidad",
        icon: DollarSignIcon,
        hasSubmenu: true,
        submenuItems: moneyManagerSubmenuItems
      },
      { to: "/index/doc", label: "Documentación", icon: FileTextIcon },   
      { to: "/index/communication", label: "Comunicación", icon: MessageCircleIcon },
    ].filter(Boolean),
    [userRole]
  );

  const handleSidebarMouseEnter = () => {
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (!isPinned) {
      setIsExpanded(false);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  // useEffect para cerrar UserProfileHeader cuando el sidebar se contrae
  useEffect(() => {
    if (!isExpanded) {
      setIsUserProfileOpen(false); // Cerrar UserProfileHeader cuando sidebar se contrae
    }
  }, [isExpanded]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Botón de menú móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90 text-white hover:bg-opacity-100 transition-all duration-300"
      >
        <MenuIcon className="w-6 h-6" />
      </button>

      {/* Sidebar mejorado con pin */}
      <aside
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        className={`
          fixed inset-y-0 left-0 z-40 
          ${isExpanded ? "w-55" : "w-20"} 
          bg-gradient-to-b from-primary to-primary/90
          shadow-xl backdrop-blur-sm
          transition-all duration-300 ease-in-out 
          hidden lg:flex flex-col
          border-r border-white/10
        `}
      >
        {/* Contenedor de botones de control */}
        <div className="absolute -right-3 flex flex-col gap-2 top-20">
          {/* Botón de pin */}
          <button
            onClick={togglePin}
            className={`
              bg-primary p-1.5 rounded-full shadow-lg 
              hover:bg-primary-dark transition-colors duration-200
              ${isPinned ? 'ring-2 ring-white ring-opacity-50' : ''}
            `}
            title={isPinned ? "Desfijar sidebar" : "Fijar sidebar"}
          >
            {isPinned ? (
              <PinIcon className="w-4 h-4 text-white" />
            ) : (
              <PinOffIcon className="w-4 h-4 text-white" />
            )}
          </button>

          {/* Botón de expandir/contraer */}
          {isPinned && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-primary p-1.5 rounded-full shadow-lg hover:bg-primary-dark transition-colors duration-200"
              title={isExpanded ? "Contraer sidebar" : "Expandir sidebar"}
            >
              <ChevronRightIcon
                className={`w-4 h-4 text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>

        <UserProfileHeader
          onToggle={() => setIsOpen(false)}
          isUserProfileOpen={isUserProfileOpen}
          setIsUserProfileOpen={setIsUserProfileOpen}
          isExpanded={isExpanded}
        />

        {/* Sidebar Content */}
        <nav className="flex-1 py-4">
          <SidebarSection title={<span className="capitalize">menú</span>} isExpanded={isExpanded}>
            {mainMenuLinks.map(link => (
              <SidebarLink
                key={link.to}
                {...link}
                isExpanded={isExpanded}
                isActive={window.location.pathname === link.to}
              />
            ))}
          </SidebarSection>




          {resourcesMenuLinks.map(link => (
            <SidebarLink
              key={link.hasSubmenu ? link.label : link.to}
              {...link}
              isExpanded={isExpanded}
              isActive={window.location.pathname === link.to}
              isSubmenuOpen={link.label === "Contabilidad" ? isMoneyManagerOpen : false}
              onSubmenuClick={() => {
                if (link.label === "Contabilidad") {
                  setIsMoneyManagerOpen(!isMoneyManagerOpen);
                }
              }}
            />
          ))}

        </nav>


        {/* Sidebar Footer */}
        <div className={`p-4 border-t border-white/10 bg-black/20 ${isExpanded ? 'text-center' : 'text-center'}`}>
          {isExpanded ? (
            <p className="text-xs text-gray-400">© 2024 IspSuite</p>
          ) : (
            <span className="text-gray-400 text-lg">•••</span>
          )}
        </div>
      </aside>

      {/* Contenido principal */}
      <div className={`flex-1 transition-all duration-300 ${isExpanded ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Header unreadEmailsCount={unreadEmailsCount} />
        <main className="overflow-x-hidden overflow-y-auto">
          <div className="">
            <Outlet context={{ setUnreadEmailsCount }} />
          </div>
        </main>
      </div>


      {/* Overlay móvil mejorado */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-primary shadow-2xl animate-slide-in z-10">
            <UserProfileHeader
              onToggle={() => setIsOpen(false)}
              isUserProfileOpen={isUserProfileOpen}
              setIsUserProfileOpen={setIsUserProfileOpen}
              isExpanded={true}
            />
            <nav className="p-4">
              <SidebarSection title="Menú principal" isExpanded={true}>
                {mainMenuLinks.map(link => (
                  <SidebarLink
                    key={link.to}
                    {...link}
                    isExpanded={true}
                    isActive={window.location.pathname === link.to}
                  />
                ))}
              </SidebarSection>
              <SidebarSection title="Recursos" isExpanded={true}>
                {resourcesMenuLinks.map(link => (
                  <SidebarLink
                    key={link.to}
                    {...link}
                    isExpanded={true}
                    isActive={window.location.pathname === link.to}
                  />
                ))}
              </SidebarSection>
            </nav>
          </aside>

          <div
            className={`
          flex-1 transition-all duration-300
          ${isPinned
                ? isExpanded ? 'lg:ml-64' : 'lg:ml-20'
                : isExpanded ? 'lg:ml-64' : 'lg:ml-20'
              }
        `}
          >
            <Header unreadEmailsCount={unreadEmailsCount} />
            <main className=" overflow-x-hidden overflow-y-auto">

              <Outlet context={{ setUnreadEmailsCount }} />

            </main>
          </div>
        </div>
      )}
    </div>
  );
}
