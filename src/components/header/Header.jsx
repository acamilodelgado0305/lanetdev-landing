import React, { useState, useRef } from 'react';
import { BsFillBellFill, BsEnvelopeFill, BsCalendarFill, BsGearFill, BsBoxArrowRight } from 'react-icons/bs';
import ReactDatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';

export default function Header({ unreadEmailsCount }) {  // Recibe unreadEmailsCount como prop
    const [startDate, setStartDate] = useState(new Date());
    const [notifications, setNotifications] = useState(3);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);
    const navigate = useNavigate(); // Inicializa useNavigate

    // Oculta el DatePicker al hacer clic fuera de él
    const handleClickOutside = (event) => {
        if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
            setShowDatePicker(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Función para manejar el clic en el ícono de correos
    const handleEmailClick = () => {
        navigate('/index/emails');
    };

    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        localStorage.removeItem('authToken'); // O cualquier método que uses para la autenticación
        navigate('/login'); // Redirige a la página de inicio de sesión
    };

    return (
        <div className="flex items-center justify-between w-full bg-white p-2 shadow-sm">
            <input
                type="text"
                placeholder="Buscar..."
                className="border rounded-md p-1 w-1/4 text-sm mx-4"
            />

            <div className="flex space-x-4 text-gray-700 items-center relative">
                {/* Icono de notificaciones con contador */}
                <div className="relative">
                    <BsFillBellFill className="text-xl cursor-pointer hover:text-gray-500" />
                    {notifications > 0 && (
                        <span className="absolute -top-3 right-0 inline-flex items-center justify-center px-2 py-1 text-[9px] font-bold leading-none text-red-100 bg-primary rounded-full">
                            {notifications}
                        </span>
                    )}
                </div>

                {/* Icono de correos con contador dinámico */}
                <div className="relative" onClick={handleEmailClick}>
                    <BsEnvelopeFill className="text-xl cursor-pointer hover:text-gray-500" />
                    {unreadEmailsCount > 0 && (
                        <span className="absolute -top-3 right-0 inline-flex items-center justify-center px-2 py-1 text-[9px] font-bold leading-none text-red-100 bg-primary rounded-full">
                            {unreadEmailsCount}
                        </span>
                    )}
                </div>

                {/* Icono del calendario */}
                <div className="relative">
                    <BsCalendarFill
                        className="text-xl cursor-pointer hover:text-gray-500"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                    />
                    {showDatePicker && (
                        <div ref={datePickerRef} className="absolute top-8 right-0 z-10">
                            <ReactDatePicker
                                selected={startDate}
                                onChange={(date) => {
                                    setStartDate(date);
                                    setShowDatePicker(false);
                                }}
                                inline
                                className="bg-white p-2 shadow-md rounded"
                            />
                        </div>
                    )}
                </div>

                {/* Icono de configuración */}
                <BsGearFill className="text-xl cursor-pointer hover:text-gray-500" />

                {/* Botón de cerrar sesión */}
                <div onClick={handleLogout} className="px-6 cursor-pointer flex items-center text-primary hover:text-red-800">
                    <BsBoxArrowRight className="text-xl" />
                    <span className="ml-2 text-sm">Logout</span>
                </div>
            </div>
        </div>
    );
}
