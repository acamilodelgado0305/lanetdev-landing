import React, { useState } from 'react';
import { Button, Table, Tooltip, Dropdown, Menu, Drawer } from 'antd';
import { format as formatDate } from 'date-fns';
import { FilterOutlined, CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import ExpenseDetailModal from './ExpenseDetailModal';

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
            title: 'Fecha',
            dataIndex: 'date',
            key: 'date',
            width: '100px',
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
            title: 'Descripción',
            dataIndex: "description",
            key: "description",
            width: '250px',
            filterSearch: true,
            filters: [...new Set(entries.map((entry) => entry.description))].map((description) => ({
                text: description,
                value: description,
            })),
            onFilter: (value, record) => record.description.includes(value),
            sorter: (a, b) => getAccountName(a.description).localeCompare(getAccountName(b.description)),
            sortDirections: ["ascend", "descend"],
        },
        {
            title: 'Cuenta',
            dataIndex: "account_id",
            key: "account_id",
            width: '150px',
            filterSearch: true,
            render: (id) => getAccountName(id),
            filters: [...new Set(entries.map((entry) => getAccountName(entry.account_id)))].map((name) => ({
                text: name,
                value: name,
            })),
            onFilter: (value, record) => getAccountName(record.account_id) === value,
            sortDirections: ["ascend", "descend"],
        },
        {
            title: 'Categoría',
            dataIndex: 'category_id',
            key: 'category_id',
            width: '150px',
            filterSearch: true,
            render: (id) => getCategoryName(id),
            filters: [...new Set(entries.map((entry) => getCategoryName(entry.category_id)))].map((name) => ({
                text: name,
                value: name,
            })),
            onFilter: (value, record) => getCategoryName(record.category_id) === value,
            sortDirections: ["ascend", "descend"],
        },
        {
            title: 'Monto',
            dataIndex: 'amount',
            key: "amount",
            width: '150px',
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
            title: 'Impuestos',
            dataIndex: 'tax_type',
            key: 'tax_type',
            width: '120px',
            filterSearch: true,
            filters: [...new Set(entries.map((entry) => entry.tax_type))].map((taxType) => ({
                text: taxType,
                value: taxType,
            })),
            onFilter: (value, record) => record.tax_type === value,
            sorter: (a, b) => a.amount - b.amount,
            sortDirections: ["ascend", "descend"],
        },
        {
            title: 'Proveedor',
            dataIndex: 'provider_id',
            width: '150px',
            filterSearch: true,
            filters: [...new Set(entries.map((entry) => entry.provider_id))].map((provider) => ({
                text: provider,
                value: provider,
            })),
            onFilter: (value, record) => record.provider_id === value,
            sorter: (a, b) => a.amount - b.amount,
            sortDirections: ["ascend", "descend"],
        },
        {
            title: 'Retención',
            dataIndex: 'retention_type',
            key: 'retention_type',
            width: '120px',
            filterSearch: true,
            filters: [...new Set(entries.map((entry) => entry.retention_type))].map((retention) => ({
                text: retention,
                value: retention,
            })),
            onFilter: (value, record) => record.retention_type === value,
            sorter: (a, b) => a.amount - b.amount,
            sortDirections: ["ascend", "descend"],
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            width: '120px',
            filterSearch: true,
            filters: [...new Set(entries.map((entry) => entry.estado))].map((status) => ({
                text: status,
                value: status,
            })),
            onFilter: (value, record) => (record.estado ? 'Sí' : 'No') === value,
            sorter: (a, b) => a.estado - b.estado,
            sortDirections: ["ascend", "descend"],
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
                    dataSource={entries}
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={{ pageSize: 10 }}
                    bordered
                    onRow={(record) => ({
                        onClick: () => openModal(record),
                    })}

                />
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
