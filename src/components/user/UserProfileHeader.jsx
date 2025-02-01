import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useAuth } from '../../components/Context/AuthProvider';
import ImageUploader from './ImageUpload';

const UserProfileHeader = ({ onToggle, isUserProfileOpen, setIsUserProfileOpen }) => {
    const { user, userRole } = useAuth();
    const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilepictureurl || null); // Estado para la URL de la imagen
    const [isUploading, setIsUploading] = useState(false); // Controla si se está subiendo una imagen
    const userName = user ? user.username : 'Loading...';
    const defaultProfilePictureUrl = 'https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg';

    const dropdownRef = useRef(null); // Ref para detectar clics fuera del menú

    // Función que se ejecuta cuando la imagen se carga con éxito
    const handleUploadSuccess = (url) => {
        setProfilePictureUrl(url); // Actualiza la URL de la imagen
        setIsUploading(false); // Indica que la subida ha finalizado
        console.log('Image uploaded successfully:', url);
    };

    const handleUploadStart = () => {
        setIsUploading(true); // Indica que la subida está en curso
    };

    // Cerrar el menú si se hace clic fuera del área del menú
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !isUploading) {
            setIsUserProfileOpen(false); // Cierra el menú solo si no se está subiendo una imagen
        }
    };

    // Añadir y remover el evento para detectar clics fuera del menú
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUploading]); // Se asegura de que solo cierre cuando no se está subiendo

    const handleDropdownToggle = (e) => {
        e.stopPropagation(); // Evitar que el evento cierre el menú accidentalmente
        setIsUserProfileOpen(!isUserProfileOpen);
    };

    return (
        <div className="border-b border-gray-200" ref={dropdownRef}>
            <div className="flex items-center justify-between h-16 px-4">

                <button
                    onClick={onToggle}
                    className="p-1 text-gray-600 rounded-md lg:hidden hover:bg-gray-100"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="hidden lg:flex items-center ml-auto">
                    <div className="relative">
                        <button
                            className="flex items-center text-sm text-white focus:outline-none"
                            onClick={handleDropdownToggle}
                        >
                            {/* Solo muestra el nombre si el menú está abierto */}
                            {isUserProfileOpen && <span className="ml-2 mr-2">{userName}</span>}
                            {isUserProfileOpen ? (
                                <ChevronUp className="ml-2 w-4 h-4" />
                            ) : (
                                <ChevronDown className="ml-2 w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Información del usuario que se despliega debajo del nombre */}
            {isUserProfileOpen && user && (
                <div className="border-y-2 px-4 py-1 bg-primary text-gray-300">
                    <div className="flex items-center mb-4">
                        <img
                            src={profilePictureUrl || defaultProfilePictureUrl}
                            alt={`${userName}'s profile`}
                            className="w-20 h-20 rounded-full mb-1"
                        />
                        <div className="ml-4 flex flex-col items-start">
                            <p className="text-lg font-semibold text-white">{userName}</p>
                        </div>
                    </div>

                    {/* Componente de carga de imágenes */}
                    {/* <div>
                        <ImageUploader
                            userId={user.id}
                            userInfo={user}
                            onUploadSuccess={handleUploadSuccess} // Manejo correcto de la subida de la imagen
                            onUploadStart={handleUploadStart}    // Inicia la subida
                        />
                    </div> */}

                    <div className="text-gray-300 mt-2">
                        {user.email && (
                            <p className="text-sm">
                                <span className="font-bold text-white">Email:</span> {user.email}
                            </p>
                        )}
                        {user.address && (
                            <p className="text-sm">
                                <span className="font-bold text-white">Address:</span> {user.address}
                            </p>
                        )}
                        {user.phone && (
                            <p className="text-sm">
                                <span className="font-bold text-white">Phone:</span> {user.phone}
                            </p>
                        )}
                        <p className="text-sm">
                            <span className="font-bold text-white">Role:</span> {userRole || 'Cargando...'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfileHeader;
