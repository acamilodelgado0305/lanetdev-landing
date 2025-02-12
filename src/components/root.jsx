import React, { useState, useMemo } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarCircleOutlined,
  MessageOutlined,
  MenuOutlined,
  DotChartOutlined,
  CalendarOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  AppstoreAddOutlined,
  ContainerOutlined,
  BankOutlined,
  LeftOutlined,
  RightOutlined,
  DownOutlined,
  UpOutlined,
  IdcardOutlined
} from "@ant-design/icons";
import { Layout, Menu, Button, Tooltip } from "antd";
import { DotIcon } from "lucide-react";
import Header from "../components/header/Header";
import UserProfileHeader from "./user/UserProfileHeader";
import { useAuth } from "../components/Context/AuthProvider";
import { Modal } from 'antd';
const { Sider } = Layout;
export default function Root() {
  const [isOpen, setIsOpen] = useState(false); // Controla si el menú está abierto o cerrado
  const [isExpanded, setIsExpanded] = useState(true); // Controla la expansión/colapso del menú
  const [unreadEmailsCount, setUnreadEmailsCount] = useState(0);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  const [activeSubMenu, setActiveSubMenu] = useState(null); // Controla qué submenú está activo
  const { userRole } = useAuth();
  const location = useLocation();

  // Definición de los enlaces principales del menú
  const mainMenuLinks = useMemo(
    () => [
      { to: "/index", label: "Dashboard", icon: <HomeOutlined /> },
      userRole === "superadmin" && { to: "/index/clientes", label: "Clientes", icon: <TeamOutlined /> },
      { to: "/index/cobro-cartera", label: "Cobro de Cartera", icon: <BankOutlined /> },
      { to: "/index/tickets", label: "Tickets", icon: <DotChartOutlined /> },

      {
        label: "Finanzas",
        icon: <IdcardOutlined />,
        hasSubmenu: true,
        submenuItems: [
          { to: "/index/administracion/cajeros", label: "Facturas", icon: <DotIcon /> },

        ],
      },
      {
        label: "Gestión de Red",
        icon: <IdcardOutlined />,
        hasSubmenu: true,
        submenuItems: [
          { to: "/index/administracion/cajeros", label: "Direccionamiento Ip", icon: <DotIcon /> },
          { to: "/index/administracion/cajeros", label: "Monitoreo", icon: <DotIcon /> },
          { to: "/index/administracion/cajeros", label: "Aprovisinamiento de Red", icon: <DotIcon /> },
          { to: "/index/administracion/cajeros", label: "Conexion de routers", icon: <DotIcon /> },

        ],
      },
      { to: "/index/inventario", label: "Inventario", icon: <ContainerOutlined /> },
      { to: "/index/moneymanager/cotizacion", label: "Estudio de Mercado", icon: <DotChartOutlined /> },
      (userRole === "admin" || userRole === "superadmin") && {
        label: "Contabilidad",
        icon: <DollarCircleOutlined />,
        hasSubmenu: true,
        submenuItems: [
          { to: "/index/moneymanager/estadisticas", label: "Resumen", icon: <DotIcon /> },
          { to: "/index/moneymanager/transactions", label: "Transacciones", icon: <DotIcon /> },
          { to: "/index/moneymanager/pagos-pendientes", label: "Pagos Recurrentes", icon: <DotIcon /> },
          { to: "/index/moneymanager/informes", label: "Informes", icon: <DotChartOutlined /> },
          { to: "/index/moneymanager/calendario", label: "Calendario", icon: <CalendarOutlined /> },
          { to: "/index/moneymanager/cotizacion", label: "Estudio de mercadeo", icon: <DotChartOutlined /> },
          { to: "/index/moneymanager/cotizacion", label: "Gestion de compras", icon: <DotChartOutlined /> },
        ],
      },
      { to: "/index/doc", label: "", icon: <FileTextOutlined /> },
      {
        label: "Comunicación",
        icon: <MessageOutlined />,
        hasSubmenu: true,
        submenuItems: [
          { to: "/index/comunicacion/notificaciones", label: "Notificaciones WhatsApp", icon: <DotChartOutlined /> },
          { to: "/index/comunicacion/multichat", label: "Multichat", icon: <DotChartOutlined /> },
        ],
      },
      { to: "/index/moneymanager/config", label: "Configuración", icon: <SettingOutlined /> },
      { to: "/index/tareas", label: "Tareas", icon: <AppstoreAddOutlined /> },
      {
        label: "terceros",
        icon: <IdcardOutlined />,
        hasSubmenu: true,
        submenuItems: [
          { to: "/index/terceros/cajeros", label: "Cajeros", icon: <DotIcon /> },
        ],
      },
      {
        label: "Configuracion",
        icon: <IdcardOutlined />,
        hasSubmenu: true,
        submenuItems: [
          { to: "/index/administracion/cajeros", label: "Portal Tecnicos", icon: <DotIcon /> },
          { to: "/index/administracion/cajeros", label: "Portal Clientes", icon: <DotIcon /> },
          { to: "/index/administracion/cajeros", label: "Portal Cajeros", icon: <DotIcon /> },

        ],
      },
      { to: "/index/tienda", label: "Reportes", icon: <ShoppingCartOutlined /> },
      { to: "/index/tienda", label: "Tareas", icon: <ShoppingCartOutlined /> },
      { to: "/index/tienda", label: "Navegacion de Archivos", icon: <ShoppingCartOutlined /> },
      { to: "/index/tienda", label: "Tienda", icon: <ShoppingCartOutlined /> },
    
    ].filter(Boolean),
    [userRole]
  );

  // Determinar la clave seleccionada basada en la ubicación actual
  const selectedKeys = useMemo(() => {
    const currentPath = location.pathname;
    return mainMenuLinks
      .flatMap((link) =>
        link.hasSubmenu
          ? link.submenuItems.map((subItem) => subItem.to)
          : link.to
      )
      .filter((path) => currentPath.startsWith(path));
  }, [location.pathname, mainMenuLinks]);

  // Controla la expansión de los submenús
  const toggleSubMenu = (label) => {
    setActiveSubMenu(activeSubMenu === label ? null : label);
  };

  return (
    <>
      <Header unreadEmailsCount={0} />
      <Layout className="flex h-screen bg-gray-100">
        {/* Botón de menú móvil */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden fixed top-4 left-4 bg-primary rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90 text-white hover:bg-opacity-100 transition-all duration-300"
        >
          <MenuOutlined />
        </button>

        {/* Sidebar */}
        <div
          className={`${isExpanded ? "w-48" : "w-16"} 
                bg-gray-200 text-black ${isOpen ? "block" : "hidden"} 
                lg:block fixed top-0 left-0 h-full transition-all duration-300`}
        >
          {/* {isExpanded && (
            <UserProfileHeader
              className="mb-20"
              onToggle={() => setIsOpen(false)}
              isUserProfileOpen={isUserProfileOpen}
              setIsUserProfileOpen={setIsUserProfileOpen}
              isExpanded={isExpanded}
            />
          )} */}
          <div className="space-y-2 py-4 max-h-screen overflow-y-auto mt-14"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}>
            {/* Menu Links */}
            {mainMenuLinks.map((link) =>
              link.hasSubmenu ? (
                <div key={link.label}>
                  <button
                    onClick={() => {
                      if (!isExpanded) {
                        setIsExpanded(true); // Expande el menú si está contraído
                      }
                      toggleSubMenu(link.label); // Abre el submenú
                    }}
                    className="flex items-center w-full p-2 text-left hover:bg-gray-700 text-sm"
                  >
                    <span className="mr-3">{link.icon}</span>
                    <span>{isExpanded ? link.label : ""}</span>
                    <span className="ml-auto">
                      {/* Muestra las flechas independientemente de si está expandido o no */}
                      {activeSubMenu === link.label ? <DownOutlined /> : <UpOutlined />}
                    </span>
                  </button>

                  {/* Submenú */}
                  {activeSubMenu === link.label && isExpanded && (
                    <div className="ml-6 space-y-1">
                      {link.submenuItems.map((subItem) => (
                        <Link
                          key={subItem.to}
                          to={subItem.to}
                          className="flex items-center w-full p-1 text-black hover:bg-gray-700 text-sm"
                        >
                          <span className="mr-3">{subItem.icon}</span>
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center w-full p-2 text-left hover:bg-gray-700 text-sm"
                >
                  <span className="mr-3">{link.icon}</span>
                  <span>{isExpanded ? link.label : ""}</span>
                </Link>
              )
            )}

          </div>
          {/* Botón para expandir/contraer el menú */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="z-1000 flex items-center justify-center w-full p-2 text-left hover:bg-gray-700 text-sm absolute bottom-0"
          >
            <span className="ml-2">
              {isExpanded ? (
                <LeftOutlined className="text-white" />
              ) : (
                <RightOutlined className="text-white" />
              )}
            </span>
          </button>

        </div>


        {/* Contenido principal */}
        <Layout.Content
          className={`flex-1 overflow-x-hidden overflow-y-auto mt-10 ${isExpanded ? "ml-48" : "ml-16"} h-screen`}
        >
          <Outlet context={{ setUnreadEmailsCount }} />
        </Layout.Content>
      </Layout>
    </>
  );
}
