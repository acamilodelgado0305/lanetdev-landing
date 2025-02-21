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
        icon: <DotChartOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white",
      },

      {
        label: "Finanzas",
        icon: <IdcardOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white",
        hasSubmenu: true,
        submenuItems: [
          {
            to: "/index/administracion/cajeros",
            label: "Facturas",
            icon: <DotIcon />,
            color: "text-[#7d4fff]",
            hoverClass: "hover:bg-[#7d4fff] hover:text-white",
          },
        ],
      },

      {
        to: "/index/tickets",
        label: "Tickets",
        icon: <DotChartOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white",
      },

      {
        label: "Comunicación",
        icon: <MessageOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white",
        hasSubmenu: true,
        submenuItems: [
          {
            to: "/index/comunicacion/notificaciones",
            label: "Notificaciones WhatsApp",
            icon: <DotChartOutlined />,
            color: "text-[#7d4fff]",
            hoverClass: "hover:bg-[#7d4fff] hover:text-white",
          },
          {
            to: "/index/comunicacion/multichat",
            label: "Multichat",
            icon: <DotChartOutlined />,
            color: "text-[#7d4fff]",
            hoverClass: "hover:bg-[#7d4fff] hover:text-white",
          },
        ],
      },

      {
        to: "/index/moneymanager/cotizacion",
        label: "Estudio de Mercado",
        icon: <DotChartOutlined />,
        color: "text-[#7d4fff]",
        hoverClass: "hover:bg-[#7d4fff] hover:text-white",
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
          {
            to: "/index/moneymanager/terceros", label: "Terceros", icon: <DotIcon />, color: "text-green-400",
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
          {
            to: "/index/moneymanager/config", label: "Configuración", icon: <SettingOutlined />, color: "text-blue-500",
            hoverClass: "hover:text-blue-500 hover:text-white",
          },

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
      { to: "", label: "", isSpace: true },

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
          <div className="space-y-2 py-2 max-h-screen overflow-y-auto mt-10 my-4 bg-white"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}>
            {/* Menu Links */}
            {mainMenuLinks.map((link, index) =>
              link.isSpace ? (
                <div key={`space-${index}`} className="py-1"></div> // Reducir el espacio vacío
              ) : link.isTitle ? (
                <div
                  key={`title-${index}`} // Asegura una clave única para los títulos
                  className={`py-2 text-xs font-bold uppercase ${link.color || "text-gray-500"} 
        ${isExpanded ? "text-center" : "hidden"} w-full`}
                >
                  {link.label}
                </div>
              ) : link.hasSubmenu ? (
                <div key={`submenu-${link.label}-${index}`}>
                  <button
                    ref={menuItemRef} // Referencia al botón del ítem
                    onClick={(e) => {
                      if (!isExpanded) {
                        handleMenuItemClick(e, link.submenuItems); // Mostrar el modal si está contraído
                      } else {
                        setActiveSubMenu(activeSubMenu === link.label ? null : link.label); // Mostrar el submenú si está expandido
                      }
                    }}
                    className={`group flex items-center w-full p-1 text-left  // Reducir el padding
        ${link.color === "text-green-400"
                        ? "hover:bg-green-400"
                        : link.color === "text-blue-500"
                          ? "hover:bg-blue-500"
                          : link.color === "text-gray-500"
                            ? "hover:bg-gray-500"
                            : "hover:bg-[#7d4fff]"}  
        ${link.color || "text-black"} text-sm`}
                  >
                    <span className={`mr-2 ${link.color} group-hover:text-white`}> {/* Reducir margen a la derecha */}
                      {link.icon}
                    </span>
                    <span className={`text-black group-hover:text-white ${link.hoverClass}`}>
                      {isExpanded ? link.label : ""}
                    </span>
                    <span className="ml-auto group-hover:text-white">
                      {activeSubMenu === link.label ? <UpOutlined /> : <DownOutlined />}
                    </span>
                  </button>

                  {/* Mostrar submenú si está expandido */}
                  {activeSubMenu === link.label && isExpanded && (
                    <div className="ml-4 space-y-1"> {/* Reducir margen a la izquierda */}
                      {link.submenuItems.map((subItem, subIndex) => (
                        <Link
                          key={`${subItem.to}-${subIndex}`} // Clave única combinando `to` y `subIndex`
                          to={subItem.to}
                          className={`group flex items-center w-full p-1 text-left text-sm 
                ${subItem.color === "text-green-400"
                              ? "hover:bg-green-400"
                              : subItem.color === "text-blue-500"
                                ? "hover:bg-blue-500"
                                : subItem.color === "text-gray-500"
                                  ? "hover:bg-gray-500"
                                  : "hover:bg-[#7d4fff]"}  
                ${subItem.color || "text-black"} group-hover:text-white`}
                        >
                          <span className={`mr-2 ${subItem.color} group-hover:text-white`}> {/* Reducir margen a la derecha */}
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
                  key={`${link.to}-${index}`} // Clave única combinando `to` y `index`
                  to={link.to}
                  className={`group flex items-center w-full p-1 text-left  // Reducir el padding
        ${link.color === "text-green-400"
                      ? "hover:bg-green-400"
                      : link.color === "text-blue-500"
                        ? "hover:bg-blue-500"
                        : link.color === "text-gray-500"
                          ? "hover:bg-gray-500"
                          : "hover:bg-[#7d4fff]"}  
        ${link.color || "text-black"} group-hover:text-white text-sm`}
                >
                  <span className={`mr-2 ${link.color} group-hover:text-white`}> {/* Reducir margen a la derecha */}
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