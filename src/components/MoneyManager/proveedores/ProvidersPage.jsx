import React, { useState, useEffect } from "react";
import ProvidersTable from "./ProvidersTable"; // Tu componente de la tabla
import AddProviderModal from "./AddProvider"; // Tu componente del modal
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

const ProvidersPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [providers, setProviders] = useState([]);

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

    const handleAddProvider = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);

    const handleProviderAdded = async () => {
        await fetchProviders(); // Refresca los proveedores después de agregar uno nuevo
        setIsModalOpen(false); // Cierra el modal
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
                onDelete={fetchProviders} // Puedes reemplazarlo por una función más específica
                onEdit={(provider) => console.log("Editar proveedor:", provider)}
                onView={(provider) => console.log("Ver detalles del proveedor:", provider)}
            />

            {/* Modal de registro */}
            <AddProviderModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onProviderAdded={handleProviderAdded}
            />
        </div>
    );
};

export default ProvidersPage;
