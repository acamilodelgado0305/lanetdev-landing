import React, { useState } from 'react';
import axios from 'axios';

const defaultImage = 'https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg'; // URL de la imagen por defecto

const ImageUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false); // Estado para manejar la carga
    const [error, setError] = useState(null); // Estado para manejar errores

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        setLoading(true); // Empieza a cargar
        setError(null); // Limpia errores anteriores

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('http://localhost:3000/api/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onUploadSuccess(response.data.url); // Llama a la función de éxito para actualizar la imagen en UserProfileHeader
            alert('Image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Error uploading image');
        } finally {
            setLoading(false); // Termina la carga
        }
    };

    return (
        <div className="flex flex-col items-center space-y-2">
            <button
                onClick={() => document.getElementById('file-upload').click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                disabled={loading}
            >
                {loading ? 'Uploading...' : 'Subir Imagen'}
            </button>
            <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
            />
            {file && <p className="text-sm text-gray-600">{file.name}</p>}
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
};

export default ImageUpload;
