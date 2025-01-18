import React, { useState } from "react";
import { Table, Button, Drawer, Tooltip } from "antd";
import { format as formatDate } from "date-fns";
import IncomeDetailModal from "./IncomeDetailsModal";


const IncomeTable = ({ onDelete, entries, categories = [], accounts = [] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
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
    const downloadImage = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("No se pudo descargar el archivo.");
            }
            const blob = await response.blob();

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = url.split("/").pop();
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

    const openModal = (entry) => {
        setSelectedEntry(entry);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEntry(null);
    };

    const openDrawer = (images) => {
        setSelectedImages(images);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedImages([]);
    };

    // Definición de las columnas con filtros, búsqueda y ordenación
    const columns = [
        {
            title: "Fecha",
            dataIndex: "date",
            key: "date",
            filterSearch: true,
            filters: [...new Set(entries.map((entry) => formatDate(new Date(entry.date), "d MMM yyyy")))].map((formattedDate) => ({
                text: formattedDate,
                value: formattedDate,
            })),
            render: (text) => formatDate(new Date(text), "d MMM yyyy"),
            sorter: (a, b) => new Date(a.date) - new Date(b.date), // Orden cronológico
            sortDirections: ["descend", "ascend"], // De más reciente a más antiguo
        },
        {
            title: "Descripción",
            dataIndex: "description",
            key: "description",
            filterSearch: true,
            filters: [...new Set(entries.map((entry) => entry.description))].map((desc) => ({
                text: desc,
                value: desc,
            })),
            onFilter: (value, record) => record.description.includes(value), // Filtro por texto
            sorter: (a, b) => a.description.localeCompare(b.description), // A-Z
            sortDirections: ["ascend", "descend"], // Orden alfabético
        },
        {
            title: "Cuenta",
            dataIndex: "account_id",
            key: "account_id",
            filterSearch: true,
            render: (id) => getAccountName(id),
            filters: [...new Set(entries.map((entry) => getAccountName(entry.account_id)))].map((name) => ({
                text: name,
                value: name,
            })),
            onFilter: (value, record) => getAccountName(record.account_id) === value, // Filtro exacto
            sorter: (a, b) => getAccountName(a.account_id).localeCompare(getAccountName(b.account_id)), // A-Z
            sortDirections: ["ascend", "descend"],
        },
        {
            title: "Categoría",
            dataIndex: "category_id",
            key: "category_id",
            filterSearch: true,
            render: (id) => getCategoryName(id),
            filters: [...new Set(entries.map((entry) => getCategoryName(entry.category_id)))].map((name) => ({
                text: name,
                value: name,
            })),

            onFilter: (value, record) => getCategoryName(record.category_id) === value,
            sorter: (a, b) => getCategoryName(a.category_id).localeCompare(getCategoryName(b.category_id)),
            sortDirections: ["ascend", "descend"],
        },
        {
            title: "Monto Total",
            dataIndex: "amount",
            key: "amount",
            filterSearch: true,
            filters: [...new Set(entries.map((entry) => entry.amount))].map((amount) => ({
                text: formatCurrency(amount),
                value: amount,
            })),
            onFilter: (value, record) => record.amount === value,
            render: (amount) => formatCurrency(amount),
            sorter: (a, b) => a.amount - b.amount,
            sortDirections: ["descend", "ascend"],
        },
        {
            title: "Comprobante",
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

    return (
        <>
            <Table
                dataSource={entries}
                columns={columns}
                rowKey={(record) => record.id}
                pagination={{ pageSize: 10 }}
                bordered
                onRow={(record) => ({
                    onClick: () => openModal(record),
                })}

            />
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
                        <Button
                            type="primary"
                            onClick={() => downloadAllImages(selectedImages)}
                            className="text-white bg-green-600"
                        >
                            Descargar todas
                        </Button>
                    )}
                    <Button key="close" onClick={closeDrawer} className="mt-4">
                        Cerrar
                    </Button>
                </div>
            </Drawer>
            <IncomeDetailModal
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

export default IncomeTable;
