import React, { useState, useEffect } from 'react';
import { Button, Table, Input, Tooltip, Dropdown, Menu, Drawer } from 'antd';
import { format as formatDate } from 'date-fns';
import _ from 'lodash';
import ExpenseDetailModal from './ExpenseDetailModal';
import axios from "axios";
const ExpenseTable = ({
    entries,
    categories = [],
    accounts = [],
    onDelete,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [providers, setProviders] = useState({});
    const [searchText, setSearchText] = useState({});
    const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/providers`);
                const data = response.data;
                const providerMap = data.reduce((acc, provider) => {
                    acc[provider.id] = provider.razon_social || provider.nombre_comercial || "Proveedor no encontrado";
                    return acc;
                }, {});
                setProviders(providerMap);
            } catch (error) {
                console.error('Error obteniendo proveedores:', error);
            }
        };

        fetchProviders();
    }, []);

    const handleSearch = (value, dataIndex) => {
        setSearchText((prev) => ({
            ...prev,
            [dataIndex]: value.toLowerCase(),
        }));
    };


    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Sin categoría";
    };

    const getAccountName = (accountId) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.name : "Cuenta no encontrada";
    };

    const columns = [
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Fecha
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "date")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: 'date',
            key: 'date',
            filterSearch: true,
            render: (text) => formatDate(new Date(text), "d MMM yyyy"),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            sortDirections: ["descend", "ascend"],
            onFilter: (value, record) =>
                record.date && record.date.toLowerCase().includes(searchText["date"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Descripción
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "description")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "description",
            key: "description",
            sorter: (a, b) => a.amount - b.amount,
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.description &&
                record.description.toLowerCase().includes(searchText["description"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Cuenta
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "account_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "account_id",
            key: "account_id",
            sorter: (a, b) => getAccountName(a.account_id).localeCompare(getAccountName(b.account_id)),
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.account_id &&
                record.account_id.toLowerCase().includes(searchText["account_id"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Categoría
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "category_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: 'category_id',
            key: 'category_id',
            sorter: (a, b) => getAccountName(a.category_id).localeCompare(getAccountName(b.category_id)),
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.category_id &&
                record.category_id.toLowerCase().includes(searchText["category_id"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Monto
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "amount")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: 'amount',
            key: "amount",
            render: (amount) => formatCurrency(amount),
            sorter: (a, b) => a.amount - b.amount,
            sortDirections: ["descend", "ascend"],
            onFilter: (value, record) =>
                record.amount &&
                record.amount.toLowerCase().includes(searchText["amount"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Impuestos
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "tax_type")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: 'tax_type',
            key: 'tax_type',
            sorter: (a, b) => a.amount - b.amount,
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.tax_type &&
                record.tax_type.toLowerCase().includes(searchText["tax_type"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Proveedor
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "provider_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: 'provider_id',
            render: (id) => providers[id] || "Proveedor no encontrado",
            sorter: (a, b) => a.provider_id - b.provider_id,
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.provider_id &&
                record.provider_id.toLowerCase().includes(searchText["provider_id"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Retención
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "retention_type")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: 'retention_type',
            key: 'retention_type',
            render: (retention) => (
                <span>{retention || 'Sin información'}</span>
            ),
            sorter: (a, b) => {
                if (!a.retention_type) return 1;
                if (!b.retention_type) return -1;
                return a.retention_type.localeCompare(b.retention_type);
            },
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.retention_type &&
                record.retention_type.toLowerCase().includes(searchText["retention_type"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Estado
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "estado")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: 'estado',
            key: 'estado',
            render: (estado) => (
                <span>{estado ? 'Activo' : 'Inactivo'}</span> // Muestra 'Activo' si estado es true, 'Inactivo' si es false
            ),
            sorter: (a, b) => a.estado - b.estado,
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.estado &&
                record.estado.toLowerCase().includes(searchText["estado"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Comprobante
                </div>
            ),
            dataIndex: "voucher",
            key: "voucher",
            render: (vouchers) =>
                Array.isArray(vouchers) && vouchers.length > 0 ? (
                    <a
                        onClick={(e) => {
                            e.stopPropagation();
                            openDrawer(vouchers);
                        }}
                        className="text-blue-500 underline"
                    >
                        Ver comprobante
                    </a>
                ) : (
                    "—"
                ),
        },
    ];
    const openModal = (entry) => {
        setSelectedEntry(entry);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEntry(null);
    };
    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedImages([]);
    };
    const openDrawer = (images) => {
        setSelectedImages(images);
        setIsDrawerOpen(true);
    };


    return (
        <>
            <div className="overflow-auto h-[39em]">
                <Table
                    dataSource={entries.filter((entry) =>
                        Object.keys(searchText).every((key) =>
                            entry[key] ? entry[key].toString().toLowerCase().includes(searchText[key]) : true
                        )
                    )}
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={{ pageSize: 10 }}
                    bordered
                    onRow={(record) => ({
                        onClick: () => openModal(record),
                    })}
                    rowClassName="clickable-row"
                />
                <style>
                    {`
                .ant-table-cell {
                    padding: 8px !important;  /* 🔹 Reduce el padding de las celdas */
                    font-size: 14px; /* 🔹 Reduce el tamaño del texto */
                }

                .compact-row {
                    height: 24px !important; /* 🔹 Reduce la altura de la fila */
                }
                `}
                </style>
                <style jsx>{`.clickable-row {cursor: pointer;}`}</style>

            </div>
            <Drawer
                visible={isDrawerOpen}
                onClose={closeDrawer}
                placement="right"
                width={420}
            >
                <div className="flex flex-col items-center">
                    <h1 className="mb-8">Comprobantes de ingresos</h1>
                    <div className="flex flex-wrap gap-4 justify-center mb-4">
                        {selectedImages.map((image, index) => (
                            <div key={index} className="relative w-60 h-80">
                                <img
                                    src={image}
                                    alt={`Comprobante ${index + 1}`}
                                    className="w-full h-full object-cover border rounded-md"
                                />
                                <Button
                                    type="link"
                                    className="mx-20 absolute bottom-2 text-white bg-green-600"
                                    onClick={() => downloadImage(image)}
                                >
                                    Descargar
                                </Button>
                            </div>
                        ))}
                    </div>
                    {selectedImages.length > 1 && (
                        <Button type="primary" onClick={() => downloadAllImages(selectedImages)} className=" text-white bg-green-600">
                            Descargar todas
                        </Button>
                    )}
                    <Button key="close" onClick={closeDrawer} className="mt-4">
                        Cerrar
                    </Button>
                </div>
            </Drawer>
            {/* Modal de detalles */}
            <ExpenseDetailModal
                isOpen={isModalOpen}
                onClose={closeModal}
                entry={selectedEntry}
                getCategoryName={getCategoryName}
                getAccountName={getAccountName}
                formatCurrency={formatCurrency}
                onDelete={onDelete}
            />
        </>
    );
};

export default ExpenseTable;
