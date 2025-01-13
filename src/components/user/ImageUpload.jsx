import React, { useState, useRef } from 'react';
import { Spin } from 'antd'; // Importar el spinner de Ant Design
import { uploadImage, updateProfilePicture } from '../../services/apiService';

const ImageUploader = ({ userId, authToken, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Manejar selección de archivo
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // Manejar la subida de imagen
    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        try {
            const imageUrl = await uploadImage(selectedFile); // Subir la imagen
            console.log("URL de la imagen subida:", imageUrl);

            // Actualizar la URL en el backend
            await updateProfilePicture(userId, imageUrl, authToken);

            // Notificar al componente padre
            onUploadSuccess(imageUrl);

            // Limpiar selección
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error al subir la imagen:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Input oculto para seleccionar archivo */}
            <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
            />

            {/* Botón de "Actualizar Imagen" */}
            {!selectedFile && !isUploading && (
                <button
                    onClick={() => fileInputRef.current.click()}
                    className="px-4 py-2 rounded-full bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700 transition duration-200"
                >
                    Actualizar Imagen
                </button>
            )}

            {/* Spinner mientras se sube */}
            {isUploading && (
                <div className="mt-4">
                    <Spin size="large" tip="Subiendo..." />
                </div>
            )}

            {/* Botón para subir la imagen seleccionada */}
            {selectedFile && !isUploading && (
                <button
                    onClick={handleUpload}
                    className="mt-4 px-4 py-2 rounded-full bg-green-600 text-white font-bold shadow-md hover:bg-green-700 transition duration-200"
                >
                    Subir Imagen
                </button>
            )}
        </div>
    );
};

export default ImageUploader;
