import React, { useState, useEffect } from 'react';
import { X } from "lucide-react";
import { useAuth } from '../../components/Context/AuthProvider';
import { Link } from 'react-router-dom';

const UserProfileHeader = ({ onToggle }) => {
    const { user, userRole } = useAuth();
    const [profilePictureUrl, setProfilePictureUrl] = useState(null); // Estado para la URL de la imagen
    const userName = user ? user.username : 'Loading...';

    // Definir la URL predeterminada de la imagen de perfil fuera del estado
    const defaultProfilePictureUrl = 'https://res.cloudinary.com/dybws2ubw/image/upload/v1725210316/avatar-image_jouu10.jpg';

    // Verifica si user y profilepictureurl están disponibles antes de actualizar el estado
    useEffect(() => {
        if (user) {
            setProfilePictureUrl(user.profilepictureurl || defaultProfilePictureUrl); // Si no hay imagen de perfil, usar la predeterminada
        }
    }, [user]); // Solo se ejecuta cuando `user` cambia

    return (
        <div className="">
            <div className="flex items-center h-16 mt-20 mb-8">

                <button
                    onClick={onToggle}
                    className="p-1 text-gray-600 rounded-md lg:hidden hover:bg-gray-100"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="hidden lg:flex items-center mx-auto">
                    <div className="relative">
                        {/* Envolvemos toda la sección del perfil con Link */}
                        <Link to="/index/config" className="flex flex-col items-center">
                            {/* Imagen de perfil clickeable */}
                            <img
                                src={profilePictureUrl || defaultProfilePictureUrl}  // Usa la URL de la imagen o la predeterminada
                                alt={`${userName}'s profile`}
                                className="w-16 h-16 rounded-full mb-2 cursor-pointer"
                            />

                            {/* Nombre de usuario */}
                            <span className="text-sm font-semibold">{userName}</span>

                            {/* Role */}
                            <p className="text-xs text-gray-300">
                                <span className="font-bold text-white">Role:</span> {userRole || 'Cargando...'}
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileHeader;
