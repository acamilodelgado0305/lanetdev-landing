import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Phone, Mail, MessageCircle, MoreHorizontal } from "lucide-react";
import { CiSettings } from "react-icons/ci";

const NavLink = ({ to, icon: Icon, children }) => (
    <Link
        to={to}
        className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
    >
        <Icon className="w-5 h-5 mr-2 text-gray-500" />
        <span>{children}</span>
    </Link>
);

const Indexcomunicacion = () => {
    const [name, setName] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const logout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            navigate("/");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/auth/user`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    }
                );
                if (response.ok) {
                    const { name } = await response.json();
                    setName(name);
                } else {
                    console.error("Error al obtener el nombre del usuario");
                }
            } catch (error) {
                console.error("Error en la solicitud:", error);
            }
        };
        fetchUserName();
    }, []);

    useEffect(() => {
        // Redirigir automáticamente a la ruta de WhatsApp cuando se monte el componente
        navigate("/index/communication/emails");
    }, [navigate]);

    return (
        <div className="flex flex-col  bg-gray-100">
            {/* Header with navigation */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto  sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-semibold text-gray-800">
                                Communication Manager
                            </span>
                        </div>
                        <nav className="aling-center justify-center hidden md:flex space-x-4">
                            {/* Rutas de comunicación */}
                            <NavLink to="/index/communication/emails" icon={Mail}>
                                Email
                            </NavLink>
                            <NavLink to="/index/communication/WhatsAppWeb" icon={Phone}>
                                WhatsApp
                            </NavLink>
                            <NavLink to="/index/communication/sms" icon={MessageCircle}>
                                SMS
                            </NavLink>
                            <NavLink to="/index/communication/settings" icon={CiSettings}>
                                Configuración
                            </NavLink>
                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <MoreHorizontal className="w-5 h-5 mr-2 text-gray-500" />
                                    <span>Más</span>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                                        <NavLink to="/index/communication/WhatsAppWeb" icon={Phone}>
                                            Opciones
                                        </NavLink>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>

                </div>
                {/* Mobile menu */}
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink to="/index/communication/WhatsAppWeb" icon={Phone}>
                            WhatsApp
                        </NavLink>
                        <NavLink to="/index/communication/emails" icon={Mail}>
                            Email
                        </NavLink>
                        <NavLink to="/index/communication/sms" icon={MessageCircle}>
                            SMS
                        </NavLink>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                <div className="-w-full py-4">
                    {/* El componente Outlet renderizará el contenido de la ruta hija activa */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Indexcomunicacion;
