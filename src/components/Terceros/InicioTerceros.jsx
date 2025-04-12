import React, { useState, useEffect } from "react";
import { Modal, message, Button, Space, Tooltip, Dropdown } from "antd";
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import ProveedoresTable from "./Proveedores/ProveedoresTable";
import CajerosTable from "./Cajeros/CajerosTable";
import axios from "axios";
import { PlusOutlined, ArrowDownOutlined } from '@ant-design/icons';
import AddCajero from "./Cajeros/NuevoCajero";
import AddProvider from "./Proveedores/AddProvider";

const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

const InicioTerceros = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "cajeros");
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedVoucherContent, setSelectedVoucherContent] = useState("");
  const [error, setError] = useState(null);
  const [isAddCajeroOpen, setIsAddCajeroOpen] = useState(false);
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false); // Nuevo estado para el modal de proveedor
  const [cajeros, setCajeros] = useState([]);

  const tabToEndpoint = {
    cajeros: "/cajeros",
    proveedores: "/providers",
  };

  const fetchData = async (endpoint) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      return response.data.data || [];
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
      return [];
    }
  };

  const fetchCajeros = async () => {
    const data = await fetchData(tabToEndpoint.cajeros);
    setCajeros(data);
  };

  useEffect(() => {
    if (activeTab === "cajeros") {
      fetchCajeros();
    }
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [activeTab, location.state]);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleCashierAdded = () => {
    setIsAddCajeroOpen(false);
    fetchCajeros(); // Refrescar la lista de cajeros
  };

  const handleProviderAdded = () => {
    setIsAddProviderOpen(false);
    // Aquí podrías agregar una función para refrescar la lista de proveedores si la tienes
  };

  const menuItems = [
    {
      key: "cajero",
      label: "Crear Nuevo Cajero",
      onClick: () => setIsAddCajeroOpen(true),
      style: { padding: "8px 16px", fontSize: "14px" },
    },
    {
      key: "proveedor",
      label: "Crear Nuevo Proveedor",
      onClick: () => navigate("/index/terceros/nuevoproveedores"), // Cambiado para abrir el modal
      style: { padding: "8px 16px", fontSize: "14px" },
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      <div className="px-4 bg-white sticky z-10 shadow-sm">
        <div className="max-w-full mx-auto py-2">
          <div className="flex justify-between items-center border-b-3 border-gray-300">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm">Área de Terceros</span>
                <h2 className="text-2xl font-bold">GESTIÓN DE TERCEROS</h2>
              </div>
            </div>
            <div className="flex justify-between items-center border-b-3 border-gray-300">
              <Space size="middle">
                <Dropdown
                  menu={{ items: menuItems }}
                  trigger={['click']}
                >
                  <Tooltip title="Crear Tercero">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      style={{
                        backgroundColor: "#0052CC",
                        borderColor: "#0052CC",
                        borderRadius: "4px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 16px",
                        height: "40px",
                        fontSize: "14px",
                        fontWeight: 500,
                        transition: "all 0.3s ease",
                      }}
                      className="hover:opacity-90 hover:scale-102 transition-transform"
                      aria-label="Crear nuevo tercero"
                    >
                      Nuevo Tercero <ArrowDownOutlined />
                    </Button>
                  </Tooltip>
                </Dropdown>
              </Space>
            </div>
          </div>

          <div className="mt-[-1em] border-b-4 border-gray-300">
            <div className="flex overflow-x-auto">
              <div
                className={`py-2 px-4 cursor-pointer border-b-4 transition-colors duration-200 ${activeTab === "cajeros"
                  ? "border-blue-500 text-blue-500 font-semibold"
                  : "border-transparent text-gray-800 hover:border-blue-300 hover:text-blue-400"
                  }`}
                onClick={() => handleTabChange("cajeros")}
              >
                Cajeros
              </div>
              <div
                className={`py-2 px-4 cursor-pointer border-b-4 transition-colors duration-200 ${activeTab === "proveedores"
                  ? "border-blue-500 text-blue-500 font-semibold"
                  : "border-transparent text-gray-800 hover:border-blue-300 hover:text-blue-400"
                  }`}
                onClick={() => handleTabChange("proveedores")}
              >
                Proveedores
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shadow-lg overflow-auto">
        <div className="max-w-full mx-auto">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          {activeTab === "cajeros" && (
            <CajerosTable activeTab={activeTab} cajeros={cajeros} />
          )}

          {activeTab === "proveedores" && (
            <ProveedoresTable activeTab={activeTab} />
          )}
        </div>
      </div>

      <Modal
        title="Contenido del Voucher"
        open={isContentModalOpen}
        onCancel={() => setIsContentModalOpen(false)}
        footer={null}
      >
        <p>{selectedVoucherContent}</p>
      </Modal>

      <AddCajero
        onCashierAdded={handleCashierAdded}
        cashierToEdit={null}
        visible={isAddCajeroOpen}
        onClose={() => setIsAddCajeroOpen(false)}
      />

      <AddProvider
        onProviderAdded={handleProviderAdded}
        providerToEdit={null}
        visible={isAddProviderOpen}
        onClose={() => setIsAddProviderOpen(false)}
      />
    </div>
  );
};

export default InicioTerceros;