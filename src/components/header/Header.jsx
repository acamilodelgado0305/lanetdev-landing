import React, { useState } from 'react';
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

const Header = ({ unreadEmailsCount }) => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { notifications } = useSocket();
  const { logout } = useAuth();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/index/search?query=${searchTerm}`);
      setSearchTerm('');
    }
  };

  const handleMenuClick = ({ key }) => {
    switch(key) {
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