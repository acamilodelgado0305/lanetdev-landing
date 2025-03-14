import React, { useState, useEffect } from 'react';
import { Modal, Spin, message, Upload, Card } from 'antd';
import { ArrowLeftOutlined, InboxOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { uploadImage } from '../../../../../services/apiService';

const ExpenseVoucherSection = ({ onVoucherChange, initialVouchers = [], entryId }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrls, setImageUrls] = useState(Array.isArray(initialVouchers) ? initialVouchers : []);

    // Función auxiliar para normalizar los datos de voucher y asegurar que sea un array
    const normalizeVouchers = (vouchers) => {
        if (Array.isArray(vouchers)) return vouchers;
        if (typeof vouchers === 'string') {
            try {
                const parsed = JSON.parse(vouchers);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.error('Error al parsear vouchers:', error);
                return [];
            }
        }
        return [];
    };

    useEffect(() => {
        const fetchVouchers = async () => {
            if (!entryId) {
                // Si no hay entryId, usa los initialVouchers normalizados
                setImageUrls(normalizeVouchers(initialVouchers));
                return;
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_FINANZAS}/expenses/${entryId}/vouchers`);
                if (!response.ok) {
                    throw new Error('Error al obtener los comprobantes');
                }
                const data = await response.json();
                // Normalizar los vouchers recibidos del servidor
                const normalizedVouchers = normalizeVouchers(data.vouchers);
                setImageUrls(normalizedVouchers);
            } catch (error) {
                console.error('Error al obtener los comprobantes:', error);
                message.error('No se pudieron cargar los comprobantes');
                setImageUrls([]); // En caso de error, establecer un array vacío
            }
        };

        fetchVouchers();
    }, [entryId, initialVouchers]);

    // Efecto para notificar al padre cuando cambian las imágenes
    useEffect(() => {
        if (onVoucherChange) {
            onVoucherChange(imageUrls); // Enviar el array directamente, no como string
        }
    }, [imageUrls, onVoucherChange]);

    const handleImageUpload = async (files) => {
        if (files.length === 0 || isUploading) return;  // Evitar que se dispare si ya está en proceso de carga
        setIsUploading(true);  // Marcar como cargando

        // Filtrar archivos que ya están en imageUrls para no subirlos de nuevo
        const newFiles = files.filter(file => {
            const fileName = file.name;
            return !imageUrls.some(url => url.includes(fileName));  // Verifica si ya existe el archivo en imageUrls
        });

        if (newFiles.length === 0) {
            message.info('Las imágenes ya han sido subidas');  // Si no hay archivos nuevos, mostrar un mensaje
            setIsUploading(false);
            return;
        }

        try {
            const uploadPromises = newFiles.map(file => uploadImage(file)); // Subir solo los archivos nuevos
            const uploadedUrls = await Promise.all(uploadPromises);

            // Filtrar las URLs duplicadas antes de agregar
            const newUrls = uploadedUrls.filter(url => !imageUrls.includes(url));

            if (newUrls.length > 0) {
                setImageUrls(prev => [...prev, ...newUrls]);  // Agregar solo las URLs no duplicadas
                message.success('Comprobantes agregados correctamente');
            }
        } catch (error) {
            console.error('Error al subir imágenes:', error);
            message.error('Error al subir los comprobantes');
        } finally {
            setIsUploading(false);  // Marcar como no cargando
        }
    };

    const handleDeleteVoucher = (indexToDelete) => {
        setImageUrls(prev => prev.filter((_, index) => index !== indexToDelete));
        message.success('Comprobante eliminado');
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            const isPDF = file.type === 'application/pdf';
            if (!isImage && !isPDF) {
                message.error('Solo se permiten archivos de imagen o PDF');
                return false;  // No permitir archivos no válidos
            }
            return true;
        },
        onChange: (info) => {
            const { fileList } = info;
            const files = fileList.map(file => file.originFileObj);  // Obtener solo los archivos
            handleImageUpload(files);  // Subir los archivos solo si no hay carga en proceso
        },
        showUploadList: false,  // No mostrar la lista de archivos subidos
    };

    const renderFilePreview = (url) => {
        const isImage = url.startsWith('http') && (url.includes('.jpg') || url.includes('.png') || url.includes('.gif'));
        const isPDF = url.endsWith('.pdf');
        if (isImage) {
            return <img src={url} alt="Comprobante" className="w-full h-32 object-cover rounded-lg shadow-sm" />;
        }
        if (isPDF) {
            return (
                <iframe
                    src={url}
                    title="Vista previa PDF"
                    className="w-full h-32 border rounded-lg"
                />
            );
        }
        return null;
    };

    const { Dragger } = Upload;

    return (
        <Card
            title="Comprobantes"
            className="mt-4"
            extra={
                <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                    {isEditMode ? 'Finalizar edición' : 'Editar comprobantes'}
                </button>
            }
        >
            {isEditMode ? (
                <div className="space-y-4">
                    <Dragger {...uploadProps} className="bg-gray-50 hover:bg-gray-100 transition-colors">
                        <p className="text-4xl">
                            <InboxOutlined />
                        </p>
                        <p className="text-gray-600">
                            Haz clic o arrastra archivos aquí para subirlos
                        </p>
                        <p className="text-gray-400 text-sm">
                            Soporta: JPG, PNG, GIF, PDF
                        </p>
                    </Dragger>

                    {isUploading && (
                        <div className="flex items-center justify-center gap-2 py-2">
                            <Spin />
                            <span className="text-gray-600">Subiendo comprobantes...</span>
                        </div>
                    )}
                </div>
            ) : null}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {Array.isArray(imageUrls) && imageUrls.length > 0 ? (
                    imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                            {renderFilePreview(url)}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={() => {
                                        setCurrentImage(url);
                                        setIsImageModalOpen(true);
                                    }}
                                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                                >
                                    <EyeOutlined className="text-gray-700" />
                                </button>
                                {isEditMode && (
                                    <button
                                        onClick={() => handleDeleteVoucher(index)}
                                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                                    >
                                        <DeleteOutlined className="text-red-600" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 col-span-full">
                        No hay comprobantes adjuntos
                    </div>
                )}
            </div>

            <Modal
                open={isImageModalOpen}
                onCancel={() => setIsImageModalOpen(false)}
                footer={null}
                width={400}
                centered
            >
                {currentImage && currentImage.endsWith('.pdf') ? (
                    <iframe
                        src={currentImage}
                        title="Vista previa PDF"
                        className="w-full h-96 border-0 bg-white"
                    />
                ) : (
                    <img
                        src={currentImage}
                        alt="Comprobante"
                        className="w-full h-auto rounded-lg"
                    />
                )}
            </Modal>
        </Card>
    );
};

export default ExpenseVoucherSection;