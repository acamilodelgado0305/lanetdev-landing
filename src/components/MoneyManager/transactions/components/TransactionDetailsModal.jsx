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
import TransactionVoucherSection from "./TransactionVoucherSection";

const TransactionDetailModal = ({
    isOpen,
    onClose,
    entry,
    formatCurrency,
}) => {
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isEditMode, setEditMode] = useState(false);
    const [editedEntry, setEditedEntry] = useState({});
    const [userName, setUserName] = useState("Cargando...");
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { authToken } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

    useEffect(() => {
        if (!isOpen) {
            setEditMode(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && entry) {
            setEditMode(false);
            setEditedEntry({
                ...entry,
                amount: parseFloat(entry.amount) || 0,
                vouchers: entry.vouchers || "",
                description: entry.description || "",
            });
            fetchUserName(entry.user_id, authToken);
        }
    }, [isOpen, entry]);


    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/accounts`);
                setAccounts(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching accounts:", error);
                setLoading(false);
            }
        };

        fetchAccounts();
    }, []);

    const getAccountNameById = (accountId) => {
        if (loading) return "Cargando...";
        if (!accountId) return "Sin cuenta asignada";
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.name : "Cuenta desconocida";
    };

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
            const response = await axios.delete(`${API_BASE_URL}/transfers/${entry.id}`);
            if (response.status === 200 || response.status === 204) {
                message.success("Transferencia eliminada con éxito.");
                setDeleteModalOpen(false);
                onClose();
            }
        } catch (error) {
            console.error("Error eliminando la transferencia:", error);
            message.error("Error al eliminar la transferencia");
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
    const handleCancelEdit = () => {
        setEditMode(false);
        setEditedEntry(entry);
    };

    const handleSaveChanges = async () => {
        try {
            if (!editedEntry.amount || parseFloat(editedEntry.amount) <= 0) {
                message.error("El monto debe ser un número positivo.");
                return;
            }

            if (!editedEntry.account_id) {
                message.error("Por favor seleccione una cuenta.");
                return;
            }

            const formattedEntry = {
                ...editedEntry,
                amount: parseFloat(editedEntry.amount),
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
    const getAccountName = (accountId) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.name : "Cuenta desconocida";
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
                                {isEditMode ? "Editar Transferencias" : "Detalle de la transferencia"}
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
                        <p className="text-sm text-gray-500">Usuario</p>

                        <p className="font-medium">{(userName)}</p>
                    </div>


                    <div className="bg-gray-50 p-1 rounded-lg my-4">
                        <div className="space-y-0.2 mb-4 border border-gray-300 p-4 ">

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
                                <p className="text-sm text-gray-500">Cuenta de origen</p>
                                {isEditMode ? (
                                    <select
                                        value={editedEntry.from_account_id || ""}
                                        onChange={(e) => handleInputChange("from_account_id", e.target.value)}
                                        className="form-select w-32 h-10"
                                    >
                                        <option value="">Seleccionar cuenta...</option>
                                        {loading ? (
                                            <option>Cargando...</option>
                                        ) : (
                                            accounts.map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                ) : (
                                    <p className="font-medium">{getAccountNameById(entry.from_account_id)}</p>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">Cuenta de destino</p>
                                {isEditMode ? (
                                    <select
                                        value={editedEntry.to_account_id || ""}
                                        onChange={(e) => handleInputChange("to_account_id", e.target.value)}
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
                                    <p className="font-medium">{getAccountNameById(entry.to_account_id)}</p>
                                )}
                            </div>
                        </div>


                        {/*COMPROBANTES*/}
                        <TransactionVoucherSection
                            entry={editedEntry}
                            entryId={entry.id}
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
                    <Space size="large" >
                        {/* Botón de Guardar o Editar */}
                        {isEditMode ? (
                            <Button
                                type="primary"
                                icon={<SaveOutlined style={{ fontSize: "1.5rem" }} />}
                                size="large"
                                onClick={handleSaveChanges}
                            //className="w-1/3"
                            >
                                <span className="text-sm font-medium text-center">Guardar</span>
                            </Button>
                        ) : (
                            <Button
                                type="default"
                                icon={<EditOutlined style={{ fontSize: "1.5rem", color: "gray" }} />}
                                size="large"
                                onClick={toggleEditMode}
                            //className="w-1/3"
                            >
                                <span className="text-sm font-medium text-gray-600 text-center">Editar</span>
                            </Button>
                        )}

                        {/* Botón de Cancelar edición */}
                        {isEditMode && (
                            <Button
                                type="default"
                                icon={<CloseOutlined style={{ fontSize: "1.5rem" }} />}
                                size="large"
                                onClick={handleCancelEdit}
                            //className="w-1/3"
                            >
                                <span className="text-sm font-medium text-center">Cancelar</span>
                            </Button>
                        )}

                        {/* Botón Eliminar */}
                        <Button
                            danger
                            icon={<DeleteOutlined style={{ fontSize: "1.5rem" }} />}
                            size="large"
                            onClick={showDeleteModal}
                        //className="w-1/3"
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
