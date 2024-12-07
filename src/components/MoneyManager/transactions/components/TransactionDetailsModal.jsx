import React, { useState, useEffect } from "react";
import { Button, Modal, Input, message, Space, Spin } from "antd";

import {
    CloseOutlined,
    EditOutlined,
    DeleteOutlined,
    FileTextOutlined,
    ExclamationCircleOutlined,
    SaveOutlined,
} from "@ant-design/icons";

import { getUserById } from "../../../../services/apiService";
import { useAuth } from "../../../Context/AuthProvider";
import axios from "axios";
import { uploadImage } from "../../../../services/apiService";
import VoucherSection from "./VoucherSection";

const TransactionDetailModal = ({
    isOpen,
    onClose,
    entry,
    getCategoryName,
    getAccountName,
    formatCurrency,
}) => {
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isEditMode, setEditMode] = useState(false);
    const [isEditVoucherMode, setIsEditVoucherMode] = useState(false);
    const [editedEntry, setEditedEntry] = useState({});
    const [userName, setUserName] = useState("Cargando...");
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);

    const [selectedImages, setSelectedImages] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ventaCategoryId, setVentaCategoryId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [arqueoCategoryId, setArqueoCategoryId] = useState(null);
    {/*Estados para comprobantes*/ }
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);

    const { authToken } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

    useEffect(() => {
        if (!isOpen) {
            setEditMode(false); // Asegurarse de que el modo edición esté desactivado al cerrar
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && entry) {
            setEditMode(false); // Asegurarse de que el modo edición esté desactivado al abrir
            setEditedEntry({
                ...entry,
                amount: parseFloat(entry.amount) || 0,
                amountfev: parseFloat(entry.amountfev) || 0,
                amountdiverse: parseFloat(entry.amountdiverse) || 0,
                voucher: entry.voucher || "",
                description: entry.description || "",
                estado: entry.estado,
            });
            fetchUserName(entry.user_id, authToken);
        }
    }, [isOpen, entry]);


    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/accounts`);
                const filteredAccounts = response.data.filter(account => account.type === "Banco");
                setAccounts(filteredAccounts);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching accounts:", error);
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Usamos axios para obtener las categorías
                const response = await axios.get(`${API_BASE_URL}/categories`);

                // Filtramos las categorías que son de tipo 'income' o 'ingreso'
                const incomeCategories = response.data.filter(category =>
                    category.type?.toLowerCase() === 'income' ||
                    category.type?.toLowerCase() === 'ingreso'
                );

                // Actualizamos el estado con las categorías filtradas
                setCategories(incomeCategories);

                // Buscamos las categorías 'Arqueo' y 'Venta' para guardarlas
                const arqueoCategory = incomeCategories.find(cat => cat.name === 'Arqueo');
                const ventaCategory = incomeCategories.find(cat => cat.name === 'Venta');

                if (arqueoCategory) {
                    setArqueoCategoryId(arqueoCategory.id);
                }
                if (ventaCategory) {
                    setVentaCategoryId(ventaCategory.id);
                }
            } catch (error) {
                console.error("Error al obtener las categorías:", error);
            }
        };

        // Llamamos a la función para obtener las categorías
        fetchCategories();
    }, [isOpen]);

    const fetchUserName = async (userId, token) => {
        try {
            const userData = await getUserById(userId, token);
            setUserName(userData.username || "Desconocido");
        } catch (error) {
            console.error("Error al obtener el usuario:", error);
            setUserName("Desconocido");
        }
    };
    const showDeleteModal = () => {
        setDeleteModalOpen(true);
    };


    const handleVoucherUpdate = (updatedVouchers) => {
        setEditedEntry(prev => ({
            ...prev,
            voucher: updatedVouchers
        }));
    };

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/incomes/${entry.id}`, {
            });
            if (response.status === 200 || response.status === 204) {
                message.success("Ingreso eliminado con éxito.");
                setDeleteModalOpen(false);
                onClose();
            } else {
                throw new Error("Error inesperado al eliminar el ingreso.");
            }
        } catch (error) {
            console.error("Error eliminando el ingreso:", error);
            message.error("Hubo un error al intentar eliminar el ingreso. Por favor, inténtalo de nuevo.");
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
    };

    const toggleEditMode = () => {
        setEditMode((prev) => !prev);
    };

    const handleInputChange = (field, value) => {
        setEditedEntry((prev) => ({
            ...prev,
            [field]: field.includes("amount")
                ? value.replace(/\./g, "").replace(/[^0-9]/g, "")
                : value,
        }));
    };


    const closeImageModal = () => {
        setCurrentImage(null);
        setIsImageModalOpen(false);
    };

    const handleSaveChanges = async () => {
        try {
            if (!editedEntry.amount || parseFloat(editedEntry.amount) <= 0) {
                message.error("El monto debe ser un número positivo.");
                return;
            }

            if (!editedEntry.category_id) {
                message.error("Por favor seleccione una categoría.");
                return;
            }

            if (!editedEntry.account_id) {
                message.error("Por favor seleccione una cuenta.");
                return;
            }

            // Subir imágenes seleccionadas al servidor y obtener sus URLs
            const uploadedImageUrls = await Promise.all(
                selectedImages.map(async (file) => {
                    const uploadedImageUrl = await uploadImage(file);
                    return uploadedImageUrl;
                })
            );
            const formattedEntry = {
                ...editedEntry,
                amount: parseFloat(editedEntry.amount),
                amountfev: parseFloat(editedEntry.amountfev) || 0,
                amountdiverse: parseFloat(editedEntry.amountdiverse) || 0,
                voucher: updatedVoucher, // Reemplazar las imágenes anteriores por las nuevas
                estado: editedEntry.estado === "Activo" || editedEntry.estado === true,
            };

            const response = await axios.put(
                `${API_BASE_URL}/incomes/${entry.id}`,
                formattedEntry,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                message.success("Ingreso actualizado con éxito.");
                setEditMode(false);
                onClose();
            } else {
                throw new Error("Error inesperado al actualizar el ingreso.");
            }
        } catch (error) {
            console.error("Error actualizando el ingreso:", error);
            message.error("Hubo un error al intentar actualizar el ingreso. Por favor, inténtalo de nuevo.");
        }
    };

    if (!isOpen) return null;

    if (!editedEntry) {
        return (
            <div className="flex items-center justify-center h-full">
                <Spin size="large" tip="Cargando datos..." />
            </div>
        );
    }


    return (

        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                    setEditMode(false); // También asegurarse de resetear al cerrar con click fuera
                }
            }}

        >
            <div className="fixed inset-y-0 right-0 w-full md:w-[37em] bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto">
                <div className="p-4">
                    {/* Header */}
                    <div className="flex justify-between items-center ">
                        <div className="flex items-center space-x-2">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <FileTextOutlined className="text-blue-500 text-xl" />
                            </div>
                            <h2 className="text-xl font-semibold">
                                {isEditMode ? "Editar Ingreso" : "Detalle del Ingreso"}
                            </h2>
                        </div>
                        <div class="h-1 bg-blue-500"></div>
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={onClose}
                            className="hover:bg-gray-100 rounded-full"
                        />
                    </div>
                    <div class="h-1 bg-blue-500"></div>

                    {/* Formulario editable */}
                    <div className="flex flex-col items-center pt-5">
                        <p className="text-xl font-semibold">{entry.description || "Desconocido"}</p>
                    </div>


                    <div className="bg-gray-50 p-1 rounded-lg my-4">
                        <div className="space-y-0.2 mb-4 border border-gray-300 p-4 ">

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">Usuario</p>

                                <p className="font-medium">{(userName)}</p>

                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">Monto</p>
                                {isEditMode ? (
                                    <Input
                                        value={editedEntry.amount}
                                        onChange={(e) => handleInputChange("amount", e.target.value)}
                                        className="w-32"
                                    />
                                ) : (
                                    <p className="font-medium">{formatCurrency(entry.amount)}</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">Descripción</p>
                                {isEditMode ? (
                                    <Input
                                        value={editedEntry.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        className="w-32"
                                    />
                                ) : (
                                    <p className="font-medium">{entry.description}</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">Categoría</p>
                                {isEditMode ? (
                                    <select
                                        value={editedEntry.category_id}
                                        onChange={(e) => handleInputChange("category_id", e.target.value)}
                                        className="form-select w-32 h-10"
                                    >
                                        <option value="">Seleccionar categoría...</option>
                                        {loading ? (
                                            <option>Cargando...</option>
                                        ) : (
                                            categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                ) : (
                                    <p className="font-medium">{getCategoryName(entry.category_id)}</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">Cuenta</p>
                                {isEditMode ? (
                                    <select
                                        value={editedEntry.account_id}
                                        onChange={(e) => handleInputChange("account_id", e.target.value)}
                                        className="form-select w-32 h-10"
                                    >
                                        <option value="">Seleccionar cuenta...</option>
                                        {loading ? (
                                            <option>Loading...</option>
                                        ) : (
                                            accounts.map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                ) : (
                                    <p className="font-medium">{getAccountName(entry.account_id)}</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">Monto FEV</p>
                                {isEditMode ? (
                                    <Input
                                        value={editedEntry.amountfev}
                                        onChange={(e) => handleInputChange("amountfev", e.target.value)}
                                        className="w-32"
                                    />
                                ) : (
                                    <p className="font-medium text-green-600">
                                        {formatCurrency(entry.amountfev || 0)}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">Monto Diverse</p>
                                {isEditMode ? (
                                    <Input
                                        value={editedEntry.amountdiverse}
                                        onChange={(e) => handleInputChange("amountdiverse", e.target.value)}
                                        className="w-32"
                                    />
                                ) : (
                                    <p className="font-medium text-green-600">
                                        {formatCurrency(entry.amountdiverse || 0)}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">Tipo</p>
                                {isEditMode ? (
                                    <Input
                                        value={editedEntry.type}
                                        onChange={(e) => handleInputChange("type", e.target.value)}
                                        className="w-32"
                                    />
                                ) : (
                                    <p className="font-medium">{entry.type || "Desconocido"}</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">Estado</p>
                                {isEditMode ? (
                                    <Input
                                        value={editedEntry.estado ? "Activo" : "Inactivo"}
                                        onChange={(e) => handleInputChange("estado", e.target.value)}
                                        className="w-32"
                                    />
                                ) : (
                                    <p className="font-medium">{entry.estado ? "Activo" : "Inactivo"}</p>
                                )}
                            </div>
                        </div>


                        {/*COMPROBANTES*/}
                        <VoucherSection
                            entry={editedEntry}
                            entryId={entry.id} // Pasamos el ID explícitamente
                            onVoucherUpdate={handleVoucherUpdate}
                            isEditMode={isEditMode}
                        />


                    </div>
                </div>
                <Modal
                    visible={isImageModalOpen}
                    onCancel={closeImageModal}
                    footer={null}
                    centered
                    width={300}
                >
                    {currentImage && (
                        <img
                            src={currentImage}
                            alt="Comprobante ampliado"
                            className="w-full h-auto rounded-md"
                        />
                    )}
                </Modal>
                {/* Modal de confirmación de eliminación */}
                <Modal
                    title="Confirmar Eliminación"
                    open={isDeleteModalOpen}
                    onOk={handleDelete}
                    onCancel={handleCancelDelete}
                    okText="Eliminar"
                    cancelText="Cancelar"
                    okButtonProps={{ danger: true }}
                    icon={<ExclamationCircleOutlined />}
                >
                    <p>
                        ¿Está seguro de que desea eliminar este ingreso:{" "}
                        <strong>{entry.description}</strong>?
                    </p>
                </Modal>

                {/* Botones de acción */}
                <div className="sticky bottom-4 left-0 right-0 bg-white p-4 border-t shadow-lg flex justify-center">
                    <Space size="large">
                        {isEditMode ? (
                            <Button
                                type="primary"

                                icon={<SaveOutlined style={{ fontSize: "1.5rem" }} />}
                                size="large"
                                onClick={handleSaveChanges}

                            >
                                <span className="text-sm font-medium text-center">Guardar</span>
                            </Button>
                        ) : (
                            <Button
                                type="default"

                                icon={<EditOutlined style={{ fontSize: "1.5rem", color: "gray" }} />}
                                size="large"
                                onClick={toggleEditMode}

                            >
                                <span className="text-sm font-medium text-gray-600 text-center">Editar</span>
                            </Button>
                        )}
                        <Button
                            danger


                            icon={<DeleteOutlined style={{ fontSize: "1.5rem" }} />}
                            size="large"
                            onClick={showDeleteModal}

                        >
                            <span className="text-sm font-medium text-center">Eliminar</span>
                        </Button>
                    </Space>
                </div>
            </div>
        </div >


    );
};

export default TransactionDetailModal;
