import React, { useState } from 'react';
import { Button, Tooltip, Dropdown, Menu, Drawer } from 'antd';
import { format as formatDate } from 'date-fns';
import {
    FileTextOutlined,
    FilterOutlined,
    CaretDownOutlined
} from '@ant-design/icons';
import _ from 'lodash';
import TransactionDetailsModal from './TransactionDetailsModal';

const TransactionTable = ({
    entries,
    categories = [],
    accounts = [],
    onOpenContentModal,
}) => {
    const [columnFilters, setColumnFilters] = useState({});
    const [hoveredRow, setHoveredRow] = useState(null);
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

    const getUniqueValues = (field) => {
        return _.uniq(entries.map(entry => {
            switch (field) {
                case 'category':
                    return getCategoryName(entry.category_id);
                case 'account':
                    return entry.entryType === "transfer"
                        ? `${getAccountName(entry.from_account_id)} ➡️ ${getAccountName(entry.to_account_id)}`
                        : getAccountName(entry.account_id);
                case 'tax_type':
                    return entry.tax_type || 'No aplica';
                default:
                    return entry[field];
            }
        })).filter(Boolean);
    };

    const getFilterMenu = (field) => (
        <Menu
            items={getUniqueValues(field).map(value => ({
                key: value,
                label: (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={columnFilters[field]?.includes(value)}
                            onChange={(e) => {
                                let newFilters = { ...columnFilters };
                                if (!newFilters[field]) newFilters[field] = [];
                                if (e.target.checked) {
                                    newFilters[field] = [...newFilters[field], value];
                                } else {
                                    newFilters[field] = newFilters[field].filter(v => v !== value);
                                }
                                if (newFilters[field].length === 0) delete newFilters[field];
                                setColumnFilters(newFilters);
                            }}
                        />
                        <span className="ml-2">{value}</span>
                    </div>
                ),
            }))}
        />
    );

    const columns = [
        {
            title: 'Fecha',
            field: 'date',
            width: '100px',
        },
        {
            title: 'Descripción',
            field: 'description',
            width: '200px',
        },
        {
            title: 'Cuenta',
            field: 'account',
            width: '150px',
        },
        {
            title: 'Categoría',
            field: 'category',
            width: '150px',
        },
        {
            title: 'Monto',
            field: 'amount',
            width: '120px',
        },
        {
            title: 'Impuestos',
            field: 'tax_type',
            width: '120px',
        },
        {
            title: 'Comprobante',
            field: 'voucher',
            width: '120px',
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
                <table className="w-full relative table-fixed border-collapse">
                    <thead className="sticky top-0 z-5 bg-white">
                        <tr className="border-b border-gray-200">
                            {columns.map((column) => (
                                <th
                                    key={column.field}
                                    style={{ width: column.width }}
                                    className="border-r border-gray-200 bg-gray-50 p-0"
                                >
                                    <div className="flex items-center justify-between px-3 py-2">
                                        <span className="text-xs font-medium text-gray-500">{column.title}</span>
                                        {column.field !== 'actions' && (
                                            <Dropdown
                                                overlay={getFilterMenu(column.field)}
                                                trigger={['click']}
                                            >
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    className={`flex items-center ${columnFilters[column.field]?.length ? 'text-blue-600' : 'text-gray-400'}`}
                                                    icon={<FilterOutlined />}
                                                >
                                                    <CaretDownOutlined style={{ fontSize: '10px' }} />
                                                </Button>
                                            </Dropdown>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {entries.filter(entry => {
                            return Object.entries(columnFilters).every(([field, values]) => {
                                let cellValue;
                                switch (field) {
                                    case 'category':
                                        cellValue = getCategoryName(entry.category_id);
                                        break;
                                    case 'account':
                                        cellValue = entry.entryType === "transfer"
                                            ? `${getAccountName(entry.from_account_id)} ➡️ ${getAccountName(entry.to_account_id)}`
                                            : getAccountName(entry.account_id);
                                        break;
                                    case 'tax_type':
                                        cellValue = entry.tax_type || 'No aplica';
                                        break;
                                    default:
                                        cellValue = entry[field];
                                }
                                return values.includes(cellValue);
                            });
                        }).map((entry, rowIndex) => (
                            <Tooltip key={rowIndex} title={`Fila: ${rowIndex + 1}, Descripción: ${entry.description}`} placement="top">
                                <tr
                                    className={`border-b hover:bg-gray-50 ${hoveredRow === rowIndex ? 'bg-gray-50' : ''}`}
                                    onMouseEnter={() => setHoveredRow(rowIndex)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    onClick={() => openModal(entry)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {formatDate(new Date(entry.date), "d MMM yyyy")}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {entry.description}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {entry.entryType === "transfer"
                                            ? `${getAccountName(entry.from_account_id)} ➡️ ${getAccountName(entry.to_account_id)}`
                                            : getAccountName(entry.account_id)}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {getCategoryName(entry.category_id)}
                                    </td>
                                    <td className={`border-r border-gray-200 p-2 truncate font-medium ${entry.type === "expense" ? "text-red-600" : "text-green-600"}`}>
                                        {entry.type === "expense" ? "-" : "+"}
                                        {formatCurrency(entry.amount)}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {entry.tax_type === "IVA" ? (
                                            <div>
                                                <span>IVA: </span>
                                                <span className="text-green-600">
                                                    {formatCurrency(entry.amount * 0.19)}
                                                </span>
                                            </div>
                                        ) : (
                                            "No aplica"
                                        )}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {Array.isArray(entry.voucher) && entry.voucher.length > 0 ? (
                                            <a
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const voucherArray = entry.voucher.filter(
                                                        (voucherUrl) => typeof voucherUrl === "string" && voucherUrl.trim() !== ""
                                                    );
                                                    openDrawer(voucherArray);
                                                }}
                                                className="text-blue-500 underline"
                                            >
                                                Ver comprobante
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                </tr>
                            </Tooltip>
                        ))}
                    </tbody>
                </table>
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
                                    className="mx-20 absolute bottom-2   text-white bg-green-600"
                                    onClick={() => downloadImage(image)} // Descarga individual
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
