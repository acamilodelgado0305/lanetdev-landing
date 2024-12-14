import React, { useState, useEffect } from 'react';
import { Modal, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { uploadImage } from '../../../../services/apiService';

const ExpenseVoucherSection = ({ entry, entryId }) => {
    const [isEditVoucherMode, setIsEditVoucherMode] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [tempImageUrls, setTempImageUrls] = useState([]);
    const [vouchers, setVouchers] = useState([]);

    const API_URL =  import.meta.env.VITE_API_FINANZAS;

    useEffect(() => {
        if (entryId) {
            fetchVouchers();
        }
    }, [entryId]);

    const fetchVouchers = async () => {
        try {
            const response = await axios.get(`${API_URL}/expenses/${entryId}/vouchers`);
            if (response.data.vouchers) {
                setVouchers(response.data.vouchers);
            }
        } catch (error) {
            console.error('Error al obtener comprobantes:', error);
            message.error('Error al cargar los comprobantes');
        }
    };

    const openImageModal = (imageUrl) => {
        setCurrentImage(imageUrl);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setCurrentImage(null);
        setIsImageModalOpen(false);
    };

    const handleGoBack = () => {
        setIsEditVoucherMode(false);
        setTempImageUrls([]);
    };

    const updateVouchers = async ({ id, action, vouchers }) => {
        try {
            const response = await axios.patch(
                `${API_URL}/expenses/${id}/vouchers`,
                {
                    id,
                    action,
                    vouchers
                }
            );

            if (response.status === 200) {
                return true;
            } else {
                console.error('Respuesta inesperada de la API:', response.data);
                message.error('No se pudo actualizar los comprobantes');
                return false;
            }
        } catch (error) {
            console.error('Error al actualizar comprobantes:', error.response || error.message);
            message.error('Error al actualizar los comprobantes');
            return false;
        }
    };

    const handleImageSelection = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            const tempUrls = files.map(file => URL.createObjectURL(file));
            setTempImageUrls(prevUrls => [...prevUrls, ...tempUrls]);

            const uploadPromises = files.map(file => uploadImage(file));
            const uploadedUrls = await Promise.all(uploadPromises);

            const result = await updateVouchers({
                id: entryId,
                action: "add",
                vouchers: uploadedUrls
            });

            if (result) {
                message.success('Comprobantes agregados correctamente');
                tempUrls.forEach(URL.revokeObjectURL);
                setTempImageUrls([]);
                await fetchVouchers();
            }
        } catch (error) {
            console.error('Error al subir imágenes:', error);
            message.error('Error al subir los comprobantes');
            setTempImageUrls(prevUrls => {
                prevUrls.forEach(URL.revokeObjectURL);
                return [];
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteVoucher = async (voucherUrl) => {
        try {
            const result = await updateVouchers({
                id: entryId,
                action: "remove",
                vouchers: [voucherUrl]
            });

            if (result) {
                message.success('Comprobante eliminado correctamente');
                await fetchVouchers();
            }
        } catch (error) {
            console.error('Error al eliminar comprobante:', error.response || error.message);
            message.error('Error al eliminar el comprobante');
        }
    };

    // Combinamos los comprobantes del estado con los temporales
    const allVouchers = [
        ...(Array.isArray(vouchers) ? vouchers : []),
        ...tempImageUrls
    ];

    return (
        <div className="space-y-4 border border-gray-300 p-4 rounded-lg">
            {!isEditVoucherMode ? (
                <>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-500">Comprobantes</p>
                        <button
                            onClick={() => setIsEditVoucherMode(true)}
                            className="text-sm text-gray-500 !important btn btn-sm btn-outline btn-primary"
                        >
                            Editar comprobantes
                        </button>

                    </div>


                    <div className="flex flex-wrap gap-2">
                        {allVouchers.length > 0 ? (
                            allVouchers.map((voucherUrl, index) => (
                                <div key={index} className="relative w-24 h-24 group">
                                    <img
                                        src={voucherUrl}
                                        alt={`Comprobante ${index + 1}`}
                                        className="w-full h-full object-cover border rounded-md cursor-pointer"
                                        onClick={() => openImageModal(voucherUrl)}
                                    />
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">Sin comprobantes</p>
                        )}
                    </div>
                </>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handleGoBack}
                            className="flex items-center text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeftOutlined className="mr-1" />
                            <span>Volver</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelection}
                            className="file-input file-input-bordered file-input-sm w-full"
                            disabled={isUploading}
                        />
                    </div>

                    {isUploading && (
                        <div className="flex items-center gap-2">
                            <Spin size="small" />
                            <span className="text-sm">Subiendo comprobantes...</span>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {allVouchers.map((voucherUrl, index) => {
                            const isTemp = tempImageUrls.includes(voucherUrl);
                            return (
                                <div key={`voucher-${index}`} className="relative w-16 h-16 group">
                                    <img
                                        src={voucherUrl}
                                        alt={`Comprobante ${index + 1}`}
                                        className={`w-full h-full object-cover border rounded-md ${isTemp ? 'opacity-70' : ''}`}
                                        onClick={() => !isTemp && openImageModal(voucherUrl)}
                                    />
                                    {!isTemp && (
                                        <button
                                            onClick={() => handleDeleteVoucher(voucherUrl)}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Eliminar comprobante"
                                        >
                                            ✕
                                        </button>
                                    )}
                                    {isTemp && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Spin size="small" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <Modal
                open={isImageModalOpen}
                onCancel={closeImageModal}
                footer={null}
                centered
                width={600}
            >
                {currentImage && (
                    <img
                        src={currentImage}
                        alt="Comprobante ampliado"
                        className="w-full h-auto rounded-md"
                    />
                )}
            </Modal>
        </div>
    );
};

export default ExpenseVoucherSection;