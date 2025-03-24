import React, { useState, useEffect } from "react";
import { Table, Input, Button, Checkbox,Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import Swal from "sweetalert2";
import AccionesTerceros from "../AccionesTerceros";

const CajerosTable = ({ activeTab }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [searchText, setSearchText] = useState({});
    const [showFilters, setShowFilters] = useState(false);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [entriesLoading, setEntriesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cashiers, setCashiers] = useState([]);

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchCashiers();
    }, []);

    const fetchCashiers = async () => {
        setEntriesLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
            const response = await axios.get(`${API_BASE_URL}/cajeros`);
            const cashiersArray = response.data.data || [];

            // Mapear los datos al formato esperado por la tabla
            const mappedCashiers = cashiersArray.map(cashier => ({
                id: cashier.id_cajero, // Necesitamos un ID único para rowKey
                nombre: cashier.nombre,
                municipio: cashier.municipio, // Asegúrate que estos campos existan en tu API
                responsable: cashier.responsable,
                direccion: cashier.direccion // Asegúrate que estos campos existan en tu API
            }));

            setCashiers(mappedCashiers);
            setFilteredEntries(mappedCashiers); // Actualizar filteredEntries con los datos
        } catch (error) {
            console.error('Error al obtener los cajeros:', error);
            setError('No se pudieron cargar los cajeros');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los cajeros. Por favor, intente de nuevo.',
            });
        } finally {
            setEntriesLoading(false);
        }
    };

    // Filtrado por búsqueda
    useEffect(() => {
        const filtered = cashiers.filter(cashier => {
            return Object.entries(searchText).every(([key, value]) => {
                if (!value) return true;
                return String(cashier[key] || '').toLowerCase().includes(value);
            });
        });
        setFilteredEntries(filtered);
    }, [searchText, cashiers]);

    const handleSearch = (value, dataIndex) => {
        setSearchText(prev => ({
            ...prev,
            [dataIndex]: value.toLowerCase(),
        }));
    };

    const columns = [
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Nombre
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "cashier_id")}
                        style={{
                            marginTop: 2,
                            padding: 4,
                            height: 28,
                            fontSize: 12,
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            outline: 'none',
                        }}
                    />
                </div>
            ),
            dataIndex: "nombre",
            key: "nombre",
            sorter: (a, b) => (a.nombre || '').localeCompare(b.nombre || ''),
            render: (cashierId) => <Tag color="purple">{(cashierId)}</Tag>,
            width: 50,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1 }}>
                    Responsable
                    <Input
                        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                        onChange={(e) => handleSearch(e.target.value, "responsable")}
                        style={{
                            marginTop: 2,
                            padding: 4,
                            height: 28,
                            fontSize: 12,
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                        }}
                    />
                </div>
            ),
            dataIndex: "responsable",
            key: "responsable",
            sorter: (a, b) => (a.responsable || '').localeCompare(b.responsable || ''),
            width: 150,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1 }}>
                    Municipio
                    <Input
                        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                        onChange={(e) => handleSearch(e.target.value, "municipio")}
                        style={{
                            marginTop: 2,
                            padding: 4,
                            height: 28,
                            fontSize: 12,
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                        }}
                    />
                </div>
            ),
            dataIndex: "municipio",
            key: "municipio",
            sorter: (a, b) => (a.municipio || '').localeCompare(b.municipio || ''),
            width: 110,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1 }}>
                    Dirección
                    <Input
                        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                        onChange={(e) => handleSearch(e.target.value, "direccion")}
                        style={{
                            marginTop: 2,
                            padding: 4,
                            height: 28,
                            fontSize: 12,
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                        }}
                    />
                </div>
            ),
            dataIndex: "direccion",
            key: "direccion",
            sorter: (a, b) => (a.direccion || '').localeCompare(b.direccion || ''),
            width: 110,
        },

    ];

    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
        columnWidth: 48,
    };

    return (
        <>
            <AccionesTerceros
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                selectedRowKeys={selectedRowKeys}
                activeTab={activeTab}
            />

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded border border-red-200">
                    <p className="font-medium">{error}</p>
                    <Button
                        type="primary"
                        danger
                        onClick={fetchCashiers}
                        className="mt-2"
                    >
                        Reintentar
                    </Button>
                </div>
            )}

            <div className="px-5 py-2 bg-white">
                <Table
                    rowSelection={rowSelection}
                    dataSource={filteredEntries}
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={false}
                    bordered
                    size="middle"
                    loading={entriesLoading}
                    onRow={(record) => ({
                        onClick: (e) => {
                            if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON" && e.target.tagName !== "A") {
                                handleRowClick(record);
                            }
                        },
                    })}
                    rowClassName="hover:bg-gray-50 transition-colors"
                    scroll={{ x: 'max-content' }}
                    summary={pageData => {
                        if (pageData.length === 0) return null;
                        const totalAmount = pageData.reduce((total, item) => total + (item.amount || 0), 0);
                    }}
                />
            </div>
        </>
    );
};

export default CajerosTable;