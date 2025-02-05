import React, { useState } from 'react';
import { Button, Table, Input, Tooltip, Drawer } from 'antd';
import { format as formatDate } from 'date-fns';
import _ from 'lodash';
import TransactionDetailsModal from './TransactionDetailsModal';

const TransactionTable = ({ entries, categories = [], accounts = [], onOpenContentModal }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);

    const [searchText, setSearchText] = useState({});

    const handleSearch = (value, dataIndex) => {
        setSearchText((prev) => ({
            ...prev,
            [dataIndex]: value.toLowerCase(),
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Sin categoría";
    };

    const getAccountName = (accountId) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.name : 'Cuenta no encontrada';
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
            sorter: (a, b) => a.description.localeCompare(b.description),
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.description && record.description.toLowerCase().includes(searchText["description"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Cuenta de Origen
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "from_account_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "from_account_id",
            key: "from_account_id",

            filterSearch: true,
            render: (id) => getAccountName(id),
            sorter: (a, b) => getAccountName(a.from_account_id).localeCompare(getAccountName(b.from_account_id)),
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.from_account_id && record.from_account_id.toLowerCase().includes(searchText["from_account_id"] || ""),
        },

        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Cuenta de Destino
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "to_account_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "to_account_id",
            key: "to_account_id",
            render: (id) => getAccountName(id),
            sorter: (a, b) => getAccountName(a.to_account_id).localeCompare(getAccountName(b.to_account_id)),
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.to_account_id && record.to_account_id.toLowerCase().includes(searchText["to_account_id"] || ""),
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
                record.amount && record.amount.toLowerCase().includes(searchText["amount"] || ""),
        },

        {

            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Comprobante
                </div>
            ),
            dataIndex: "voucher",
            key: "voucher",
            filterSearch: true,
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

    const openDrawer = (images) => {
        setSelectedImages(images);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setSelectedImages([]);
        setIsDrawerOpen(false);
    };

    const openModal = (entry) => {
        setSelectedEntry(entry);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedEntry(null);
        setIsModalOpen(false);
    };
    const downloadImage = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("No se pudo descargar el archivo.");
            }
            const blob = await response.blob();

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = url.split("/").pop(); // Usa el nombre original de la imagen
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Limpia la URL temporal
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error al descargar el archivo:", error);
        }
    };
    const downloadAllImages = async (urls) => {
        try {
            await Promise.all(urls.map((url) => downloadImage(url))); // Llama a downloadImage para cada URL
        } catch (error) {
            console.error("Error al descargar las imágenes:", error);
        }
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
                    rowClassName="clickable-row"
                    onRow={(record) => ({
                        onClick: () => openModal(record),
                    })}
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

            <TransactionDetailsModal
                isOpen={isModalOpen}
                onClose={closeModal}
                entry={selectedEntry}
                getCategoryName={getCategoryName}
                getAccountName={getAccountName}
                formatCurrency={formatCurrency}
            />
        </>
    );
};

export default TransactionTable;
