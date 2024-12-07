import React, { useState, useEffect } from "react";
import { Button, Modal, Input, message, Space, } from "antd";
import { SaveOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, CloseOutlined, PrinterOutlined, FileTextOutlined } from "@ant-design/icons";
import axios from "axios";
import { getUserById } from "../../../../services/apiService";
import { useAuth } from "../../../Context/AuthProvider";
import VoucherSection from "./VoucherSection";

const ExpenseDetailModal = ({
    isOpen,
    onClose,
    entry, // Aquí usamos `entry` como objeto de entrada
    getCategoryName,
    getAccountName,
}) => {
    const [isEditMode, setEditMode] = useState(false);
    const [userName, setUserName] = useState("Cargando...");
    const [editedEntry, setEditedEntry] = useState({
        amount: "",
        description: "",
        category_id: "",
        account_id: "",
        type: "",
        timerecurrent: "",
        sub_type: "",
        provider_id: "",
        //base_amount: "",
        tax_type: "",
        recurrent: false,
        tax_percentage: "",
        tax_amount: "",
        retention_type: "",
        retention_percentage: "",
        retention_amount: "",
    });
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;
    const { authToken } = useAuth();

    const fetchUserName = async (userId, token) => {
        try {
            const userData = await getUserById(userId, token);
            setUserName(userData.username || "Desconocido");
        } catch (error) {
            console.error("Error al obtener el usuario:", error);
            setUserName("Desconocido");
        }
    };
    // Fetching data from API
    useEffect(() => {
        fetchCategories();
        fetchAccounts();

        if (isOpen && entry) {
            setEditedEntry({
                ...entry,
                amount: parseFloat(entry.amount) || 0,
                description: entry.description || "Sin descripción",
                //base_amount: parseFloat(entry.base_amount) || 0,
                provider_id: entry.provider_id || "",
                tax_type: entry.tax_type || "",
                recurrent: entry.recurrent || false,
                tax_percentage: entry.tax_percentage || "",
                tax_amount: entry.tax_amount || "",
                retention_type: entry.retention_type || "",
                retention_percentage: entry.retention_percentage || "",
                retention_amount: entry.retention_amount || "",
            });
            fetchUserName(entry.user_id, authToken);
        }
    }, [isOpen, entry]);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleVoucherUpdate = (updatedVouchers) => {
        setEditedEntry(prev => ({
            ...prev,
            voucher: updatedVouchers
        }));
    };

    // Fetch accounts
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

    // Handle input changes
    const handleInputChange = (field, value) => {
        setEditedEntry((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const formatCurrency = (amount) => {
        if (isNaN(amount)) return "$0.00";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    // Toggle edit mode
    const toggleEditMode = () => {
        setEditMode((prev) => !prev);
    };

    // Save changes
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

            const response = await axios.put(
                `${API_BASE_URL}/expenses/${entry.id}`,
                editedEntry,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                message.success("Gasto actualizado con éxito.");
                setEditMode(false);
                onClose();
            } else {
                throw new Error("Error inesperado al actualizar el gasto.");
            }
        } catch (error) {
            console.error("Error actualizando el gasto:", error);
            message.error("Hubo un error al intentar actualizar el gasto. Por favor, inténtalo de nuevo.");
        }
    };

    // Show delete modal
    const showDeleteModal = () => {
        setDeleteModalOpen(true);
    };

    // Handle delete
    const handleDelete = async () => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/expenses/${entry.id}`);
            if (response.status === 200 || response.status === 204) {
                message.success("Gasto eliminado con éxito.");
                setDeleteModalOpen(false);
                onClose();
            } else {
                throw new Error("Error inesperado al eliminar el gasto.");
            }
        } catch (error) {
            console.error("Error eliminando el gasto:", error);
            message.error("Hubo un error al intentar eliminar el gasto. Por favor, inténtalo de nuevo.");
        }
    };

    const handleCancelDelete = () => {
        setDeleteModalOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[38em] bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto ">
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-red-100 p-2 rounded-full">
                            <ExclamationCircleOutlined className="text-red-500 text-xl" />
                        </div>
                        <h2 className="text-xl font-semibold">
                            {isEditMode ? "Editar Gasto" : "Detalle del Gasto"}
                        </h2>
                    </div>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClose}
                        className="hover:bg-gray-100 rounded-full"
                    />
                </div>
                <hr className="border-t-2 border-red-500 mb-4" />
                <div className="flex flex-col items-center space-y-3">
                    <div className="flex flex-col items-center">
                        <p className="text-xl font-semibold text-gray-700">Usuario</p>
                        <p className="font-medium text-gray-600">{userName || "Desconocido"}</p>
                    </div>
                </div>
                {/* Formulario editable */}
                <div className="grid grid-cols-1 gap-4 bg-slate-50 px-8 py-4 mb-6 border border-gray-300 rounded-lg">
                    {/* Monto */}
                    <div className="flex justify-between items-center">
                        {isEditMode ? (
                            <>
                                <p className="text-sm text-gray-500">Monto</p>
                                <Input
                                    value={editedEntry.amount || ""}
                                    onChange={(e) => handleInputChange("amount", e.target.value)}
                                    className="w-full" // Asegura que el input ocupe todo el espacio disponible
                                />
                            </>
                        ) : (
                            <div className="flex justify-between w-full">
                                <p className="font-medium text-gray-700">Monto:</p>
                                <p className="font-semibold text-gray-600">{formatCurrency(entry?.amount || 0)}</p>
                            </div>
                        )}
                    </div>

                    {/* Descripción */}
                    <div className="flex justify-between items-center">
                        {isEditMode ? (
                            <>
                                <p className="text-sm text-gray-500">Descripción</p>
                                <Input
                                    value={editedEntry.description || "Sin descripción"}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    className="w-full" // Asegura que el input ocupe todo el espacio disponible
                                />
                            </>
                        ) : (
                            <div className="flex justify-between w-full gap-20">
                                <p className="font-medium text-gray-700">Descripción:</p>
                                <p className="font-semibold text-gray-600 justify-end">{entry?.description || "Sin descripción"}</p>
                            </div>
                        )}
                    </div>
                    {/* Fecha */}
                    <div className="flex justify-between items-center mb-1">
                        {isEditMode ? (
                            <>
                                <p className="text-sm text-gray-500">Fecha</p>
                                <Input
                                    value={editedEntry.date || ""}
                                    onChange={(e) => handleInputChange("date", e.target.value)}
                                    className="w-full h-12"
                                />
                            </>
                        ) : (
                            <div className="flex justify-between w-full">
                                <p className="font-medium text-gray-700">Fecha:</p>
                                <p className="font-semibold text-gray-600">{entry?.date || "No disponible"}</p>
                            </div>
                        )}
                    </div>

                    {/* Categoría */}
                    <div className="flex justify-between items-center mb-1">
                        {isEditMode ? (
                            <>
                                <p className="text-sm text-gray-500">Categoría</p>
                                <select
                                    value={editedEntry.category_id || ""}
                                    onChange={(e) => handleInputChange("category_id", e.target.value)}
                                    className="form-select w-full h-12"
                                >
                                    <option value="">Seleccionar categoría...</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <div className="flex justify-between w-full">
                                <p className="font-medium text-gray-700">Categoría:</p>
                                <p className="font-semibold text-gray-600">{getCategoryName(entry?.category_id || "")}</p>
                            </div>
                        )}
                    </div>
                    {/* Categoría */}
                    <div className="flex justify-between items-center mb-1">
                        {isEditMode ? (
                            <>
                                <p className="text-sm text-gray-500">Categoría</p>
                                <select
                                    value={editedEntry.category_id || ""}
                                    onChange={(e) => handleInputChange("category_id", e.target.value)}
                                    className="form-select w-full h-12"
                                >
                                    <option value="">Seleccionar categoría...</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <div className="flex justify-between w-full">
                                <p className="font-medium text-gray-700">Categoría:</p>
                                <p className="font-semibold text-gray-600">{getCategoryName(entry?.category_id || "")}</p>
                            </div>
                        )}
                    </div>
                    {/* Cuenta */}
                    <div className="flex justify-between items-center mb-1">
                        {isEditMode ? (
                            <>
                                <p className="text-sm text-gray-500">Cuenta</p>
                                <select
                                    value={editedEntry.account_id || ""}
                                    onChange={(e) => handleInputChange("account_id", e.target.value)}
                                    className="form-select w-full h-12"
                                >
                                    <option value="">Seleccionar cuenta...</option>
                                    {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                            {account.name}
                                        </option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <div className="flex justify-between w-full">
                                <p className="font-medium text-gray-700">Cuenta:</p>
                                <p className="font-semibold text-gray-600">{getAccountName(entry?.account_id || "")}</p>
                            </div>
                        )}
                    </div>

                    {/* Método de Pago */}
                    <div className="flex justify-between items-center mb-1">
                        {isEditMode ? (
                            <>
                                <p className="text-sm text-gray-500">Método de Pago</p>
                                <select
                                    value={editedEntry.payment_method || ""}
                                    onChange={(e) => handleInputChange("payment_method", e.target.value)}
                                    className="form-select w-full h-12"
                                >
                                    <option value="">Seleccionar método de pago...</option>
                                    <option value="credit_card">Tarjeta de crédito</option>
                                    <option value="bank_transfer">Transferencia bancaria</option>
                                </select>
                            </>
                        ) : (
                            <div className="flex justify-between w-full">
                                <p className="font-medium text-gray-700">Método de Pago:</p>
                                <p className="font-semibold text-gray-600">{entry?.payment_method || "No especificado"}</p>
                            </div>
                        )}
                    </div>

                    {/* Estado de la transacción */}
                    <div className="flex justify-between items-center mb-1">
                        {isEditMode ? (
                            <>
                                <p className="text-sm text-gray-500">Estado de la transacción</p>
                                <select
                                    value={editedEntry.transaction_status || ""}
                                    onChange={(e) => handleInputChange("transaction_status", e.target.value)}
                                    className="form-select w-full h-12"
                                >
                                    <option value="">Seleccionar estado...</option>
                                    <option value="pending">Pendiente</option>
                                    <option value="completed">Completada</option>
                                    <option value="failed">Fallida</option>
                                </select>
                            </>
                        ) : (
                            <div className="flex justify-between w-full">
                                <p className="font-medium text-gray-700">Estado:</p>
                                <p className="font-semibold text-gray-600">{entry?.transaction_status || "Desconocido"}</p>
                            </div>
                        )}
                    </div>
                    {/* Proveedor */}
                    <div className="flex justify-between items-center">
                        {isEditMode ? (
                            <>
                                <p className="text-sm text-gray-500">Proveedor</p>
                                <Input
                                    value={editedEntry.provider_id || "Sin descripción"}
                                    onChange={(e) => handleInputChange("provider_id", e.target.value)}
                                    className="w-full" // Asegura que el input ocupe todo el espacio disponible
                                />
                            </>
                        ) : (
                            <div className="flex justify-between w-full gap-20">
                                <p className="font-medium text-gray-700">Proveedor:</p>
                                <p className="font-semibold text-gray-600 justify-end">{entry?.provider_id || "Sin Proveedor"}</p>
                            </div>
                        )}
                    </div>
                    {/* Descripción */}
                    <div className="flex justify-between items-center">
                        {/* {isEditMode ? (
                            <>
                                <p className="text-sm text-gray-500">Monto base</p>
                                <Input
                                    value={editedEntry.base_amount || "Desconocido"}
                                    onChange={(e) => handleInputChange("base_amount", e.target.value)}
                                    className="w-full" // Asegura que el input ocupe todo el espacio disponible
                                />
                            </>
                        ) : ( */}
                        <div className="flex justify-between w-full gap-20">
                            <p className="font-medium text-gray-700">Monto base:</p>
                            <p className="font-semibold text-gray-600 justify-end">{entry?.base_amount || "Desconocido"}</p>
                        </div>
                        {/*  ) */}{/* } */}
                    </div>
                    {/* Observaciones */}
                    <div className="flex justify-between items-center mb-1">
                        {isEditMode ? (
                            <>
                                <p className="text-sm text-gray-500">Observaciones</p>
                                <textarea
                                    value={editedEntry.notes || ""}
                                    onChange={(e) => handleInputChange("notes", e.target.value)}
                                    className="form-textarea w-full h-24 border rounded-lg p-2"
                                />
                            </>
                        ) : (
                            <div className="flex justify-between w-full">
                                <p className="font-medium text-gray-700">Observaciones:</p>
                                <p className="font-semibold text-gray-600">{entry?.notes || "Ninguna"}</p>
                            </div>
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

                        {/* Botón Eliminar */}
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

            {/* Modal de confirmación de eliminación */}
            <Modal
                title="Confirmar Eliminación"
                visible={isDeleteModalOpen}
                onOk={handleDelete}
                onCancel={handleCancelDelete}
                okText="Eliminar"
                cancelText="Cancelar"
                okButtonProps={{ danger: true }}
                icon={<ExclamationCircleOutlined />}
                width={600}
            >
                <p>
                    ¿Está seguro de que desea eliminar este gasto:{" "}
                    <strong>{entry?.description || "Sin descripción"}</strong>
                </p>
            </Modal>
        </div>
    );
};

export default ExpenseDetailModal;
