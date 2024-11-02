import React, { useState, useRef, useEffect } from 'react';
import { BsFillBellFill, BsEnvelopeFill, BsCalendarFill, BsGearFill, BsBoxArrowRight } from 'react-icons/bs';
import { DatePicker } from 'antd';  // Importar el DatePicker de Ant Design
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { useSocket } from '../Context/SocketContext';
import { useAuth } from '../Context/AuthProvider';

import NotificationModal from '../communication/components/NotificationModal';


const Header = ({ unreadEmailsCount }) => {
    const [startDate, setStartDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const datePickerRef = useRef(null);
    const navigate = useNavigate();
    const { notifications } = useSocket();
    const { logout } = useAuth();

    const handleClickOutside = (event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setShowDatePicker(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEmailClick = () => {
        navigate('/index/emails');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/index/search?query=${searchTerm}`);
            setSearchTerm('');
        }
    };

    const handleDateChange = (date) => {
        setStartDate(date);
        setShowDatePicker(false);  // Ocultar el calendario después de seleccionar la fecha
    };

    return (
        <div className="flex items-center justify-between w-full bg-white p-2 shadow-sm">
            <input
                type="text"
                placeholder="Buscar..."
                className="hidden lg:block border rounded-md p-1 w-1/4 text-sm mx-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleSearch();
                    }
                }}
            />
            <div className="flex-grow flex mt-6 justify-end space-x-6 text-gray-700 items-center relative">
                <div className="relative">
                    <BsFillBellFill
                        className="text-xl cursor-pointer hover:text-gray-500"
                        onClick={() => setShowNotificationModal(true)}
                    />
                    {notifications.length > 0 && (
                        <span className="absolute -top-3 right-0 inline-flex items-center justify-center px-2 py-1 text-[9px] font-bold leading-none text-red-100 bg-primary rounded-full">
                            {notifications.length}
                        </span>
                    )}
                </div>
                <div className="relative" onClick={handleEmailClick}>
                    <BsEnvelopeFill className="text-xl cursor-pointer hover:text-gray-500" />
                    {unreadEmailsCount > 0 && (
                        <span className="absolute -top-3 right-0 inline-flex items-center justify-center px-2 py-1 text-[9px] font-bold leading-none text-red-100 bg-primary rounded-full">
                            {unreadEmailsCount}
                        </span>
                    )}
                </div>
                <div className="relative">
                    <BsCalendarFill
                        className="text-xl cursor-pointer hover:text-gray-500"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                    />
                    {showDatePicker && (
                        <div ref={datePickerRef} className="absolute top-8 right-0 z-10">
                            <DatePicker
                                value={startDate}
                                onChange={handleDateChange}
                                open={showDatePicker}  // Controla la visibilidad
                                onOpenChange={(open) => setShowDatePicker(open)}  // Sincroniza el estado cuando se cierra
                                className="bg-white p-4 shadow-md rounded"
                                format="YYYY-MM-DD"  // Ajustar el formato de la fecha
                            />
                        </div>
                    )}
                </div>
                <Link to="/index/config">
                    <BsGearFill className="text-xl cursor-pointer hover:text-gray-500" />
                </Link>
                <div onClick={handleLogout} className="px-6 cursor-pointer flex items-center text-primary hover:text-red-800">
                    <BsBoxArrowRight className="text-xl" />
                    <span className="ml-2 text-sm">Logout</span>
                </div>
            </div>

            {/* Agrega el modal de notificaciones */}
            <NotificationModal
                visible={showNotificationModal}
                onClose={() => setShowNotificationModal(false)}
                notifications={notifications}
            />
        </div>
    );
};

export default Header;
