import React, { useState, useRef } from 'react';
import { uploadImage, updateProfilePicture } from '../../services/apiService';

const ImageUploader = ({ userId, authToken, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        try {
            const imageUrl = await uploadImage(selectedFile); // Subir la imagen
            console.log("URL de la imagen subida:", imageUrl);

            // Llamar al backend para actualizar la URL de la imagen
            await updateProfilePicture(userId, imageUrl, authToken);

            onUploadSuccess(imageUrl); // Notificar al padre

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
            <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
            />
            {!isUploading && !selectedFile && (
                <button
                    onClick={() => fileInputRef.current.click()}
                    className="btn btn-primary"
                >
                    Actualizar Imagen
                </button>
            )}
            {selectedFile && (
                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="btn btn-secondary"
                >
                    {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                </button>
            )}
        </div>
    );
};
export default ImageUploader;
