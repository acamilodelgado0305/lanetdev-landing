import React, { useState, useEffect } from "react";
import ProvidersTable from "./ProvidersTable";
import AddProviderModal from "./AddProvider";
import ProviderDetailsModal from "./ProviderDetailsModal";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

const ProvidersPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [providers, setProviders] = useState([]);
    const [providerToEdit, setProviderToEdit] = useState(null);
    const [providerToView, setProviderToView] = useState(null);


    // Función para obtener los proveedores
    const fetchProviders = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/providers`);
            setProviders(response.data); // Suponiendo que la respuesta contiene una lista de proveedores
        } catch (error) {
            console.error("Error al obtener los proveedores:", error);
        }
    };

    // Ejecutar fetchProviders al montar el componente
    useEffect(() => {
        fetchProviders();
    }, []);

    // Manejo del modal
    const handleAddProvider = () => {
        setProviderToEdit(null); // Limpiar el estado de edición
        setIsModalOpen(true); // Abrir el modal
    };

    const handleEditProvider = (provider) => {
        setProviderToEdit(provider); // Establecer el proveedor a editar
        setIsModalOpen(true); // Abrir el modal
    };
    const handleViewProvider = (provider) => {
        setProviderToView(provider);
        setIsDetailsModalOpen(true);
    };
    const handleModalClose = () => {
        setProviderToEdit(null);
        setIsModalOpen(false);
    };

    const handleProviderAdded = async () => {
        await fetchProviders();
        handleModalClose();
    };
    const handleDetailsModalClose = () => {
        setProviderToView(null);
        setIsDetailsModalOpen(false);
    };
    const handleDeleteProvider = async (provider) => {
        try {
            await axios.delete(`${API_BASE_URL}/providers/${provider.id}`);
            await fetchProviders();
        } catch (error) {
            console.error("Error al eliminar el proveedor:", error);
        }
    };
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Gestión de Proveedores</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddProvider}
                >
                    Registrar Proveedor
                </Button>
            </div>

            {/* Tabla de proveedores */}
            <ProvidersTable
                providers={providers}
                onDelete={handleDeleteProvider}
                onEdit={handleEditProvider}
                onView={handleViewProvider}
            />

            {/* Modal de registro/edición */}
            <AddProviderModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onProviderAdded={handleProviderAdded}
                providerToEdit={providerToEdit}
            />
            {/* Modal de detalles */}
            <ProviderDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={handleDetailsModalClose}
                provider={providerToView}
            />
        </div>
    );
};

export default ProvidersPage;
