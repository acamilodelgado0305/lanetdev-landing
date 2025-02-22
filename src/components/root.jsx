import React, { useState, useMemo, useRef, useEffect } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [unreadEmailsCount, setUnreadEmailsCount] = useState(0);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Controla la visibilidad del modal
  const [modalContent, setModalContent] = useState(null); // Contenido del modal
  const [modalPosition, setModalPosition] = useState({ top: 20, left: window.innerWidth - 300 });

  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const { userRole } = useAuth();
  const menuItemRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    // Función que maneja el clic fuera del modal
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalVisible(false); // Cierra el modal si se hace clic fuera de él
      }
    };

    // Agregar el evento de clic al documento
    document.addEventListener("mousedown", handleClickOutside);

    // Limpiar el evento cuando el componente se desmonte
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Definición de los enlaces principales del menú
  const mainMenuLinks = useMemo(
    () => [
      { to: "/index", label: "Dashboard", icon: <HomeOutlined /> },


      { label: "CRM", isTitle: true, color: "text-[#7d4fff]" },


      userRole === "superadmin" && {
        to: "/index/clientes",
        label: "Clientes",
        icon: <TeamOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white",
      },

      {
        to: "/index/Instalaciones",
        label: "Instalaciones",
        icon: <HomeOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white",
        disabled: true, // Agrega esta propiedad
      },

      {
        label: "Finanzas",
        icon: <IdcardOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white",
        hasSubmenu: true,
        disabled: true,
        submenuItems: [
          {
            to: "/index/administracion/cajeros",
            label: "Facturas",
            icon: <DotIcon />,
            color: "text-[#7d4fff]",
            hoverClass: "hover:bg-[#7d4fff] hover:text-white",
            disabled: true,
          },
        ],
      },

      {
        to: "/index/tickets",
        label: "Tickets",
        icon: <DotChartOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white",
        disabled: true
      },

      {
        label: "Comunicación",
        icon: <MessageOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white",
        hasSubmenu: true,
        disabled: true,
        submenuItems: [
          {
            to: "/index/comunicacion/notificaciones",
            label: "Notificaciones WhatsApp",
            icon: <DotChartOutlined />,
            color: "text-[#7d4fff]",
            hoverClass: "hover:bg-[#7d4fff] hover:text-white",
            disabled: true,
          },
          {
            to: "/index/comunicacion/multichat",
            label: "Multichat",
            icon: <DotChartOutlined />,
            color: "text-[#7d4fff]",
            hoverClass: "hover:bg-[#7d4fff] hover:text-white",
            disabled: true,
          },
        ],

      },

      {
        to: "/index/moneymanager/cotizacion",
        label: "Estudio de Mercado",
        icon: <DotChartOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white",
        disabled: true,
      },


      { label: "COMPAÑIA", isTitle: true, color: "text-[#007072]" },

      (userRole === "admin" || userRole === "superadmin") && {
        label: "Contabilidad",
        icon: <DollarCircleOutlined />,
        color: "text-[#007072]",
        hoverClass: "hover:text-green-400 hover:text-white",
        hasSubmenu: true,
        submenuItems: [
          {
            to: "/index/moneymanager/estadisticas", label: "Resumen", icon: <DotIcon />, color: "text-[#007072]",
            hoverClass: "hover:text-[#007072] hover:text-white",
            disabled: true,
          },
          {
            to: "/index/moneymanager/transactions", label: "Transacciones", icon: <DotIcon />, color: "text-[#007072]",
            hoverClass: "hover:text-[#007072] hover:text-white",
          },
          {
            to: "/index/moneymanager/pagos-pendientes", label: "Pagos Recurrentes", icon: <DotIcon />, color: "text-[#007072]",
            hoverClass: "hover:text-[#007072] hover:text-white",
          },
          {
            to: "/index/moneymanager/informes", label: "Informes", icon: <DotIcon />, color: "text-[#007072]",
            hoverClass: "hover:text-[#007072] hover:text-white",
            disabled: true,
          },
          {
            to: "/index/moneymanager/cotizacion", label: "Estudio de mercadeo", icon: <DotIcon />, color: "text-[#007072]",
            hoverClass: "hover:text-[#007072] hover:text-white",
            disabled: true,
          },

        ],
      },

      {
        label: "Gestión de Red",
        icon: <IdcardOutlined />,
        hasSubmenu: true,
        color: "text-[#007072]",
        hoverClass: "hover:text-[#007072] hover:text-white",
        disabled: true,
        submenuItems: [
          {
            to: "/index/administracion/cajeros", label: "Direccionamiento Ip", icon: <DotIcon />, color: "text-[#007072]",
            hoverClass: "hover:text-[#007072] hover:text-white",
            disabled: true,
          },
          {
            to: "/index/administracion/cajeros", label: "Monitoreo", icon: <DotIcon />, color: "text-[#007072]",
            hoverClass: "hover:text-[#007072] hover:text-white",
            disabled: true,
          },
          {
            to: "/index/administracion/cajeros", label: "Aprovisinamiento de Red", icon: <DotIcon />, color: "text-[#007072]",
            hoverClass: "hover:text-g[#007072] hover:text-white",
            disabled: true,
          },
          {
            to: "/index/administracion/cajeros", label: "Conexion de routers", icon: <DotIcon />, color: "text-[#007072]",
            hoverClass: "hover:text-[#007072] hover:text-white",
            disabled: true,
          },

        ],
      },
      {
        to: "/index/inventario", label: "Inventario", icon: <ContainerOutlined />, color: "text-[#007072]",
        hoverClass: "hover:text-[#007072] hover:text-white",
        disabled: true,
      },
      {
        label: "Terceros",
        icon: <IdcardOutlined />,
        color: "text-[#007072]",
        hoverClass: "hover:text-[#007072] hover:text-white",
        hasSubmenu: true,
        submenuItems: [
          {
            to: "/index/terceros/cajeros", label: "Cajeros", icon: <DotIcon />, color: "text-[#007072]",
            hoverClass: "hover:text-[#007072] hover:text-white",
          },
          {
            to: "/index/moneymanager/terceros", label: "Terceros", icon: <DotIcon />, color: "text-green-400",
            hoverClass: "hover:text-green-400 hover:text-white",
          },
        ],
      },
      {
        to: "/index/tienda", label: "Reportes", icon: <ShoppingCartOutlined />, color: "text-[#007072]",
        hoverClass: "hover:text-[#007072] hover:text-white",
        disabled: true,
      },
      {
        to: "/index/moneymanager/cotizacion", label: "Gestion de compras", icon: <DotChartOutlined />, color: "text-[#007072]",
        hoverClass: "hover:text-[#007072] hover:text-white",
        disabled: true,
      },
      {
        to: "/index/moneymanager/calendario", label: "Calendario", icon: <CalendarOutlined />, color: "text-[#007072]",
        hoverClass: "hover:text-[#007072] hover:text-white",
        disabled: true,
      },
      {
        to: "/index/recursoHumanos", label: "Recuersos Humanos", icon: <BankOutlined />, color: "text-[#007072]",
        hoverClass: "hover:text-[#007072] hover:text-white",
        disabled: true,
      },


      { label: "SISTEMA", isTitle: true, color: "text-blue-500" },

      {
        to: "/index/config",
        label: "Configuración",
        icon: <SettingOutlined />,
        color: "text-blue-500",
        hoverClass: "hover:text-blue-500 hover:text-white",


      },
      {
        label: "Administración",
        icon: <IdcardOutlined />,
        color: "text-blue-500",
        hoverClass: "hover:text-blue-500 hover:text-white",
        hasSubmenu: true,
        disabled: true,
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
      { to: "", label: "", isSpace: true },

      {
        to: "/index/tienda", label: "Tienda", icon: <ShoppingCartOutlined />, color: "text-gray-500",
        hoverClass: "hover:text-gray-500 hover:text-white",
        disabled: true,
      },
      {
        to: "/index/tareas", label: "Tareas", icon: <AppstoreAddOutlined />, color: "text-gray-500",
        hoverClass: "hover:text-gray-500 hover:text-white",
        disabled: true,
      },
      {
        to: "/index/cobro-cartera", label: "Cobro de Cartera", icon: <BankOutlined />, color: "text-gray-500",
        hoverClass: "hover:text-gray-500 hover:text-white",
        disabled: true,
      },
      {
        to: "/index/tienda", label: "Navegacion de Archivos", icon: <ShoppingCartOutlined />, color: "text-gray-500",
        hoverClass: "hover:text-gray-500 hover:text-white",
        disabled: true,
      },
      { to: "", label: "", isSpace: true },
      { to: "", label: "", isSpace: true },
      { to: "", label: "", isSpace: true },
    ].filter(Boolean),
    [userRole]
  );
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
  // Obtener la posición del ítem de menú cuando se hace clic
  const handleMenuItemClick = (e, submenuItems) => {
    const rect = e.target.getBoundingClientRect(); // Obtener las coordenadas del ítem
    setModalPosition({
      top: rect.top + rect.height, // Justo debajo del ítem
      left: rect.left + 40, // Aquí puedes aumentar el valor de 'left' para moverlo más a la derecha
    });
    setModalContent(submenuItems); // Establecer el contenido del submenú
    setIsModalVisible(true); // Mostrar el modal
  };

  return (
    <>
      <Header unreadEmailsCount={0} />
      <Layout className="flex h-screen bg-gray-100">
        {/* Botón de menú móvil */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden fixed top-4 left-4 bg-primary shadow-lg backdrop-blur-sm bg-opacity-90 text-white hover:bg-opacity-100 transition-all duration-300"
        >
          <MenuOutlined />
        </button>

        {/* Sidebar */}
        <div
          className={`${isExpanded ? "w-48" : "w-18"} 
                bg-white text-black ${isOpen ? "block" : "hidden"} 
               p-4 lg:block fixed top-0 left-0 h-full transition-all duration-300`}
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
          <div className="space-y-2 py-2 max-h-screen overflow-y-auto mt-10 my-4 bg-white"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}>
            {/* Menu Links */}
            {mainMenuLinks.map((link, index) =>
              link.isSpace ? (
                <div key={`space-${index}`} className="py-0"></div> // Reducido el espacio vacío
              ) : link.isTitle ? (
                <div
                  key={`title-${index}`}
                  className={`py-1 text-xs font-bold uppercase ${link.color || "text-gray-500"} 
        ${isExpanded ? "text-center" : "hidden"} w-full`}
                >
                  {link.label}
                </div>
              ) : link.hasSubmenu ? (
                <div key={`submenu-${link.label}-${index}`}>
                  <button
                    ref={menuItemRef}
                    onClick={(e) => {
                      if (!isExpanded) {
                        handleMenuItemClick(e, link.submenuItems);
                      } else {
                        setActiveSubMenu(activeSubMenu === link.label ? null : link.label);
                      }
                    }}
                    className={`group flex items-center w-full p-1 text-left 
          ${link.color === "text-[#007072]"
                        ? "hover:bg-[#007072]"
                        : link.color === "text-blue-500"
                          ? "hover:bg-blue-500"
                          : link.color === "text-gray-500"
                            ? "hover:bg-gray-500"
                            : "hover:bg-[#7d4fff]"}  
            ${link.color || "text-black"} text-sm ${link.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className={`mr-1 ${link.color} group-hover:text-white`}>
                      {link.icon}
                    </span>
                    <span className={`text-black group-hover:text-white ${link.hoverClass}`}>
                      {isExpanded ? link.label : ""}
                    </span>
                    <span className="ml-auto group-hover:text-white">
                      {activeSubMenu === link.label ? <UpOutlined /> : <DownOutlined />}
                    </span>
                  </button>

                  {activeSubMenu === link.label && isExpanded && (
                    <div className="ml-2 space-y-1"> {/* Reducido el margen a la izquierda */}
                      {link.submenuItems.map((subItem, subIndex) => (
                        <Link
                          key={`${subItem.to}-${subIndex}`}
                          to={subItem.to}
                          className={`group flex items-center w-full p-1 text-left text-sm 
                ${subItem.color === "text-[#007072]"
                              ? "hover:bg-[#007072]"
                              : subItem.color === "text-blue-500"
                                ? "hover:bg-blue-500"
                                : subItem.color === "text-gray-500"
                                  ? "hover:bg-gray-500"
                                  : "hover:bg-[#7d4fff]"}  
                ${subItem.color || "text-black"} text-sm ${subItem.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <span className={`mr-1 ${subItem.color} group-hover:text-white`}>
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
                  key={`${link.to}-${index}`}
                  to={link.to}
                  className={`group flex items-center w-full p-1 text-left 
        ${link.color === "text-[#007072]"
                      ? "hover:bg-[#007072]"
                      : link.color === "text-blue-500"
                        ? "hover:bg-blue-500"
                        : link.color === "text-gray-500"
                          ? "hover:bg-gray-500"
                          : "hover:bg-[#7d4fff]"}  
        ${link.color || "text-black"} text-sm ${link.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className={`mr-1 ${link.color} group-hover:text-white`}>
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
              {isExpanded ? <UpOutlined className="text-black" /> : <DownOutlined className="text-black" />}
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

      {/* Modal flotante para submenú */}
      {isModalVisible && (
        <div
          ref={modalRef} // Agregar la referencia aquí
          style={{
            position: "absolute",
            top: modalPosition.top,
            left: modalPosition.left,
            zIndex: 1000,
            background: "white",
            border: "1px solid #ddd",
            boxShadow: "0 0 5px rgba(0, 0, 0, 0.15)",
            padding: "10px",
            borderRadius: "4px",
            width: "200px", // Puedes ajustarlo según tus necesidades
          }}
        >
          <div className="space-y-1">
            {modalContent.map((subItem) => (
              <Link
                key={subItem.to}
                to={subItem.to}
                className="block p-2 text-sm text-[#7d4fff] hover:bg-[#7d4fff] hover:text-white"
              >
                {subItem.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}