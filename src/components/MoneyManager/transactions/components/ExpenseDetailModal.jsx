import React, { useState, useEffect } from "react";
import { Button, Modal, Input, message, Spin } from "antd";
import { SaveOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";

const ExpenseDetailModal = ({
    isOpen,
    onClose,
    expense,
    getCategoryName,
    getAccountName,
}) => {
    const [isEditMode, setEditMode] = useState(false);
    const [editedExpense, setEditedExpense] = useState({
        amount: "",
        description: "",
        category_id: "",
        account_id: "",
        provider_id: "",
        base_amount: "",
    });
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

    // Fetching data from API
    useEffect(() => {
        fetchCategories();
        fetchAccounts();

        if (isOpen && expense) {
            setEditedExpense({
                ...expense,
                amount: parseFloat(expense.amount) || 0,
                provider_id: expense.provider_id || "",
                description: expense.description || "Sin descripción", // Valor predeterminado
                base_amount: parseFloat(expense.base_amount) || 0,
            });
        }
    }, [isOpen, expense]);

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
        setEditedExpense((prev) => ({
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
            if (!editedExpense.amount || parseFloat(editedExpense.amount) <= 0) {
                message.error("El monto debe ser un número positivo.");
                return;
            }

            if (!editedExpense.category_id) {
                message.error("Por favor seleccione una categoría.");
                return;
            }

            if (!editedExpense.account_id) {
                message.error("Por favor seleccione una cuenta.");
                return;
            }

            const response = await axios.put(
                `${API_BASE_URL}/expenses/${expense.id}`,
                editedExpense,
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
            const response = await axios.delete(`${API_BASE_URL}/expenses/${expense.id}`);
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

    // Modal should open even if `expense` is undefined
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

                {/* Formulario editable */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Monto</p>
                        {isEditMode ? (
                            <Input
                                value={editedExpense.amount || ""}
                                onChange={(e) => handleInputChange("amount", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{formatCurrency(expense?.amount || 0)}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Descripción</p>
                        {isEditMode ? (
                            <Input
                                value={editedExpense.description || "Sin descripción"}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{expense?.description || "Sin descripción"}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Categoría</p>
                        {isEditMode ? (
                            <select
                                value={editedExpense.category_id || ""}
                                onChange={(e) => handleInputChange("category_id", e.target.value)}
                                className="form-select w-full h-12"
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
                            <p className="font-medium">{getCategoryName(expense?.category_id || "")}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Cuenta</p>
                        {isEditMode ? (
                            <select
                                value={editedExpense.account_id || ""}
                                onChange={(e) => handleInputChange("account_id", e.target.value)}
                                className="form-select w-full h-12"
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
                            <p className="font-medium">{getAccountName(expense?.account_id || "")}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Proveedor</p>
                        {isEditMode ? (
                            <Input
                                value={editedExpense.provider_id || ""}
                                onChange={(e) => handleInputChange("provider_id", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{expense?.provider_id || ""}</p>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Base del monto</p>
                        {isEditMode ? (
                            <Input
                                value={editedExpense.base_amount || ""}
                                onChange={(e) => handleInputChange("base_amount", e.target.value)}
                            />
                        ) : (
                            <p className="font-medium">{formatCurrency(expense?.base_amount || "")}</p>
                        )}
                    </div>
                </div>

                {/* Acciones */}
                <div className="mt-6 flex justify-end space-x-2">
                    <Button onClick={toggleEditMode}>
                        {isEditMode ? "Cancelar" : "Editar"}
                    </Button>
                    {isEditMode && (
                        <Button type="primary" onClick={handleSaveChanges} icon={<SaveOutlined />}>
                            Guardar
                        </Button>
                    )}
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={showDeleteModal}
                    >
                        Eliminar
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
                    <strong>{expense?.description || "Sin descripción"}</strong>?
                </p>
            </Modal>
        </div>
    );
};

export default ExpenseDetailModal;
