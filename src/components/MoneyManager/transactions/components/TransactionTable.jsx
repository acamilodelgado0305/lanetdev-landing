import React, { useState } from 'react';
import { Button, Table, Tooltip, Drawer } from 'antd';
import { format as formatDate } from 'date-fns';
import _ from 'lodash';
import TransactionDetailsModal from './TransactionDetailsModal';

const TransactionTable = ({ entries, categories = [], accounts = [], onOpenContentModal }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);

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
            title: 'Fecha',
            dataIndex: 'date',
            key: 'date',

            filterSearch: true,
            filters: [...new Set(entries.map((entry) => formatDate(new Date(entry.date), "d MMM yyyy")))].map((formattedDate) => ({
                text: formattedDate,
                value: formattedDate,
            })),
            render: (text) => formatDate(new Date(text), "d MMM yyyy"),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            sortDirections: ["descend", "ascend"],
        },
        {
            title: 'Descripción',
            dataIndex: "description",
            key: "description",

            filterSearch: true,
            filters: [...new Set(entries.map((entry) => entry.description))].map((description) => ({
                text: description,
                value: description,
            })),
            onFilter: (value, record) => record.description === value,
            sorter: (a, b) => a.amount - b.amount,
            sortDirections: ["ascend", "descend"],
        },
        {
            title: 'Cuenta de Origen',
            dataIndex: "from_account_id",
            key: "from_account_id",

            filterSearch: true,
            render: (id) => getAccountName(id),
            filters: [...new Set(entries.map((entry) => getAccountName(entry.from_account_id)))].map((name) => ({
                text: name,
                value: name,
            })),
            onFilter: (value, record) => getAccountName(record.from_account_id) === value,
            sorter: (a, b) => getAccountName(a.from_account_id).localeCompare(getAccountName(b.from_account_id)),
            sortDirections: ["ascend", "descend"],
        },
        {
            title: 'Cuenta de Destino',
            dataIndex: "to_account_id",
            key: "to_account_id",

            filterSearch: true,
            render: (id) => getAccountName(id),
            filters: [...new Set(entries.map((entry) => getAccountName(entry.to_account_id)))].map((name) => ({
                text: name,
                value: name,
            })),
            onFilter: (value, record) => getAccountName(record.to_account_id) === value,
            sorter: (a, b) => getAccountName(a.to_account_id).localeCompare(getAccountName(b.to_account_id)),
            sortDirections: ["ascend", "descend"],
        },
        {
            title: 'Monto',
            dataIndex: 'amount',
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
            dataIndex: "vouchers",
            key: "vouchers",
            filterSearch: true,
            render: (vouchers) =>
                vouchers && Array.isArray(vouchers) && vouchers.length > 0 ? (
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
                    '—'
                ),
        }
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
                    dataSource={entries}
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={{ pageSize: 10 }}
                    bordered
                    rowClassName="clickable-row"
                    onRow={(record) => ({
                        onClick: () => openModal(record),
                    })}
                />
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
