import React, { useState, useRef } from 'react';
import { BsFillBellFill, BsEnvelopeFill, BsCalendarFill, BsGearFill } from 'react-icons/bs';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Header() {
    const [startDate, setStartDate] = useState(new Date());
    const [notifications, setNotifications] = useState(3);
    const [emails, setEmails] = useState(5);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

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

    return (
        <div className="flex items-center justify-between w-full bg-primary p-4 shadow-md">
            <input
                type="text"
                placeholder="Buscar..."
                className="border rounded-md p-2 w-1/3 mx-8"
            />

            <div className="flex space-x-6 text-white items-center relative">
                {/* Icono de notificaciones con contador */}
                <div className="relative">
                    <BsFillBellFill className="text-2xl cursor-pointer hover:text-gray-800" />
                    {notifications > 0 && (
                        <span className="absolute -top-4 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {notifications}
                        </span>
                    )}
                </div>

                {/* Icono de correos con contador */}
                <div className="relative">
                    <BsEnvelopeFill className="text-2xl cursor-pointer hover:text-gray-800" />
                    {emails > 0 && (
                        <span className="absolute -top-4 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                            {emails}
                        </span>
                    )}
                </div>

                {/* Icono del calendario */}
                <div className="relative">
                    <BsCalendarFill
                        className="text-2xl cursor-pointer hover:text-gray-800"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                    />
                    {showDatePicker && (
                        <div ref={datePickerRef} className="absolute top-8 right-0 z-10">
                            <ReactDatePicker
                                selected={startDate}
                                onChange={(date) => {
                                    setStartDate(date);
                                    setShowDatePicker(false); // Ocultar el DatePicker después de seleccionar una fecha
                                }}
                                inline
                                className="bg-white p-2 shadow-md rounded"
                            />
                        </div>
                    )}
                </div>

                <BsGearFill className="text-2xl cursor-pointer hover:text-gray-800" />
            </div>
        </div>
    );
}
