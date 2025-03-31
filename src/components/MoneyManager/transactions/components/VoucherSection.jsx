import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Spin, message, Upload, Card, Button } from 'antd';
import { InboxOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { uploadImage } from '../../../../services/apiService';

const VoucherSection = ({ onVoucherChange, initialVouchers = [], entryId, type = 'income' }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [hasFetched, setHasFetched] = useState(false);

    const apiEndpoint = type === 'expense' ? 'expenses' : 'incomes';
    const apiBaseUrl = import.meta.env.VITE_API_FINANZAS;

    const normalizeVouchers = (vouchers) => {
        if (Array.isArray(vouchers)) return vouchers;
        if (typeof vouchers === 'string') {
            try {
                const parsed = JSON.parse(vouchers);
                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.error('Error parsing vouchers:', error);
                return [];
            }
        }
        return [];
    };

    const normalizedInitialVouchers = useMemo(() => {
        return Array.isArray(initialVouchers) ? initialVouchers : normalizeVouchers(initialVouchers);
    }, [initialVouchers]);

    useEffect(() => {
        const fetchVouchers = async () => {
            if (!entryId) {
                setImageUrls(normalizedInitialVouchers);
                return;
            }
            if (hasFetched) return;

            try {
                const response = await fetch(`${apiBaseUrl}/${apiEndpoint}/${entryId}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                const vouchers = normalizeVouchers(data.voucher || []);
                setImageUrls(vouchers);
                setHasFetched(true);
            } catch (error) {
                console.error(`Error fetching ${type} vouchers:`, error);
                message.error('No se pudieron cargar los comprobantes');
                setImageUrls(normalizedInitialVouchers);
            }
        };
        fetchVouchers();
    }, [entryId, normalizedInitialVouchers, apiEndpoint]);

    useEffect(() => {
        if (onVoucherChange) {
            onVoucherChange(JSON.stringify(imageUrls));
        }
    }, [imageUrls, onVoucherChange]);

    const updateVouchersOnServer = async (action, vouchers) => {
        try {
            const response = await fetch(`${apiBaseUrl}/${apiEndpoint}/${entryId}/vouchers`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action, vouchers }),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const updatedVouchers = normalizeVouchers(data.data.voucher);
            setImageUrls(updatedVouchers);
            return updatedVouchers;
        } catch (error) {
            console.error('Error updating vouchers:', error);
            message.error('Error al actualizar los comprobantes');
            throw error;
        }
    };

    const handleImageUpload = async (files) => {
        if (files.length === 0 || isUploading) return;
        setIsUploading(true);

        const newFiles = files.filter(file => !imageUrls.some(url => url.includes(file.name)));
        if (newFiles.length === 0) {
            message.info('Las imágenes ya han sido subidas');
            setIsUploading(false);
            return;
        }

        try {
            const uploadPromises = newFiles.map(file => uploadImage(file));
            const uploadedUrls = await Promise.all(uploadPromises);
            const newUrls = uploadedUrls.filter(url => !imageUrls.includes(url));
            if (newUrls.length > 0) {
                await updateVouchersOnServer('add', newUrls);
                message.success('Comprobantes agregados correctamente');
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            message.error('Error al subir los comprobantes');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteVoucher = async (indexToDelete) => {
        const urlToDelete = imageUrls[indexToDelete];
        try {
            await updateVouchersOnServer('remove', [urlToDelete]);
            message.success('Comprobante eliminado');
        } catch (error) {
            // Error ya manejado en updateVouchersOnServer
        }
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            const isPDF = file.type === 'application/pdf';
            if (!isImage && !isPDF) {
                message.error('Solo se permiten archivos de imagen o PDF');
                return false;
            }
            return true;
        },
        onChange: (info) => {
            const { fileList } = info;
            const files = fileList.map(file => file.originFileObj);
            handleImageUpload(files);
        },
        showUploadList: false,
    };

    const renderFilePreview = (url) => {
        const isImage = /\.(jpg|png|gif)$/i.test(url);
        const isPDF = url.endsWith('.pdf');
        return (
            <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                {isImage ? (
                    <img src={url} alt="Comprobante" className="w-full h-full object-cover" />
                ) : isPDF ? (
                    <iframe src={url} title="Vista previa PDF" className="w-full h-full border-0" />
                ) : null}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center gap-4 opacity-0 hover:opacity-100">
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setCurrentImage(url);
                            setIsImageModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    />
                    {isEditMode && (
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteVoucher(imageUrls.indexOf(url))}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        />
                    )}
                </div>
            </div>
        );
    };

    const { Dragger } = Upload;

    return (
        <Card
            title={<span className="text-lg font-semibold text-gray-800">Comprobantes</span>}
            className="mt-6 shadow-lg rounded-xl border border-gray-200"
            extra={
                <Button
                    type={isEditMode ? "default" : "primary"}
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`px-4 py-1 rounded-md transition-all ${isEditMode ? 'border-gray-300 text-gray-700 hover:border-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    {isEditMode ? 'Finalizar Edición' : 'Editar Comprobantes'}
                </Button>
            }
        >
            {isEditMode && (
                <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <Dragger
                        {...uploadProps}
                        className="border-dashed border-2 border-gray-300 hover:border-blue-400 bg-white rounded-lg transition-all"
                    >
                        <p className="text-4xl text-gray-400"><InboxOutlined /></p>
                        <p className="text-gray-700 font-medium">Haz clic o arrastra archivos aquí para subirlos</p>
                        <p className="text-gray-500 text-sm">Soporta: JPG, PNG, GIF, PDF</p>
                    </Dragger>
                    {isUploading && (
                        <div className="flex items-center justify-center gap-2 py-4 text-gray-600">
                            <Spin />
                            <span>Subiendo comprobantes...</span>
                        </div>
                    )}
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        onClick={() => document.querySelector('.ant-upload input').click()}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Seleccionar Archivos
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                {imageUrls.length > 0 ? (
                    imageUrls.map((url, index) => (
                        <div key={index} className="group">
                            {renderFilePreview(url)}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                        <p className="text-lg">No hay comprobantes adjuntos</p>
                        {isEditMode && (
                            <p className="text-sm text-gray-400">Sube un archivo para comenzar</p>
                        )}
                    </div>
                )}
            </div>

            <Modal
                open={isImageModalOpen}
                onCancel={() => setIsImageModalOpen(false)}
                footer={null}
                width="80%"
                style={{ maxWidth: '1200px' }}
                bodyStyle={{ padding: 0, height: '80vh' }}
                centered
                className="rounded-lg shadow-2xl"
            >
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    {currentImage?.endsWith('.pdf') ? (
                        <iframe src={currentImage} title="Vista previa PDF" className="w-full h-full border-0" />
                    ) : (
                        <img src={currentImage} alt="Comprobante" className="max-w-full max-h-full object-contain" />
                    )}
                </div>
            </Modal>
        </Card>
    );
};

export default VoucherSection;