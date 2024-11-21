import React, { useState, useEffect } from "react";
import { Button, Modal, message } from "antd";
import {
    CloseOutlined,
    EditOutlined,
    DeleteOutlined,
    FileTextOutlined,
    PrinterOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";

import { getUserById } from "../../../../services/apiService";
import { useAuth } from "../../../Context/AuthProvider";
import axios from "axios";

const TransactionDetailModal = ({
    isOpen,
    onClose,
    entry,
    getCategoryName,
    getAccountName,
    formatCurrency,
}) => {
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userName, setUserName] = useState("Cargando...");
    const { authToken } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

    useEffect(() => {
        if (isOpen && entry?.user_id && authToken) {
            fetchUserName(entry.user_id, authToken);
        }
    }, [isOpen, entry, authToken]);

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

    const handleDelete = async () => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/incomes/${entry.id}`);
            if (response.status === 200 || response.status === 204) {
                console.log("Ingreso eliminado:", entry.id);

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

    if (!isOpen || !entry) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[32em] bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto">
            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <FileTextOutlined className="text-blue-500 text-xl" />
                        </div>
                        <h2 className="text-xl font-semibold">Detalle del Ingreso</h2>
                    </div>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClose}
                        className="hover:bg-gray-100 rounded-full"
                    />
                </div>
                <hr className="border-t-2 border-blue-500 mb-4" />

                {/* Descripción principal */}
                <div>
                    <p className="text-xl font-semibold">Usuario</p>
                    <p className="font-medium">{userName || "Desconocido"}</p>
                </div>


                {/* Detalles del ingreso */}
                <div className="bg-gray-50 p-4 rounded-lg my-4">
                    <p className="text-xl font-bold text-gray-800">
                        Monto total: {formatCurrency(entry.amount)}
                        <span className="ml-4 px-2 py-1 text-sm text-blue-600 bg-blue-100 rounded">
                            {entry.estado ? "Activo" : "Inactivo"}
                        </span>
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <p className="text-sm text-gray-500">Fecha y hora</p>
                            <p className="font-medium">
                                {new Date(entry.date).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Descripción</p>
                            <p className="font-medium">{entry.description}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Categoría</p>
                            <p className="font-medium">
                                {getCategoryName(entry.category_id)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Cuenta</p>
                            <p className="font-medium">
                                {getAccountName(entry.account_id)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Monto FEV</p>
                            <p className="font-medium text-green-600">
                                {formatCurrency(entry.amountfev || 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Monto Diverse</p>
                            <p className="font-medium text-green-600">
                                {formatCurrency(entry.amountdiverse || 0)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tipo</p>
                            <p className="font-medium">{entry.type || "Desconocido"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Estado</p>
                            <p className="font-medium">
                                {entry.estado ? "Activo" : "Inactivo"}
                            </p>
                        </div>
                        {entry.note && (
                            <div className="col-span-2">
                                <p className="text-sm text-gray-500">Nota</p>
                                <p className="font-medium">{entry.note}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="fixed bottom-4 left-0 right-0 bg-white p-4 border-t flex justify-around">
                    <Button
                        className="flex flex-col items-center text-blue-600 hover:text-blue-800"
                        icon={
                            <PrinterOutlined style={{ fontSize: "2rem", color: "#2563eb" }} />
                        }
                    >
                        <span className="text-sm mt-1 font-semibold">Imprimir</span>
                    </Button>
                    <Button
                        className="flex flex-col items-center text-green-600 hover:text-green-800"
                        icon={
                            <FileTextOutlined style={{ fontSize: "2rem", color: "#16a34a" }} />
                        }
                    >
                        <span className="text-sm mt-1 font-semibold">Comprobante</span>
                    </Button>
                    <Button
                        className="flex flex-col items-center text-yellow-600 bg-yellow-100 hover:bg-yellow-200"
                        icon={
                            <EditOutlined style={{ fontSize: "2rem", color: "#ca8a04" }} />
                        }
                    >
                        <span className="text-sm mt-1 font-semibold text-yellow-600">Editar</span>
                    </Button>
                    <Button
                        danger
                        className="flex flex-col items-center text-red-600 hover:text-red-800"
                        icon={
                            <DeleteOutlined style={{ fontSize: "2rem", color: "#dc2626" }} />
                        }
                        onClick={showDeleteModal}
                    >
                        <span className="text-sm mt-1 font-semibold">Eliminar</span>
                    </Button>
                </div>
            </div>

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
        </div>
    );
};

export default TransactionDetailModal;
