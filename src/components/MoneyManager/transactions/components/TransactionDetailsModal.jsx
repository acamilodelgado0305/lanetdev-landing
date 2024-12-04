import React, { useState, useEffect } from "react";
import { Button, Modal, Input, message, Upload, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import {
    CloseOutlined,
    EditOutlined,
    DeleteOutlined,
    FileTextOutlined,
    PrinterOutlined,
    ExclamationCircleOutlined,
    SaveOutlined,
} from "@ant-design/icons";

import { getUserById } from "../../../../services/apiService";
import { useAuth } from "../../../Context/AuthProvider";
import axios from "axios";
import { uploadImage } from "../../../../services/apiService";

const TransactionDetailModal = ({
    isOpen,
    onClose,
    entry,
    getCategoryName,
    getAccountName,
    formatCurrency,
}) => {
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isEditMode, setEditMode] = useState(false); // Estado para modo edición
    const [editedEntry, setEditedEntry] = useState({});
    const [userName, setUserName] = useState("Cargando...");
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ventaCategoryId, setVentaCategoryId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [arqueoCategoryId, setArqueoCategoryId] = useState(null);

    const { authToken } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

    useEffect(() => {
        if (isOpen) {
            if (entry) {
                // Precarga datos en modo edición
                setEditedEntry({
                    ...entry,
                    amount: parseFloat(entry.amount) || 0,
                    amountfev: parseFloat(entry.amountfev) || 0,
                    amountdiverse: parseFloat(entry.amountdiverse) || 0,
                    note: entry.note || "",
                    description: entry.description || "",
                    estado: entry.estado,
                });
                fetchUserName(entry.user_id, authToken);
            } else {
                // Reinicia formulario en modo creación
                setEditedEntry({
                    amount: "",
                    amountfev: "",
                    amountdiverse: "",
                    category_id: "",
                    account_id: "",
                    note: "",
                    description: "",
                    estado: true,
                });
            }
        }
    }, [isOpen, entry, authToken]);

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
    const openImageModal = (imageUrl) => {
        setCurrentImage(imageUrl);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setCurrentImage(null);
        setIsImageModalOpen(false);
    };
    const handleDeleteImage = (index) => {
        // Eliminar la URL de la imagen seleccionada de entry.note
        const updatedNote = entry.note.split("\n").filter((_, i) => i !== index).join("\n");

        // Actualizar el estado con la nueva lista de imágenes
        setEditedEntry((prev) => ({
            ...prev,
            note: updatedNote,
        }));

        // Eliminar la imagen de la vista previa
        const updatedImageUrls = imageUrls.filter((_, i) => i !== index);
        setImageUrls(updatedImageUrls);
    };
    const handleLeaveImage = (index) => {
        // Solo dejar la imagen actual y continuar con la carga de nuevas imágenes
        console.log("Imagen dejada: ", entry.note);
    };
    const handleImageSelection = (e) => {
        const files = Array.from(e.target.files);

        // Agrega las imágenes seleccionadas al estado
        setSelectedImages((prev) => [...prev, ...files]);

        // Genera URLs locales para previsualización
        const filePreviews = files.map((file) => URL.createObjectURL(file));
        setImageUrls((prevUrls) => [...prevUrls, ...filePreviews]);

        // Si estamos reemplazando una imagen, la reemplazamos en el índice correspondiente
        if (replacingIndex !== null) {
            const updatedImageUrls = [...imageUrls];
            updatedImageUrls[replacingIndex] = filePreviews[0]; // Reemplazamos la imagen en el índice correspondiente
            setImageUrls(updatedImageUrls);

            // Actualizamos la nota (se puede hacer con un join de las URLs)
            const updatedNote = updatedImageUrls.join("\n");
            setEditedEntry((prev) => ({
                ...prev,
                note: updatedNote,
            }));
        }
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

            // Concatenar URLs preexistentes con nuevas imágenes
            const updatedNote = entry.note.trim() ? `${entry.note}\n${uploadedImageUrls.join("\n")}` : uploadedImageUrls.join("\n");

            const formattedEntry = {
                ...editedEntry,
                amount: parseFloat(editedEntry.amount),
                amountfev: parseFloat(editedEntry.amountfev) || 0,
                amountdiverse: parseFloat(editedEntry.amountdiverse) || 0,
                note: updatedNote, // Reemplazar las imágenes anteriores por las nuevas
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
        <div className="fixed inset-y-0 right-0 w-full md:w-[38em] bg-white shadow-lg z-50 transform transition-transform duration-300 overflow-y-auto">
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <FileTextOutlined className="text-blue-500 text-xl" />
                        </div>
                        <h2 className="text-xl font-semibold">
                            {isEditMode ? "Editar Ingreso" : "Detalle del Ingreso"}
                        </h2>
                    </div>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClose}
                        className="hover:bg-gray-100 rounded-full"
                    />
                </div>
                <hr className="border-t-2 border-blue-500 mb-4" />

                {/* Formulario editable */}
                <div>
                    <p className="text-xl font-semibold">Usuario</p>
                    <p className="font-medium">{userName || "Desconocido"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg my-4">
                    <div className="grid grid-cols-2 gap-4 mb-20">
                        <div>
                            <p className="text-sm text-gray-500">Monto</p>
                            {isEditMode ? (
                                <Input
                                    value={editedEntry.amount}
                                    onChange={(e) => handleInputChange("amount", e.target.value)}
                                />
                            ) : (
                                <p className="font-medium">{formatCurrency(entry.amount)}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Descripción</p>
                            {isEditMode ? (
                                <Input
                                    value={editedEntry.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                />
                            ) : (
                                <p className="font-medium">{entry.description}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Categoría</p>
                            {isEditMode ? (
                                <select
                                    value={editedEntry.category_id}
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
                                <p className="font-medium">
                                    {getCategoryName(entry.category_id)}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Cuenta</p>
                            {isEditMode ? (
                                <select
                                    value={editedEntry.account_id}
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
                                <p className="font-medium">
                                    {getAccountName(entry.account_id)}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Monto FEV</p>
                            {isEditMode ? (
                                <Input
                                    value={editedEntry.amountfev}
                                    onChange={(e) => handleInputChange("amountfev", e.target.value)}
                                />
                            ) : (
                                <p className="font-medium text-green-600">
                                    {formatCurrency(entry.amountfev || 0)}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Monto Diverse</p>
                            {isEditMode ? (
                                <Input
                                    value={editedEntry.amountdiverse}
                                    onChange={(e) => handleInputChange("amountdiverse", e.target.value)}
                                />
                            ) : (
                                <p className="font-medium text-green-600">
                                    {formatCurrency(entry.amountdiverse || 0)}
                                </p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tipo</p>
                            {isEditMode ? (
                                <Input
                                    value={editedEntry.type}
                                    onChange={(e) => handleInputChange("type", e.target.value)}
                                />
                            ) : (
                                <p className="font-medium">{entry.type || "Desconocido"}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Estado</p>
                            {isEditMode ? (
                                <Input
                                    value={editedEntry.estado ? "Activo" : "Inactivo"}
                                    onChange={(e) => handleInputChange("estado", e.target.value)}
                                />
                            ) : (
                                <p className="font-medium">
                                    {entry.estado ? "Activo" : "Inactivo"}
                                </p>
                            )}
                        </div>
                        <div>
                            {entry.note && entry.note.trim() ? (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-500">Comprobante</p>

                                    {/* Mostrar imágenes existentes */}
                                    <div className="flex flex-wrap gap-2">
                                        {entry.note.trim().split("\n").map((noteUrl, index) => (
                                            <div key={index} className="relative w-28 h-40">
                                                <img
                                                    src={noteUrl}
                                                    alt={`Comprobante ${index + 1}`}
                                                    className="w-full h-full object-cover border rounded-md cursor-pointer"
                                                    onClick={() => openImageModal(noteUrl)} // Lógica para abrir una modal si deseas ver la imagen
                                                />

                                                {/* Mostrar opciones solo si estamos en modo edición */}

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500">Sin comprobantes</p>
                            )}

                            {/* Campo para seleccionar nuevas imágenes solo si estamos editando */}
                            {isEditMode && (
                                <>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageSelection}
                                        className="mb-2"
                                    />

                                    {/* Indicador de carga */}
                                    {isUploading && (
                                        <div className="flex items-center gap-2">
                                            <Spin size="small" />
                                            <span>Subiendo imágenes...</span>
                                        </div>
                                    )}

                                    {/* Mostrar miniaturas de las imágenes subidas */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {imageUrls.length > 0 ? (
                                            imageUrls.map((url, index) => (
                                                <div key={index} className="relative w-16 h-16">
                                                    <img
                                                        src={url}
                                                        alt={`Comprobante ${index + 1}`}
                                                        className="w-full h-full object-cover border rounded-md"
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">Sin comprobantes</p>
                                        )}
                                    </div>
                                </>
                            )}

                        </div>
                    </div>
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
            <div className=" fixed bottom-4 left-0 right-0 bg-white p-4 border-t flex justify-around">
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
                    icon={
                        <DeleteOutlined style={{ fontSize: "2rem", color: "#dc2626" }} />
                    }
                    onClick={showDeleteModal}
                >
                    <span className="text-sm mt-1 font-semibold">Eliminar</span>
                </Button>
            </div>
        </div>

    );
};

export default TransactionDetailModal;
