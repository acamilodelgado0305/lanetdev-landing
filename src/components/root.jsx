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


      { label: "CRM", isTitle: true, color: "text-[#7d4fff]" },


      userRole === "superadmin" && {
        to: "/index/clientes",
        label: "Clientes",
        icon: <TeamOutlined />,
        color: "text-[#7d4fff]", // Color de texto
        hoverClass: "hover:bg-[#7d4fff] hover:text-white", // Clase de hover para el fondo y color del texto
      },

      {
        to: "/index/Instalaciones",
        label: "Instalaciones",
        icon: <DotChartOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white", // Clase de hover para el fondo y color del texto
      },

      {
        label: "Finanzas",
        icon: <IdcardOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white", // Clase de hover para el fondo y color del texto
        hasSubmenu: true,
        submenuItems: [
          {
            to: "/index/administracion/cajeros",
            label: "Facturas",
            icon: <DotIcon />,
            color: "text-[#7d4fff]",
            hoverClass: "hover:bg-[#7d4fff] hover:text-white", // Clase de hover para el fondo y color del texto
          },
        ],
      },

      {
        to: "/index/tickets",
        label: "Tickets",
        icon: <DotChartOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white", // Clase de hover para el fondo y color del texto
      },

      {
        label: "Comunicación",
        icon: <MessageOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white", // Clase de hover para el fondo y color del texto
        hasSubmenu: true,
        submenuItems: [
          {
            to: "/index/comunicacion/notificaciones",
            label: "Notificaciones WhatsApp",
            icon: <DotChartOutlined />,
            color: "text-[#7d4fff]",
            hoverClass: "hover:bg-[#7d4fff] hover:text-white", // Clase de hover para el fondo y color del texto
          },
          {
            to: "/index/comunicacion/multichat",
            label: "Multichat",
            icon: <DotChartOutlined />,
            color: "text-[#7d4fff]",
            hoverClass: "hover:bg-[#7d4fff] hover:text-white", // Clase de hover para el fondo y color del texto
          },
        ],
      },

      {
        to: "/index/moneymanager/cotizacion",
        label: "Estudio de Mercado",
        icon: <DotChartOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white", // Clase de hover para el fondo y color del texto
      },


      { label: "COMPAÑIA", isTitle: true, color: "text-green-400" },

      (userRole === "admin" || userRole === "superadmin") && {
        label: "Contabilidad",
        icon: <DollarCircleOutlined />,
        color: "text-green-400",
        hoverClass: "hover:text-green-400 hover:text-white",
        hasSubmenu: true,
        submenuItems: [
          {
            to: "/index/moneymanager/estadisticas", label: "Resumen", icon: <DotIcon />, color: "text-green-400",
            hoverClass: "hover:text-green-400 hover:text-white",
          },
          {
            to: "/index/moneymanager/transactions", label: "Transacciones", icon: <DotIcon />, color: "text-green-400",
            hoverClass: "hover:text-green-400 hover:text-white",
          },
          {
            to: "/index/moneymanager/pagos-pendientes", label: "Pagos Recurrentes", icon: <DotIcon />, color: "text-green-400",
            hoverClass: "hover:text-green-400 hover:text-white",
          },
          {
            to: "/index/moneymanager/informes", label: "Informes", icon: <DotChartOutlined />, color: "text-green-400",
            hoverClass: "hover:text-green-400 hover:text-white",
          },
          {
            to: "/index/moneymanager/cotizacion", label: "Estudio de mercadeo", icon: <DotChartOutlined />, color: "text-green-400",
            hoverClass: "hover:text-green-400 hover:text-white",
          },

        ],
      },

      {
        label: "Gestión de Red",
        icon: <IdcardOutlined />,
        hasSubmenu: true,
        color: "text-green-400",
        hoverClass: "hover:text-green-400 hover:text-white",
        submenuItems: [
          {
            to: "/index/administracion/cajeros", label: "Direccionamiento Ip", icon: <DotIcon />, color: "text-green-400",
            hoverClass: "hover:text-green-400 hover:text-white",
          },
          {
            to: "/index/administracion/cajeros", label: "Monitoreo", icon: <DotIcon />, color: "text-green-400",
            hoverClass: "hover:text-green-400 hover:text-white",
          },
          {
            to: "/index/administracion/cajeros", label: "Aprovisinamiento de Red", icon: <DotIcon />, color: "text-green-400",
            hoverClass: "hover:text-green-400 hover:text-white",
          },
          {
            to: "/index/administracion/cajeros", label: "Conexion de routers", icon: <DotIcon />, color: "text-green-400",
            hoverClass: "hover:text-green-400 hover:text-white",
          },

        ],
      },
      {
        to: "/index/inventario", label: "Inventario", icon: <ContainerOutlined />, color: "text-green-400",
        hoverClass: "hover:text-green-400 hover:text-white",
      },
      {
        label: "Terceros",
        icon: <IdcardOutlined />,
        color: "text-green-400",
        hoverClass: "hover:text-green-400 hover:text-white",
        hasSubmenu: true,
        submenuItems: [
          {
            to: "/index/terceros/cajeros", label: "Cajeros", icon: <DotIcon />, color: "text-green-400",
            hoverClass: "hover:text-green-400 hover:text-white",
          },
        ],
      },
      {
        to: "/index/tienda", label: "Reportes", icon: <ShoppingCartOutlined />, color: "text-green-400",
        hoverClass: "hover:text-green-400 hover:text-white",
      },
      {
        to: "/index/moneymanager/cotizacion", label: "Gestion de compras", icon: <DotChartOutlined />, color: "text-green-400",
        hoverClass: "hover:text-green-400 hover:text-white",
      },
      {
        to: "/index/moneymanager/calendario", label: "Calendario", icon: <CalendarOutlined />, color: "text-green-400",
        hoverClass: "hover:text-green-400 hover:text-white",
      },
      {
        to: "/index/recursoHumanos", label: "Recuersos Humanos", icon: <BankOutlined />, color: "text-green-400",
        hoverClass: "hover:text-green-400 hover:text-white",
      },


      { label: "SISTEMA", isTitle: true, color: "text-blue-500" },

      {
        label: "Configuración",
        icon: <IdcardOutlined />,
        color: "text-blue-500",
        hoverClass: "hover:text-blue-500 hover:text-white",
        hasSubmenu: true,
        submenuItems: [
          { to: "/index/moneymanager/config", label: "Configuración", icon: <SettingOutlined /> },

        ],
      },
      {
        label: "Administración",
        icon: <IdcardOutlined />,
        color: "text-blue-500",
        hoverClass: "hover:text-blue-500 hover:text-white",
        hasSubmenu: true,
        submenuItems: [
          {
            to: "/index/administracion/cajeros", label: "Portal Tecnicos", icon: <DotIcon />, color: "text-blue-500",
            hoverClass: "hover:text-blue-500 hover:text-white",
          },
          {
            to: "/index/administracion/cajeros", label: "Portal Clientes", icon: <DotIcon />, color: "text-blue-500",
            hoverClass: "hover:text-blue-500 hover:text-white",
          },
        ],
      },

      {
        to: "/index/tienda", label: "Tienda", icon: <ShoppingCartOutlined />, color: "text-gray-500",
        hoverClass: "hover:text-gray-500 hover:text-white",
      },
      {
        to: "/index/tareas", label: "Tareas", icon: <AppstoreAddOutlined />, color: "text-gray-500",
        hoverClass: "hover:text-gray-500 hover:text-white",
      },
      {
        to: "/index/cobro-cartera", label: "Cobro de Cartera", icon: <BankOutlined />, color: "text-gray-500",
        hoverClass: "hover:text-gray-500 hover:text-white",
      },
      {
        to: "/index/tienda", label: "Navegacion de Archivos", icon: <ShoppingCartOutlined />, color: "text-gray-500",
        hoverClass: "hover:text-gray-500 hover:text-white",
      },
      { to: "", label: "", isSpace: true },
      { to: "", label: "", isSpace: true },


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
          className={`${isExpanded ? "w-48" : "w-18"} 
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
          <div className="space-y-2 py-4 max-h-screen overflow-y-auto mt-10 my-4 bg-white px-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}>
            {/* Menu Links */}
            {mainMenuLinks.map((link) =>
              link.isTitle ? (
                <div
                  key={link.label}
                  className={`py-2 text-xs font-bold uppercase ${link.color || "text-gray-500"} 
        ${isExpanded ? "text-center" : "hidden"} w-full`} // Título centrado si está expandido
                >
                  {link.label}
                </div>
              ) : link.hasSubmenu ? (
                <div key={link.label}>
                  <button
                    onClick={() => {
                      if (!isExpanded) setIsExpanded(true);
                      toggleSubMenu(link.label);
                    }}
                    className={`group flex items-center w-full p-2 text-left 
          ${link.color === "text-green-400"
                        ? "hover:bg-green-400"
                        : link.color === "text-blue-500"
                          ? "hover:bg-blue-500"
                          : link.color === "text-gray-500"
                            ? "hover:bg-gray-500"
                            : "hover:bg-[#7d4fff]"}  // Usando el color #7d4fff para el hover
          ${link.color || "text-black"} text-sm`}
                  >
                    <span className={`mr-3 ${link.color} group-hover:text-white`}>
                      {link.icon}
                    </span>
                    <span className={`text-black group-hover:text-white ${link.hoverClass}`}>
                      {isExpanded ? link.label : ""}
                    </span>
                    <span className="ml-auto">
                      {activeSubMenu === link.label ? <DownOutlined /> : <UpOutlined />}
                    </span>
                  </button>
                  {activeSubMenu === link.label && isExpanded && (
                    <div className="ml-6 space-y-1">
                      {link.submenuItems.map((subItem) => (
                        <Link
                          key={subItem.to}
                          to={subItem.to}
                          className={`group flex items-center w-full p-1 text-left text-sm 
                ${subItem.color === "text-green-400"
                              ? "hover:bg-green-400"
                              : subItem.color === "text-blue-500"
                                ? "hover:bg-blue-500"
                                : subItem.color === "text-gray-500"
                                  ? "hover:bg-gray-500"
                                  : "hover:bg-[#7d4fff]"}  // Usando el color #7d4fff para el hover
                ${subItem.color || "text-black"} group-hover:text-white`}
                        >
                          <span className={`mr-3 ${subItem.color} group-hover:text-white`}>
                            {subItem.icon}
                          </span>
                          <span className={`text-black group-hover:text-white ${subItem.hoverClass}`}>
                            {subItem.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group flex items-center w-full p-2 text-left 
        ${link.color === "text-green-400"
                      ? "hover:bg-green-400"
                      : link.color === "text-blue-500"
                        ? "hover:bg-blue-500"
                        : link.color === "text-gray-500"
                          ? "hover:bg-gray-500"
                          : "hover:bg-[#7d4fff]"}  // Usando el color #7d4fff para el hover
        ${link.color || "text-black"} group-hover:text-white text-sm`}
                >
                  <span className={`mr-3 ${link.color} group-hover:text-white`}>
                    {link.icon}
                  </span>
                  <span className={`text-black group-hover:text-white ${link.hoverClass}`}>
                    {isExpanded ? link.label : ""}
                  </span>
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
                <LeftOutlined className="text-black" />
              ) : (
                <RightOutlined className="text-black" />
              )}
            </span>
          </button>

        </div>


        {/* Contenido principal */}
        <Layout.Content
          className={`flex-1 overflow-x-hidden overflow-y-auto mt-10 ${isExpanded ? "ml-52" : "ml-16"} h-screen`}
        >
          <Outlet context={{ setUnreadEmailsCount }} />
        </Layout.Content>
      </Layout>
    </>
  );
}
