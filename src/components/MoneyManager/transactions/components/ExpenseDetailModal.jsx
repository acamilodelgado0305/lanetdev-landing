import React, { useState, useEffect } from "react";
import { Button, Modal, Input, message, Spin, Select } from "antd";
import { SaveOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, CloseOutlined, PrinterOutlined, FileTextOutlined } from "@ant-design/icons";
import axios from "axios";
import { getUserById } from "../../../../services/apiService";
import { useAuth } from "../../../Context/AuthProvider";

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
        provider_id: "",
        base_amount: "",
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
                description: entry.description || "Sin descripción", // Valor predeterminado
                base_amount: parseFloat(entry.base_amount) || 0,
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
        <div className="fixed inset-y-0 right-0 w-full md:w-[38em] bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto">
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
                <div>
                    <p className="text-xl font-semibold">Usuario</p>
                    <p className="font-medium">{userName || "Desconocido"}</p>
                </div>
                {/* Formulario editable */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Monto</p>
                        {isEditMode ? (
                            <Input
                                value={editedEntry.amount || ""}
                                onChange={(e) => handleInputChange("amount", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{formatCurrency(entry?.amount || 0)}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Descripción</p>
                        {isEditMode ? (
                            <Input
                                value={editedEntry.description || "Sin descripción"}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{entry?.description || "Sin descripción"}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Categoría</p>
                        {isEditMode ? (
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
                        ) : (
                            <p className="font-medium">{getCategoryName(entry?.category_id || "")}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Cuenta</p>
                        {isEditMode ? (
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
                        ) : (
                            <p className="font-medium">{getAccountName(entry?.account_id || "")}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Proveedor</p>
                        {isEditMode ? (
                            <Input
                                value={editedEntry.provider_id || ""}
                                onChange={(e) => handleInputChange("provider_id", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{entry?.provider_id || "No disponible"}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Base del monto</p>
                        {isEditMode ? (
                            <Input
                                value={editedEntry.base_amount || ""}
                                onChange={(e) => handleInputChange("base_amount", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{formatCurrency(entry?.base_amount || 0)}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Tipo de Impuesto</p>
                        {isEditMode ? (
                            <Input
                                value={editedEntry.tax_type || ""}
                                onChange={(e) => handleInputChange("tax_type", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{entry?.tax_type || "No aplica"}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Porcentaje de Impuesto</p>
                        {isEditMode ? (
                            <Input
                                value={editedEntry.tax_percentage || ""}
                                onChange={(e) => handleInputChange("tax_percentage", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{entry?.tax_percentage || "No aplica"}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Monto del Impuesto</p>
                        {isEditMode ? (
                            <Input
                                value={editedEntry.tax_amount || ""}
                                onChange={(e) => handleInputChange("tax_amount", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{entry?.tax_amount || "No aplica"}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Tipo de Retención</p>
                        {isEditMode ? (
                            <Input
                                value={editedEntry.retention_type || ""}
                                onChange={(e) => handleInputChange("retention_type", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{entry?.retention_type || "No aplica"}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Porcentaje de Retención</p>
                        {isEditMode ? (
                            <Input
                                value={editedEntry.retention_percentage || ""}
                                onChange={(e) => handleInputChange("retention_percentage", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{entry?.retention_percentage || "No aplica"}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Monto de Retención</p>
                        {isEditMode ? (
                            <Input
                                value={editedEntry.retention_amount || ""}
                                onChange={(e) => handleInputChange("retention_amount", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{entry?.retention_amount || "No aplica"}</p>
                        )}
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="fixed bottom-4 left-0 right-0 bg-white p-4 border-t flex justify-around">
                    <Button
                        className="flex flex-col items-center text-blue-600 hover:text-blue-800"
                        icon={<PrinterOutlined style={{ fontSize: "2rem", color: "#2563eb" }} />}
                    >
                        <span className="text-sm mt-1 font-semibold">Imprimir</span>
                    </Button>
                    <Button
                        className="flex flex-col items-center text-green-600 hover:text-green-800"
                        icon={<FileTextOutlined style={{ fontSize: "2rem", color: "#16a34a" }} />}
                    >
                        <span className="text-sm mt-1 font-semibold">Comprobante</span>
                    </Button>
                    {isEditMode ? (
                        <Button
                            className="flex flex-col items-center text-green-600 hover:text-green-800"
                            icon={<SaveOutlined style={{ fontSize: "2rem", color: "#16a34a" }} />}
                            onClick={handleSaveChanges}
                        >
                            <span className="text-sm mt-1 font-semibold">Guardar</span>
                        </Button>
                    ) : (
                        <Button
                            className="flex flex-col items-center text-yellow-600 bg-yellow-100 hover:bg-yellow-200"
                            icon={<EditOutlined style={{ fontSize: "2rem", color: "#ca8a04" }} />}
                            onClick={toggleEditMode}
                        >
                            <span className="text-sm mt-1 font-semibold text-yellow-600">Editar</span>
                        </Button>
                    )}
                    <Button
                        danger
                        className="flex flex-col items-center text-red-600 hover:text-red-800"
                        icon={<DeleteOutlined style={{ fontSize: "2rem", color: "#dc2626" }} />}
                        onClick={showDeleteModal}
                    >
                        <span className="text-sm mt-1 font-semibold">Eliminar</span>
                    </Button>
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
