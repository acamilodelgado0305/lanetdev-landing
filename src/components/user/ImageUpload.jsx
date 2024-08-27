import React, { useState } from 'react';
import axios from 'axios';

const ImageUploader = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Manejar la selección de la imagen
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file); // Guardar el archivo seleccionado
        }
    };

    // Subir la imagen al backend
    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await axios.post('http://localhost:3000/api/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const imageUrl = response.data.url; // Obtener la URL de la imagen subida
            onUploadSuccess(imageUrl); // Notificar al componente padre con la nueva URL
        } catch (error) {
            console.error('Error al subir la imagen:', error);
        } finally {
            setIsUploading(false);
            setSelectedFile(null); // Limpiar el archivo seleccionado después de subir
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* Input para seleccionar la imagen */}
            <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
            />

            {/* Botón para seleccionar la imagen */}
            {!isUploading && !selectedFile && (
                <button
                    onClick={() => document.getElementById('file-input').click()}
                    className="mt-4 px-4 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none transition duration-200"
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
                >
                    {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                </button>
            )}
        </div>
    );
};

export default ImageUploader;
