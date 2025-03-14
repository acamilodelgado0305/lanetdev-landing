import React, { useState, useRef } from 'react';
import { Plus, Menu as MenuIcon } from 'lucide-react';
import {
  BellOutlined,
  MailOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  AppstoreOutlined,
  LeftSquareOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Input,
  Badge,
  Tooltip,
  Dropdown,
  Menu,
  Button,
  Space,
  Drawer,
} from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../Context/SocketContext';
import { useAuth } from '../Context/AuthProvider';
import NotificationModal from '../communication/components/NotificationModal';
import PlusModal from "../MoneyManager/transactions/PlusModal";

import picture from '../../imagenes/F.png';

const Header = ({ isSidebarExpanded, isSidebarHidden, setIsExpanded }) => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications } = useSocket();
  const { logout } = useAuth();
  const [isPlusModalOpen, setIsPlusModalOpen] = useState(false);
  const createButtonRef = useRef(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });

  const openPlusModal = () => {
    if (createButtonRef.current) {
      const rect = createButtonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsPlusModalOpen(true);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/index/search?query=${searchTerm}`);
      setSearchTerm('');
    }
  };

  const closePlusModal = () => {
    setIsPlusModalOpen(false);
  };

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case 'emails':
        navigate('/index/emails');
        break;
      case 'config':
        navigate('/index/config');
        break;
      case 'logout':
        logout();
        navigate('/login');
        break;
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="emails" icon={<MailOutlined />}>Emails</Menu.Item>
      <Menu.Item key="config" icon={<SettingOutlined />}>Configuration</Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>Logout</Menu.Item>
    </Menu>
  );

  // Determinar el margen izquierdo del contenido del header según el estado del sidebar
  const headerMarginLeft = isSidebarHidden ? 'ml-0' : isSidebarExpanded ? 'ml-64' : 'ml-16';

  // Contenido del menú móvil (acciones del usuario)
  const mobileMenuContent = (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-4">
        <Tooltip title="Notificaciones">
          <Badge count={notifications.length} size="small">
            <BellOutlined className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-2 rounded" />
          </Badge>
        </Tooltip>
        <span>Notificaciones</span>
      </div>
      <div className="flex items-center space-x-4">
        <Tooltip title="Ayuda">
          <QuestionCircleOutlined className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-2 rounded" />
        </Tooltip>
        <span>Ayuda</span>
      </div>
      <div className="flex items-center space-x-4">
        <Tooltip title="Configuración">
          <Dropdown overlay={menu} trigger={['click']}>
            <SettingOutlined className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-2 rounded" />
          </Dropdown>
        </Tooltip>
        <span>Configuración</span>
      </div>
      <div className="flex items-center space-x-4">
        <Tooltip title="Perfil">
          <div className="w-8 h-8 rounded-full bg-[#0052CC] flex items-center justify-center cursor-pointer">
            <span className="text-white text-sm">US</span>
          </div>
        </Tooltip>
        <span>Perfil</span>
      </div>
    </div>
  );

  return (
    <div className={`w-full bg-white border-b border-gray-300 h-14 flex items-center px-4 transition-all duration-300 ease-in-out ${headerMarginLeft}`}>
      <div className="w-full flex items-center justify-between min-w-0">
        {/* Sección izquierda: Logo y botón de sidebar */}
        <div className="flex items-center space-x-2 min-w-0">
          <LeftSquareOutlined
            className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-1 rounded"
            onClick={() => setIsExpanded(!isSidebarExpanded)} // Añade este evento
          />
          <Link to="/index" className="flex items-center space-x-2 min-w-0">
            <img src={picture} alt="Logo" className="h-8" />
            <span className="text-[#44546f] text-lg font-medium truncate">Ispsuite</span>
          </Link>
        </div>

        {/* Sección central: Barra de búsqueda y botón "Crear" */}
        <div className="flex items-center justify-center min-w-0 mx-2 space-x-2">
          {/* Barra de búsqueda (visible en pantallas grandes, colapsada en móviles) */}
          <div className="hidden lg:flex items-center min-w-0 max-w-[300px]">
            <Input.Search
              placeholder="Buscar"
              allowClear
              onSearch={handleSearch}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 focus:border-gray-400 focus:ring-0"
            />
          </div>
          {/* Botón de búsqueda colapsado para pantallas medianas y pequeñas */}
          <div className="lg:hidden flex items-center">
            <Tooltip title="Buscar">
              <SearchOutlined
                className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-1 rounded"
                onClick={() => alert('Funcionalidad de búsqueda en móviles no implementada')}
              />
            </Tooltip>
          </div>
          {/* Botón "Crear" (compacto en pantallas pequeñas) */}
          <Button
            ref={createButtonRef}
            onClick={openPlusModal}
            type="primary"
            className="flex items-center h-9 px-3 rounded-md min-w-0"
            style={{
              backgroundColor: '#0052CC',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">Crear</span>
          </Button>
        </div>

        {/* Sección derecha: Acciones del usuario */}
        <div className="flex items-center min-w-0">
          {/* Acciones visibles en pantallas medianas y grandes */}
          <div className="hidden md:flex items-center space-x-2">
            <Tooltip title="Notificaciones">
              <Badge count={notifications.length} size="small">
                <BellOutlined className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-1 rounded" />
              </Badge>
            </Tooltip>
            <Tooltip title="Ayuda">
              <QuestionCircleOutlined className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-1 rounded" />
            </Tooltip>
            <Tooltip title="Configuración">
              <Dropdown overlay={menu} trigger={['click']}>
                <SettingOutlined className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-1 rounded" />
              </Dropdown>
            </Tooltip>
            <Tooltip title="Perfil">
              <div className="w-7 h-7 rounded-full bg-[#0052CC] flex items-center justify-center cursor-pointer">
                <span className="text-white text-xs">US</span>
              </div>
            </Tooltip>
          </div>
          {/* Botón de menú hamburguesa para móviles */}
          <div className="md:hidden flex items-center">
            <MenuIcon
              className="text-[#44546f] w-6 h-6 cursor-pointer hover:bg-[#091e420f] p-1 rounded"
              onClick={() => setIsMobileMenuOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Drawer para el menú móvil */}
      <Drawer
        title="Menú"
        placement="right"
        onClose={() => setIsMobileMenuOpen(false)}
        visible={isMobileMenuOpen}
        width={250}
      >
        {mobileMenuContent}
      </Drawer>

      {/* Modales */}
      <NotificationModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={notifications}
      />
      <PlusModal
        isOpen={isPlusModalOpen}
        onClose={closePlusModal}
        buttonPosition={buttonPosition}
      />
    </div>
  );
};

export default Header;