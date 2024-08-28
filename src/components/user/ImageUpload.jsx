import React, { useState, useRef } from 'react';
import { uploadImage, updateUserInfo } from '../../services/apiService';

const ImageUploader = ({ userId, userInfo, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null); // Usar referencia para el input de archivo

    // Manejar la selección de la imagen
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // Subir la imagen al backend y actualizar la información del usuario
    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        try {
            // Subir la imagen
            const imageUrl = await uploadImage(selectedFile);
            console.log("URL de la imagen subida:", imageUrl);

            // Actualizar la información del usuario con la nueva URL de la imagen
            const updatedUserInfo = { ...userInfo, profilepictureurl: imageUrl };
            await updateUserInfo(userId, updatedUserInfo);

            // Notificar al componente padre con la nueva URL de la imagen
            onUploadSuccess(imageUrl);

            // Limpiar el archivo seleccionado después de subir
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error al subir la imagen y actualizar la información del usuario:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Input para seleccionar la imagen */}
            <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                aria-label="Seleccionar imagen para subir"
            />

            {/* Botón para seleccionar la imagen */}
            {!isUploading && !selectedFile && (
                <button
                    onClick={() => fileInputRef.current.click()}
                    className="mt-4 px-4 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none transition duration-200"
                    aria-label="Seleccionar imagen"
                >
                    Actualizar Imagen
                </button>
            )}

            {/* Botón para subir la imagen después de seleccionarla */}
            {selectedFile && (
                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`mt-4 px-4 py-2 rounded-full text-white font-semibold focus:outline-none transition duration-200 ${isUploading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    aria-label="Subir imagen seleccionada"
                >
                    {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                </button>
            )}
        </div>
    );
};

export default ImageUploader;
