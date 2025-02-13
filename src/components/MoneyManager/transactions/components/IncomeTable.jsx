import React, { useState } from "react";
import { Table, Input, Drawer, Button } from "antd";
import { format as formatDate } from "date-fns";
import IncomeDetailModal from "./IncomeDetailsModal";
import { useNavigate } from "react-router-dom";


const IncomeTable = ({ onDelete, entries, categories = [], accounts = [] }) => {
    const navigate = useNavigate();


    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [searchText, setSearchText] = useState({});

    const handleRowClick = (record) => {
        navigate(`/index/moneymanager/ingresos/view/${record.id}`);
    };

    const handleSearch = (value, dataIndex) => {
        setSearchText((prev) => ({
            ...prev,
            [dataIndex]: value.toLowerCase(),
        }));
    };

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



    const openDrawer = (images) => {
        setSelectedImages(images);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedImages([]);
    };

    const renderDate = (date) => {
        try {
            // Asegurarse de que la fecha sea válida
            const parsedDate = new Date(date);

            if (isNaN(parsedDate.getTime())) {
                return "Fecha inválida"; // Retorna "Fecha inválida" si la fecha es inválida
            }

            return formatDate(parsedDate, "d MMM yyyy"); // Formatea la fecha solo si es válida
        } catch (error) {
            console.error("Error al formatear la fecha:", error);
            return "Fecha inválida"; // Valor predeterminado en caso de error
        }
    };

    const columns = [
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    N° de Arqueo
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "category_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "arqueo_number",
            key: "arqueo_number",
            sorter: (a, b) => a.arqueo_number - b.arqueo_number,
            render: (text) => text || "No disponible",
            onFilter: (value, record) =>
                record.arqueo_number.toString().toLowerCase().includes(searchText["arqueo_number"] || ""),
        },
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
            dataIndex: "date",
            key: "date",
            render: (text) => renderDate(text),
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
            render: (id) => getAccountName(id),
            sorter: (a, b) => getAccountName(a.account_id).localeCompare(getAccountName(b.account_id)),
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                getAccountName(record.account_id)
                    .toLowerCase()
                    .includes(searchText["account_id"] || ""),
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
            dataIndex: "category_id",
            key: "category_id",
            render: (id) => getCategoryName(id),
            sorter: (a, b) => getCategoryName(a.category_id).localeCompare(getCategoryName(b.category_id)),
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                getCategoryName(record.category_id)
                    .toLowerCase()
                    .includes(searchText["category_id"] || ""),
        },

        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Cajero
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "category_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "cashier_name",
            key: "cashier_name",
            sorter: (a, b) => a.cashier_name.localeCompare(b.cashier_name),
            render: (text) => text || "No disponible",
            onFilter: (value, record) =>
                record.cashier_name.toString().toLowerCase().includes(searchText["cashier_name"] || ""),
        },

        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Otros Ingresos
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "category_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "other_income",
            key: "other_income",
            sorter: (a, b) => a.other_income - b.other_income,
            render: (amount) => formatCurrency(amount),
            onFilter: (value, record) =>
                record.other_income.toString().toLowerCase().includes(searchText["other_income"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Dinero Recibido
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "category_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "cash_received",
            key: "cash_received",
            sorter: (a, b) => a.cash_received - b.cash_received,
            render: (amount) => formatCurrency(amount),
            onFilter: (value, record) =>
                record.cash_received.toString().toLowerCase().includes(searchText["cash_received"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Comisión Cajero
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "category_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "cashier_commission",
            key: "cashier_commission",
            sorter: (a, b) => a.cashier_commission - b.cashier_commission,
            render: (amount) => formatCurrency(amount),
            onFilter: (value, record) =>
                record.cashier_commission.toString().toLowerCase().includes(searchText["cashier_commission"] || ""),
        },
        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Inicio del Periodo
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "start_period")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "start_period",
            key: "start_period",
            render: (text) => renderDate(text), // Usamos la función renderDate para validación y formato
            onFilter: (value, record) =>
                record.start_period && record.start_period.toString().toLowerCase().includes(searchText["start_period"] || ""),
        },

        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Fin del Periodo
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "end_period")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "end_period",
            key: "end_period",
            render: (text) => renderDate(text), // Usamos la función renderDate para validación y formato
            onFilter: (value, record) =>
                record.end_period && record.end_period.toString().toLowerCase().includes(searchText["end_period"] || ""),
        },

        {
            title: (
                <div className="flex flex-col " style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Monto Total
                    <Input
                        placeholder="Buscar"
                        onChange={(e) => handleSearch(e.target.value, "amount")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                    />
                </div>
            ),
            dataIndex: "amount",
            key: "amount",
            render: (amount) => formatCurrency(amount),
            sorter: (a, b) => a.amount - b.amount,
            sortDirections: ["descend", "ascend"],
            onFilter: (value, record) =>
                record.amount.toString().toLowerCase().includes(searchText["amount"] || ""),
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

    return (
        <>
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
                    onClick: () => handleRowClick(record),
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
            <Drawer
                visible={isDrawerOpen}
                onClose={closeDrawer}
                placement="right"
                width={420}
            >
                <div className="flex flex-col ">
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
