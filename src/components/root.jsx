import React, { useState, useMemo, useEffect } from "react";
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
  BankOutlined

} from "@ant-design/icons";
import { Layout, Menu, Button, Tooltip } from "antd";
import Header from "../components/header/Header";
import UserProfileHeader from "./user/UserProfileHeader";
import { useAuth } from "../components/Context/AuthProvider";
import { DotIcon } from "lucide-react";

const { Sider } = Layout;

// Componente SidebarSection mejorado
const SidebarSection = ({ title, children, isExpanded }) => (
  <div className="relative group">
    {isExpanded && (
      <div className="px-3 mb-2 flex items-center">
        <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{title}</h3>
        <div className="flex-1 ml-2 border-t border-gray-700/50"></div>
      </div>
    )}
    <div className="space-y-1">{children}</div>
  </div>
);

export default function Root() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [unreadEmailsCount, setUnreadEmailsCount] = useState(0);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const { userRole } = useAuth();
  const location = useLocation();

  // Definición de los enlaces principales del menú
  const mainMenuLinks = useMemo(
    () => [
      { to: "/index", label: "Inicio", icon: <HomeOutlined /> },
      userRole === "superadmin" && { to: "/index/clientes", label: "Clientes", icon: <TeamOutlined /> },
      { to: "/index/cobro-cartera", label: "Cobro de Cartera", icon: <BankOutlined /> },
      { to: "/index/tickets", label: "Tickets", icon: <DotChartOutlined /> },
      { to: "/index/gestion-red", label: "Gestión de Red", icon: <TeamOutlined /> },
      { to: "/index/inventario", label: "Inventario", icon: <ContainerOutlined /> },
      (userRole === "admin" || userRole === "superadmin") && {
        label: "Contabilidad",
        icon: <DollarCircleOutlined />,
        hasSubmenu: true,
        submenuItems: [
          { to: "/index/moneymanager/estadisticas", label: "Resumen", icon: <DotIcon /> },
          { to: "/index/moneymanager/transactions", label: "Transacciones", icon: <DotIcon /> },
          { to: "/index/moneymanager/terceros", label: "Terceros", icon: <DotIcon /> },
          { to: "/index/moneymanager/pagos-pendientes", label: "Pagos Recurrentes", icon: <DotIcon /> },
          { to: "/index/moneymanager/informes", label: "Informes", icon: <DotChartOutlined /> },
          { to: "/index/moneymanager/calendario", label: "Calendario", icon: <CalendarOutlined /> },
          { to: "/index/moneymanager/config", label: "Configuración", icon: <SettingOutlined /> },
          { to: "/index/moneymanager/cotizacion", label: "Cotización", icon: <DotChartOutlined /> },
        ],
      },
      { to: "/index/doc", label: "Documentación", icon: <FileTextOutlined /> },
      {
        label: "Comunicación",
        icon: <MessageOutlined />,
        hasSubmenu: true,
        submenuItems: [
          { to: "/index/comunicacion/notificaciones", label: "Notificaciones WhatsApp", icon: <DotChartOutlined /> },
          { to: "/index/comunicacion/multichat", label: "Multichat", icon: <DotChartOutlined /> },
        ],
      },
      { to: "/index/tareas", label: "Tareas", icon: <AppstoreAddOutlined /> },
      { to: "/index/configuracion", label: "Configuración", icon: <SettingOutlined /> },
      {
        to: "/index/tienda", label: "Tienda", icon: <ShoppingCartOutlined />
      },
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

  return (
    <>
      <Header unreadEmailsCount={unreadEmailsCount} />
      <Layout className="flex h-screen bg-gray-100">
        {/* Botón de menú móvil */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-primary rounded-xl shadow-lg backdrop-blur-sm bg-opacity-90 text-white hover:bg-opacity-100 transition-all duration-300"
          icon={<MenuOutlined />}
        />
        {/* Sidebar */}
        <Sider
          collapsed={!isExpanded}
          collapsible
          onCollapse={(collapsed) => setIsExpanded(!collapsed)}
          width={150}
          collapsedWidth={40}
          className="transition-all"
        >
          <UserProfileHeader
            className="mb-20"
            onToggle={() => setIsOpen(false)}
            isUserProfileOpen={isUserProfileOpen}
            setIsUserProfileOpen={setIsUserProfileOpen}
            isExpanded={isExpanded}
          />
          <Menu
            mode="inline"
            theme="dark"
            className="text-xs font-medium h-screen"
            inlineCollapsed={!isExpanded}
            selectedKeys={selectedKeys} // Aplicamos las claves seleccionadas
          >
            {/* Menú principal */}
            <SidebarSection title="Menú" isExpanded={isExpanded}>
              {mainMenuLinks.map((link) =>
                link.hasSubmenu ? (
                  <Menu.SubMenu
                    key={link.label}
                    title={
                      isExpanded ? (
                        <span>{link.label}</span>
                      ) : (
                        <Tooltip title={link.label}>
                          <span>{link.icon}</span>
                        </Tooltip>
                      )
                    }
                    icon={link.icon}
                  >
                    {link.submenuItems.map((subItem) => (
                      <Menu.Item key={subItem.to} icon={subItem.icon}>
                        <Link to={subItem.to}>{subItem.label}</Link>
                      </Menu.Item>
                    ))}
                  </Menu.SubMenu>
                ) : (
                  <Menu.Item key={link.to} icon={link.icon}>
                    <Link to={link.to}>{link.label}</Link>
                  </Menu.Item>
                )
              )}
            </SidebarSection>
          </Menu>
          {/* Footer */}
          <div className="p-2 border-t bg-black/20 text-center">
            {isExpanded ? (
              <p className="text-[10px] text-gray-400">© 2024 IspSuite</p>
            ) : (
              <span className="text-gray-400 text-lg">•••</span>
            )}
          </div>
        </Sider>
        {/* Contenido principal */}
        <Layout.Content className="flex-1 overflow-x-hidden overflow-y-auto mt-14">
          <Outlet context={{ setUnreadEmailsCount }} />
        </Layout.Content>
      </Layout>
    </>
  );
}