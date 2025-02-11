import React, { useState, useRef } from 'react';
import {
  Plus,
} from 'lucide-react';
import {
  BellOutlined,
  MailOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import {
  Input,
  Badge,
  Tooltip,
  Dropdown,
  Menu
} from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../Context/SocketContext';
import { useAuth } from '../Context/AuthProvider';
import NotificationModal from '../communication/components/NotificationModal';
import PlusModal from "../MoneyManager/transactions/PlusModal";
const Header = ({ unreadEmailsCount }) => {
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
    <div className="fixed top-0 left-0 w-full bg-white shadow-sm z-50 h-11 flex items-center px-4">
      <div className="w-full flex items-center justify-between">
        <Link to="/index">
          <img
            src="https://res.cloudinary.com/djbe9agfz/image/upload/v1726013391/LOGO_i1vjvs.png"
            alt="Logo Lanet"
            className="h-6 rounded-full"
          />
        </Link>
        <div className="flex items-center space-x-3">

          <PlusModal
            isOpen={isPlusModalOpen}
            onClose={closePlusModal}
            buttonPosition={buttonPosition}
          />
          <Input.Search
            placeholder="Search..."
            allowClear
            enterButton
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 180 }}
            className="hidden md:block"
          />

          <button
            ref={createButtonRef}
            onClick={openPlusModal}
            className="px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Crear</span>
          </button>
          <Tooltip title="Notifications">
            <Badge count={notifications.length} size="small">
              <BellOutlined
                className="text-lg cursor-pointer"
                onClick={() => setShowNotificationModal(true)}
              />
            </Badge>
          </Tooltip>
          <Tooltip title="Calendar">
            <CalendarOutlined
              className="text-lg cursor-pointer"
              onClick={() => navigate('/index/calendar')}
            />
          </Tooltip>
          <Dropdown overlay={menu} trigger={['click']}>
            <SettingOutlined className="text-lg cursor-pointer" />
          </Dropdown>
        </div>
      </div>

      <NotificationModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={notifications}
      />
    </div>
  );
};

export default Header;