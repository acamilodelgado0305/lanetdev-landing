import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useAuth } from '../../components/Context/AuthProvider';
import ImageUploader from './ImageUpload';

const UserProfileHeader = ({ onToggle }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [profilePictureUrl, setProfilePictureUrl] = useState(null); // Estado para la URL de la imagen
    const { user } = useAuth();
    const userName = user ? user.username : 'Loading...';

    const defaultProfilePictureUrl = user?.profilepictureurl || 'https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg';

    // Función que se ejecuta cuando la imagen se carga con éxito
    const handleUploadSuccess = (url) => {
        setProfilePictureUrl(url); // Actualiza la URL de la imagen
        console.log('Image uploaded successfully:', url);
    };

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4">
                <img
                    src="https://res.cloudinary.com/djbe9agfz/image/upload/v1726013391/LOGO_i1vjvs.png"
                    alt="Logo Lanet"
                    className="ml-4 h-10 rounded-full"
                />
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
                            <span className="ml-2 mr-2">{userName}</span>
                            {isDropdownOpen ? (
                                <ChevronUp className="w-4 h-4" />
                            ) : (
                                <ChevronDown className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Información del usuario que se despliega debajo del nombre */}
            {isDropdownOpen && user && (
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
                    <div>
                        <ImageUploader
                            userId={user.id}
                            userInfo={user}
                            onUploadSuccess={handleUploadSuccess}
                        />
                    </div>

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
                            <span className="font-bold text-white">Role:</span> Admin
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfileHeader;
