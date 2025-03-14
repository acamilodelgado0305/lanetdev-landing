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
  IdcardOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, Tooltip, Input } from "antd";
import { DotIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/header/Header"; // Asegúrate de que la ruta sea correcta
import { useAuth } from "../components/Context/AuthProvider";

const { Sider } = Layout;

export default function Root() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [unreadEmailsCount, setUnreadEmailsCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalPosition, setModalPosition] = useState({
    top: 20,
    left: window.innerWidth - 300,
  });
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { userRole } = useAuth();
  const location = useLocation();
  const menuItemRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const mainMenuLinks = useMemo(
    () => [
      { to: "/index", label: "Dashboard", icon: <HomeOutlined /> },
      { label: "CRM", isTitle: true },
      userRole === "superadmin" && {
        to: "/index/clientes",
        label: "Clientes",
        icon: <TeamOutlined />,
      },
      {
        to: "/index/Instalaciones",
        label: "Instalaciones",
        icon: <HomeOutlined />,
        disabled: true,
      },
      {
        label: "Finanzas",
        icon: <IdcardOutlined />,
        hasSubmenu: true,
        disabled: true,
        submenuItems: [
          {
            to: "/index/administracion/cajeros",
            label: "Facturas",
            icon: <DotIcon />,
            disabled: true,
          },
        ],
      },
      {
        to: "/index/tickets",
        label: "Tickets",
        icon: <DotChartOutlined />,
        disabled: true,
      },
      {
        to: "/index/cobro-cartera",
        label: "Cobro de Cartera",
        icon: <BankOutlined />,
        disabled: true,
      },
      {
        label: "Comunicación",
        icon: <MessageOutlined />,
        hasSubmenu: true,
        disabled: true,
        submenuItems: [
          {
            to: "/index/comunicacion/notificaciones",
            label: "Notificaciones WhatsApp",
            icon: <DotChartOutlined />,
            disabled: true,
          },
          {
            to: "/index/comunicacion/multichat",
            label: "Multichat",
            icon: <DotChartOutlined />,
            disabled: true,
          },
        ],
      },
      {
        to: "/index/moneymanager/cotizacion",
        label: "Estudio de Mercado",
        icon: <DotChartOutlined />,
        disabled: true,
      },
      { label: "COMPAÑIA", isTitle: true },
      (userRole === "cajero" || userRole === "superadmin") && {
        label: "Contabilidad",
        icon: <DollarCircleOutlined />,
        hasSubmenu: true,
        submenuItems: [
          {
            to: "/index/moneymanager/estadisticas",
            label: "Resumen",
            icon: <DotIcon />,
            disabled: true,
          },
          {
            to: "/index/moneymanager/transactions",
            label: "Transacciones",
            icon: <DotIcon />,
          },
          {
            to: "/index/moneymanager/pagos-pendientes",
            label: "Pagos Recurrentes",
            icon: <DotIcon />,
          },
          {
            to: "/index/moneymanager/informes",
            label: "Informes",
            icon: <DotIcon />,
            disabled: true,
          },
        ],
      },
      {
        label: "Gestión de Red",
        icon: <IdcardOutlined />,
        hasSubmenu: true,
        disabled: true,
        submenuItems: [
          {
            to: "/index/administracion/cajeros",
            label: "Direccionamiento Ip",
            icon: <DotIcon />,
            disabled: true,
          },
          {
            to: "/index/administracion/cajeros",
            label: "Monitoreo",
            icon: <DotIcon />,
            disabled: true,
          },
          {
            to: "/index/administracion/cajeros",
            label: "Aprovisinamiento de Red",
            icon: <DotIcon />,
            disabled: true,
          },
          {
            to: "/index/administracion/cajeros",
            label: "Conexion de routers",
            icon: <DotIcon />,
            disabled: true,
          },
        ],
      },
      {
        to: "/index/inventario",
        label: "Inventario",
        icon: <ContainerOutlined />,
        disabled: true,
      },
      {
        label: "Terceros",
        icon: <IdcardOutlined />,
        hasSubmenu: true,
        submenuItems: [
          {
            to: "/index/terceros/cajeros",
            label: "Cajeros",
            icon: <DotIcon />,
          },
          {
            to: "/index/moneymanager/terceros",
            label: "Proveedores",
            icon: <DotIcon />,
          },
        ],
      },
      {
        to: "/index/tienda",
        label: "Reportes",
        icon: <ShoppingCartOutlined />,
        disabled: true,
      },
      {
        to: "/index/moneymanager/cotizacion",
        label: "Gestión de compras",
        icon: <DotChartOutlined />,
        disabled: true,
      },
      {
        to: "/index/moneymanager/calendario",
        label: "Calendario",
        icon: <CalendarOutlined />,
        disabled: true,
      },
      {
        to: "/index/recursoHumanos",
        label: "Recursos Humanos",
        icon: <BankOutlined />,
        disabled: true,
      },
      { label: "SISTEMA", isTitle: true },
      {
        to: "/index/config",
        label: "Configuración",
        icon: <SettingOutlined />,
      },
      {
        label: "Administración",
        icon: <IdcardOutlined />,
        hasSubmenu: true,
        disabled: true,
        submenuItems: [
          {
            to: "/index/administracion/cajeros",
            label: "Portal Tecnicos",
            icon: <DotIcon />,
          },
          {
            to: "/index/administracion/cajeros",
            label: "Portal Clientes",
            icon: <DotIcon />,
          },
        ],
      },
      { to: "", label: "", isSpace: true },
      {
        to: "/index/tienda",
        label: "Tienda",
        icon: <ShoppingCartOutlined />,
        disabled: true,
      },
      {
        to: "/index/tareas",
        label: "Tareas",
        icon: <AppstoreAddOutlined />,
        disabled: true,
      },
      {
        to: "/index/tienda",
        label: "Navegación de Archivos",
        icon: <ShoppingCartOutlined />,
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

  const handleMenuItemClick = (e, submenuItems) => {
    const rect = e.target.getBoundingClientRect();
    setModalPosition({
      top: rect.top + rect.height + 5,
      left: rect.left + 40,
    });
    setModalContent(submenuItems);
    setIsModalVisible(true);
  };

  const filteredMenuLinks = useMemo(() => {
    if (!searchQuery) return mainMenuLinks;
    return mainMenuLinks.filter((link) => {
      if (link.isTitle || link.isSpace) return true;
      const labelMatch = link.label.toLowerCase().includes(searchQuery.toLowerCase());
      const submenuMatch = link.hasSubmenu
        ? link.submenuItems.some((subItem) =>
          subItem.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : false;
      return labelMatch || submenuMatch;
    });
  }, [mainMenuLinks, searchQuery]);

  return (
    <>

      <div className="fixed top-0 left-0 w-screen flex bg-gray-100 z-40">
        <Header
          isSidebarExpanded={isExpanded}
          isSidebarHidden={isHidden}
          setIsExpanded={setIsExpanded}
        />
      </div>

      <Layout className="flex h-screen bg-gray-100">
        {/* Botón de menú móvil */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden fixed top-4 left-4 bg-gray-800 text-white p-2 rounded-md shadow-lg transition-all duration-300 hover:bg-gray-700 z-10"
        >
          <MenuOutlined />
        </button>

        {/* Botón para mostrar el sidebar cuando está⁠ oculto */}
        <AnimatePresence>
          {isHidden && (
            <motion.button
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onClick={() => setIsHidden(false)}
              className="fixed top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-r-md shadow-lg transition-all duration-300 hover:bg-gray-700 z-50"
            >
              <RightOutlined className="text-sm" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          {(!isHidden || isOpen) && (
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`border-r border-gray-200 bg-white text-gray-800 ${isExpanded ? "w-64" : "w-16"
                } py-5 lg:block fixed top-0 left-0 h-full transition-all duration-300 ease-in-out shadow-md z-50`}
            >
              {/* Barra de búsqueda (solo visible cuando el sidebar está expandido) */}
              {isExpanded && (
                <div className="px-4 py-2 ">
                  <Input
                    placeholder="Buscar..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border-gray-300 focus:border-gray-400 focus:ring-0"
                  />
                </div>
              )}

              <div
                className="space-y-1 py-2 max-h-screen overflow-y-auto mt-4 pl-4 my-4"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {/* Menu Links */}
                {filteredMenuLinks.map((link, index) =>
                  link.isSpace ? (
                    <div key={`space-${index}`} className="py-2" />
                  ) : link.isTitle ? (
                    <div
                      key={`title-${index}`}
                      className={`py-2 px-4 text-xs font-semibold uppercase text-gray-400 ${isExpanded ? "block" : "hidden"
                        }`}
                    >
                      {link.label}
                    </div>
                  ) : link.hasSubmenu ? (
                    <div key={`submenu-${link.label}-${index}`}>
                      <Tooltip
                        title={isExpanded ? "" : link.label}
                        placement="right"
                        overlayClassName="text-sm"
                      >
                        <button
                          ref={menuItemRef}
                          onClick={(e) => {
                            if (!isExpanded) {
                              handleMenuItemClick(e, link.submenuItems);
                            } else {
                              setActiveSubMenu(
                                activeSubMenu === link.label ? null : link.label
                              );
                            }
                          }}
                          disabled={link.disabled}
                          className={`group flex items-center w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors duration-200 ${link.disabled ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                          <span className="mr-2 text-gray-500 group-hover:text-gray-900">
                            {link.icon}
                          </span>
                          {isExpanded && (
                            <>
                              <span className="flex-1">{link.label}</span>
                              <motion.span
                                initial={{ rotate: 0 }}
                                animate={{
                                  rotate: activeSubMenu === link.label ? 180 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                                className="text-gray-400 group-hover:text-gray-900"
                              >
                                <DownOutlined className="text-xs" />
                              </motion.span>
                            </>
                          )}
                        </button>
                      </Tooltip>

                      <AnimatePresence>
                        {activeSubMenu === link.label && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="ml-6 space-y-1 overflow-hidden"
                          >
                            {link.submenuItems.map((subItem, subIndex) => (
                              <Tooltip
                                key={`${subItem.to}-${subIndex}`}
                                title={isExpanded ? "" : subItem.label}
                                placement="right"
                                overlayClassName="text-sm"
                              >
                                <Link
                                  to={subItem.to}
                                  className={`group flex items-center w-full px-4 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors duration-200 ${subItem.disabled
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                    }`}
                                >
                                  <span className="mr-2 text-gray-400 group-hover:text-gray-900">
                                    {subItem.icon}
                                  </span>
                                  <span>{subItem.label}</span>
                                </Link>
                              </Tooltip>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Tooltip
                      title={isExpanded ? "" : link.label}
                      placement="right"
                      overlayClassName="text-sm"
                    >
                      <Link
                        key={`${link.to}-${index}`}
                        to={link.to}
                        className={`group flex items-center w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors duration-200 ${link.disabled ? "opacity-50 cursor-not-allowed" : ""
                          } ${selectedKeys.includes(link.to)
                            ? "bg-gray-100 text-gray-900"
                            : ""
                          }`}
                      >
                        <span className="mr-2 text-gray-500 group-hover:text-gray-900">
                          {link.icon}
                        </span>
                        {isExpanded && <span>{link.label}</span>}
                      </Link>
                    </Tooltip>
                  )
                )}
              </div>

              {/* Botón para expandir/contraer el menú */}
              <button
                onClick={() => setIsHidden(true)}
                className="flex items-center justify-center w-full p-2 text-gray-500 hover:bg-gray-100 transition-colors duration-200 absolute bottom-0"
              >
                {isExpanded ? (
                  <LeftOutlined className="text-sm" />
                ) : (
                  <RightOutlined className="text-sm" />
                )}
              </button>


            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        <Layout.Content
          className={`flex-1 overflow-x-hidden overflow-y-auto mt-6 ${isHidden ? "ml-0" : isExpanded ? "ml-64" : "ml-16"
            } h-screen transition-all duration-300 ease-in-out`}
        >

          <Outlet context={{ setUnreadEmailsCount }} />
        </Layout.Content>
      </Layout>

      {/* Modal flotante para submenús */}
      <AnimatePresence>
        {isModalVisible && (
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: modalPosition.top,
              left: modalPosition.left,
              zIndex: 1000,
              background: "white",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              padding: "8px",
              borderRadius: "8px",
              width: "200px",
            }}
          >
            <div className="space-y-1">
              {modalContent.map((subItem) => (
                <Link
                  key={subItem.to}
                  to={subItem.to}
                  className={`block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors duration-200 ${subItem.disabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {subItem.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}