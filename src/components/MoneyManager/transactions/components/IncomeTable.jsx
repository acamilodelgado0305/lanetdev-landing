import React, { useState } from "react";
import { Button, Dropdown, Menu, Tooltip, Modal, Drawer } from "antd";
import { format as formatDate } from "date-fns";
import { FilterOutlined, CaretDownOutlined } from "@ant-design/icons";
import _ from "lodash";
import TransactionDetailModal from "./TransactionDetailsModal";

const IncomeTable = ({ entries, categories = [], accounts = [] }) => {
    const [columnFilters, setColumnFilters] = useState({});
    const [hoveredRow, setHoveredRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);


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
            link.download = "comprobante.jpg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Limpia la URL temporal
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error al descargar el archivo:", error);
        }
    };
    const getUniqueValues = (field) => {
        return _.uniq(
            entries.map((entry) => {
                if (field === "category") return getCategoryName(entry.category_id);
                if (field === "account") return getAccountName(entry.account_id);
                return entry[field];
            })
        ).filter(Boolean);
    };

    const getFilterMenu = (field) => (
        <Menu
            items={getUniqueValues(field).map((value) => ({
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
                                    newFilters[field] = newFilters[field].filter(
                                        (v) => v !== value
                                    );
                                }
                                if (newFilters[field].length === 0)
                                    delete newFilters[field];
                                setColumnFilters(newFilters);
                            }}
                        />
                        <span className="ml-2">{value}</span>
                    </div>
                ),
            }))}
        />
    );

    const openModal = (entry) => {
        setSelectedEntry(entry);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEntry(null);
    };
    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setSelectedImage(null);
    };
    const openDrawer = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedImage(null);
    };

    const columns = [
        { title: "Fecha", field: "date", width: "100px" },
        { title: "Descripción", field: "description", width: "200px" },
        { title: "Cuenta", field: "account", width: "150px" },
        { title: "Categoría", field: "category", width: "150px" },
        { title: "Monto Total", field: "amount", width: "120px" },
        { title: "Monto FEV", field: "amountfev", width: "120px" },
        { title: "Monto Diverse", field: "amountdiverse", width: "120px" },
        { title: "Tipo", field: "type", width: "100px" },
        { title: "Comprobante", field: "note", width: "120px" },
    ];

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
                                        <span className="text-xs font-medium text-gray-500">
                                            {column.title}
                                        </span>
                                        <Dropdown
                                            overlay={getFilterMenu(column.field)}
                                            trigger={["click"]}
                                        >
                                            <Button
                                                type="text"
                                                size="small"
                                                className="text-gray-400"
                                                icon={<FilterOutlined />}
                                            >
                                                <CaretDownOutlined style={{ fontSize: "10px" }} />
                                            </Button>
                                        </Dropdown>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, rowIndex) => (
                            <Tooltip
                                key={rowIndex}
                                title={`Fila: ${rowIndex + 1}, Descripción: ${entry.description}`}
                                placement="top"
                            >
                                <tr
                                    style={{ cursor: "pointer" }}
                                    className={`border-b hover:bg-gray-50 ${hoveredRow === rowIndex ? "bg-gray-50" : ""
                                        }`}
                                    onMouseEnter={() => setHoveredRow(rowIndex)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    onClick={() => openModal(entry)}
                                >
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {formatDate(new Date(entry.date), "d MMM yyyy")}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {entry.description}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {getAccountName(entry.account_id)}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {getCategoryName(entry.category_id)}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate font-medium text-green-600">
                                        +{formatCurrency(entry.amount)}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate text-blue-600">
                                        +{formatCurrency(entry.amountfev)}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate text-blue-600">
                                        +{formatCurrency(entry.amountdiverse)}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {entry.type}
                                    </td>
                                    <td className="border-r border-gray-200 p-2 truncate">
                                        {entry.note ? (
                                            <a
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDrawer(entry.note);
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
                    <img src={selectedImage} alt="Comprobante" className="w-full h-auto mb-4" />
                    <div className="flex flex-row justify-center space-x-4">
                        <Button
                            type="primary"
                            onClick={() => downloadImage(selectedImage)}
                        >
                            Descargar
                        </Button>
                        <Button key="close" onClick={closeDrawer}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            </Drawer>
            <TransactionDetailModal
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

export default IncomeTable;
