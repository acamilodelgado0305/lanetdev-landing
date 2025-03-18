import React, { useState, useRef } from 'react';
import { Plus, Menu as MenuIcon } from 'lucide-react';
import {
  BellOutlined,
  MailOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UserOutlined,
  LeftSquareOutlined 
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
  Avatar,
  Typography,
} from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../Context/SocketContext';
import { useAuth } from '../Context/AuthProvider';
import NotificationModal from '../communication/components/NotificationModal';
import PlusModal from "../MoneyManager/transactions/PlusModal";
import picture from '../../imagenes/F.png';

const { Text } = Typography;

const Header = ({ isSidebarExpanded, isSidebarHidden, setIsExpanded }) => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications } = useSocket();
  const { logout, user } = useAuth();
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
      default:
        break;
    }
  };

  // Menú del perfil con foto, nombre, correo y opciones
  const profileMenu = (
    <Menu
      onClick={handleMenuClick}
      style={{ width: 300, padding: '8px 0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8e8e8' }}>
        <Space direction="horizontal" align="center">
          <Avatar
            size={40}
            src={user?.profilepictureurl || undefined}
            icon={!user?.profilepictureurl && <UserOutlined />}
            style={{ backgroundColor: '#0052CC', marginRight: 12 }}
          />
          <div>
            <Text strong style={{ fontSize: 16, color: '#333' }}>
              {user?.username || 'Usuario'}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 14 }}>
              {user?.email || 'correo@ejemplo.com'}
            </Text>
          </div>
        </Space>
      </div>
      <Menu.Item key="emails" icon={<MailOutlined />} style={{ padding: '10px 16px' }}>
        Emails
      </Menu.Item>
      <Menu.Item key="config" icon={<SettingOutlined />} style={{ padding: '10px 16px' }}>
        Configuración
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger style={{ padding: '10px 16px' }}>
        Cerrar sesión
      </Menu.Item>
    </Menu>
  );

  const Configuracion = (
    <Menu onClick={handleMenuClick} style={{ width: 200 }}>
      <Menu.Item key="config" icon={<SettingOutlined />}>
        Configuración General
      </Menu.Item>
    </Menu>
  );

  const headerMarginLeft = isSidebarHidden ? 'ml-0' : isSidebarExpanded ? 'ml-64' : 'ml-16';

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
          <Dropdown overlay={Configuracion} trigger={['click']}>
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
            onClick={() => setIsExpanded(!isSidebarExpanded)}
          />
          <Link to="/index" className="flex items-center space-x-2 min-w-0">
            <img src={picture} alt="Logo" className="h-8" />
            <span className="text-[#44546f] text-lg font-medium truncate">Ispsuite</span>
          </Link>
        </div>

        {/* Sección derecha: Acciones del usuario */}
        <div className="flex items-center min-w-0">
          <div className="hidden lg:flex items-center min-w-0 max-w-[300px] mr-3">
            <Input.Search
              placeholder="Buscar"
              allowClear
              onSearch={handleSearch}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 focus:border-gray-400 focus:ring-0"
            />
          </div>
          <div className="lg:hidden flex items-center mr-3">
            <Tooltip title="Buscar">
              <SearchOutlined
                className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-1 rounded"
                onClick={() => alert('Funcionalidad de búsqueda en móviles no implementada')}
              />
            </Tooltip>
          </div>

          <Button
            ref={createButtonRef}
            onClick={openPlusModal}
            type="primary"
            className="flex items-center h-9 mr-3 rounded-md min-w-0"
            style={{
              backgroundColor: '#0052CC',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">Crear</span>
          </Button>

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
              <Dropdown overlay={Configuracion} trigger={['click']}>
                <SettingOutlined className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-1 rounded" />
              </Dropdown>
            </Tooltip>
            <Tooltip title="Perfil">
              <Dropdown overlay={profileMenu} trigger={['click']}>
                <div className="w-7 h-7 rounded-full bg-[#0052CC] flex items-center justify-center cursor-pointer">
                  <span className="text-white text-xs">
                    {user?.username?.slice(0, 2).toUpperCase() || 'US'}
                  </span>
                </div>
              </Dropdown>
            </Tooltip>
          </div>

          <div className="md:hidden flex items-center">
            <MenuIcon
              className="text-[#44546f] w-6 h-6 cursor-pointer hover:bg-[#091e420f] p-1 rounded"
              onClick={() => setIsMobileMenuOpen(true)}
            />
          </div>
        </div>
      </div>

      <Drawer
        title="Menú"
        placement="right"
        onClose={() => setIsMobileMenuOpen(false)}
        visible={isMobileMenuOpen}
        width={250}
      >
        {mobileMenuContent}
      </Drawer>

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