import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from "lucide-react";

const UserProfileHeader = ({ name, profilePictureUrl, onToggle }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-4">
                <span className="text-xl font-semibold text-gray-800">Lanet</span>
                <button
                    onClick={onToggle}
                    className="p-1 text-gray-600 rounded-md lg:hidden hover:bg-gray-100"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="hidden lg:flex items-center ml-auto">
                    <div className="relative">
                        <button
                            className="flex items-center text-sm text-gray-700 focus:outline-none"
                            onClick={handleDropdownToggle}
                        >
                            <span className="mr-2">{name}</span>
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
            {isDropdownOpen && (
                <div className="px-4 py-2 bg-gray-100">
                    <div className="flex items-center">
                        <img
                            src={profilePictureUrl}
                            alt={`${name}'s profile`}
                            className="w-12 h-12 rounded-full mr-4"
                        />
                        <div>
                            <p className="text-sm font-semibold text-gray-700">{name}</p>
                            <p className="text-sm text-gray-500">Email: user@example.com</p>
                            <p className="text-sm text-gray-500">Role: Admin</p>
                        </div>
                    </div>
                    {/* Aquí puedes añadir más información del usuario */}
                </div>
            )}
        </div>
    );
};

export default UserProfileHeader;
