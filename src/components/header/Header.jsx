import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import {
  BellOutlined,
  MailOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import {
  Input,
  Badge,
  Tooltip,
  Dropdown,
  Menu,
  Button,
  Space
} from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../Context/SocketContext';
import { useAuth } from '../Context/AuthProvider';
import NotificationModal from '../communication/components/NotificationModal';
import PlusModal from "../MoneyManager/transactions/PlusModal";

import picture from '../../images/F.png';


const Header = ({ }) => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { notifications } = useSocket();
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  return (
    <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50 h-14 flex items-center px-4">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center space-x-4">

          <Link to="/index" className="flex items-center space-x-2">
            <img
              src={picture}
              alt="Logo"
              className="h-8"
            />
            <span className="text-[#44546f] text-lg font-medium">Ispsuite</span>
          </Link>
        </div>

        <div className="flex items-center w-[65%] justify-between">
          <div className='flex items-center '>
            <Input.Search
              placeholder="Buscar"
              allowClear
              onSearch={handleSearch}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: 400,
                maxWidth: '100%'
              }}
              className="hidden md:block mr-2"
            />


            <Button
              ref={createButtonRef}
              onClick={openPlusModal}
              type="primary"
              className="flex items-center"
              style={{
                backgroundColor: '#0052CC',
                height: '40px', // Aumentamos la altura del botón para acomodar el texto más grande
                borderRadius: '3px',
                padding: '0 10px', // Ajustamos el padding para dar más espacio
                fontSize: '20px', // Tamaño de fuente más grande para el texto "Crear"
                fontWeight: 'bold', // Opcional: Agregamos negrita para mayor énfasis
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Plus className="w-6 h-6 mr-2" /> {/* Aumentamos el tamaño del ícono */}
              Crear
            </Button>

          </div>


          <Space size="middle">
            <Tooltip title="Notificaciones">
              <Badge count={notifications.length} size="small">
                <BellOutlined className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-2 rounded" />
              </Badge>
            </Tooltip>

            <Tooltip title="Ayuda">
              <QuestionCircleOutlined className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-2 rounded" />
            </Tooltip>

            <Tooltip title="Configuración">
              <Dropdown overlay={menu} trigger={['click']}>
                <SettingOutlined className="text-[#44546f] text-xl cursor-pointer hover:bg-[#091e420f] p-2 rounded" />
              </Dropdown>
            </Tooltip>

            <Tooltip title="Perfil">
              <div className="w-8 h-8 rounded-full bg-[#0052CC] flex items-center justify-center cursor-pointer">
                <span className="text-white text-sm">US</span>
              </div>
            </Tooltip>
          </Space>
        </div>
      </div>

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