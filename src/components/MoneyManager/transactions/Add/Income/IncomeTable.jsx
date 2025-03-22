import React, { useState, useEffect } from "react";
import { Table, Input, Drawer, Button, Checkbox, DatePicker, Dropdown, Menu, Card, Tag, Tooltip, Typography, Divider, Select, Row, Col, Statistic } from "antd";
import { format as formatDate, subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DateNavigator from "../DateNavigator";
import axios from "axios";
import {
    LeftOutlined,
    RightOutlined,
    DownloadOutlined,
    FilterOutlined,
    SearchOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import FloatingActionMenu from "../../FloatingActionMenu";
import ViewIncome from "./ViewIncome";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Correct import
import Acciones from "../../Acciones";


const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const IncomeTable = ({ categories = [], accounts = [], activeTab }) => {
    const navigate = useNavigate();

    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [searchText, setSearchText] = useState({});

    // State variables for selection and date filtering
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showFilters, setShowFilters] = useState(false);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [entriesLoading, setEntriesLoading] = useState(true);
    const [entries, setEntries] = useState([]);
    const [error, setError] = useState(null);
    const [typeFilter, setTypeFilter] = useState(null);

    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        return [startOfMonth(today), endOfMonth(today)];
    });


    const renderDate = (date) => {
        try {
            const parsedDate = new Date(date);
            if (isNaN(parsedDate)) {
                return "Fecha inválida";
            }
    
            // Crear un array de los nombres de los meses y días en español
            const meses = [
                "enero", "febrero", "marzo", "abril", "mayo", "junio", 
                "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
            ];
       
       
            // Formatear la fecha
            const dia = parsedDate.getDate(); // Día del mes
            const mes = meses[parsedDate.getMonth()]; // Mes (en español)
            const anio = parsedDate.getFullYear(); // Año
         // Día de la semana
    
            // Retornar la fecha formateada en formato "día de mes de año"
            return ` ${dia} de ${mes} de ${anio}`;
        } catch (error) {
            console.error("Error al formatear la fecha:", error);
            return "Fecha inválida";
        }
    };
    


    const handleMonthChange = (newDate) => {
        if (!newDate) {
            console.warn("Fecha inválida detectada:", newDate);
            return; // Evitamos asignar `false`
        }
        setDateRange([startOfMonth(newDate), endOfMonth(newDate)]);
    };

    const [cashiers, setCashiers] = useState([]);
    const [cashierFilter, setCashierFilter] = useState(null);
    const [monthlyBalance, setMonthlyBalance] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [loadingMonthlyData, setLoadingMonthlyData] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const doc = new jsPDF();
    autoTable(doc, {
        // Table configuration
    });

    const handleEditSelected = () => {
        if (selectedRowKeys.length === 1) {
            navigate(`/index/moneymanager/ingresos/edit/${selectedRowKeys[0]}`, {
                state: { returnTab: activeTab }, // Pasar activeTab como returnTab
            });
        }
    };


    const handleDeleteSelected = () => {
        handleBatchOperation('delete');
    };

    const handleDownloadSelected = () => {
        if (selectedRowKeys.length === 0) {
            Swal.fire({
                title: 'Selección vacía',
                text: 'Por favor, seleccione al menos un registro',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const selectedItems = entries.filter(item => selectedRowKeys.includes(item.id));
        generateInvoicePDF(selectedItems);
    };

    const handleExportSelected = () => {
        handleBatchOperation('export');
    };

    const clearSelection = () => {
        setSelectedRowKeys([]);
    };

    useEffect(() => {
        fetchData();
        fetchCashiers();
    }, []);

    useEffect(() => {
        fetchMonthlyData();
    }, [currentMonth]);

    const fetchCashiers = async () => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
            const response = await axios.get(`${API_BASE_URL}/cajeros`);
            const cashiersArray = response.data.data || [];
            const mappedCashiers = cashiersArray.map(cashier => ({
                id_cajero: cashier.id_cajero,
                nombre: cashier.nombre,
            }));
            setCashiers(mappedCashiers);
        } catch (error) {
            console.error('Error al obtener los cajeros:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los cajeros. Por favor, intente de nuevo.',
            });
        }
    };

    const getCashierName = (cashierId) => {
        const cashier = cashiers.find((cash) => cash.id_cajero === cashierId);
        return cashier ? cashier.nombre : "Cajero no encontrado";
    };

    const simulateLoading = () => {
        setEntriesLoading(true);
        setTimeout(() => {
            setEntriesLoading(false);
        }, 500);
    };

    useEffect(() => {
        let filtered = [...entries];

        if (typeFilter) {
            filtered = filtered.filter(entry => entry.type === typeFilter);
        }

        if (cashierFilter) {
            filtered = filtered.filter(entry => entry.cashier_id === cashierFilter);
        }

        if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);

            if (isValid(startDate) && isValid(endDate)) {
                filtered = filtered.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return isValid(entryDate) && isWithinInterval(entryDate, { start: startDate, end: endDate });
                });
            }
        }

        filtered = filtered.filter(entry =>
            Object.keys(searchText).every(key => {
                if (!searchText[key]) return true;
                if (key === 'category_id') {
                    return getCategoryName(entry[key])
                        .toLowerCase()
                        .includes(searchText[key].toLowerCase());
                }
                if (key === 'account_id') {
                    return getAccountName(entry[key])
                        .toLowerCase()
                        .includes(searchText[key].toLowerCase());
                }
                if (key === 'cashier_id') {
                    return getCashierName(entry[key])
                        .toLowerCase()
                        .includes(searchText[key].toLowerCase());
                }
                return entry[key] ?
                    entry[key].toString().toLowerCase().includes(searchText[key].toLowerCase()) :
                    true;
            })
        );

        setFilteredEntries(filtered);
    }, [entries, searchText, dateRange, typeFilter, cashierFilter, cashiers]);

    const typeOptions = ["arqueo", "otro"];

    const handleTypeFilterChange = (value) => {
        setTypeFilter(value);
    };

    const handleCashierFilterChange = (value) => {
        setCashierFilter(value);
    };

    const handleRowClick = (record) => {
        setSelectedEntry(record);
        setIsViewModalOpen(true);
    };

    const closeModal = () => {
        setIsViewModalOpen(false);
        setSelectedEntry(null);
    };

    const handleSearch = (value, dataIndex) => {
        setSearchText((prev) => ({
            ...prev,
            [dataIndex]: value.toLowerCase(),
        }));
    };

    const fetchData = async () => {
        setEntriesLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
            const response = await axios.get(`${API_BASE_URL}/incomes`);
            
            // Procesar las fechas para manejarlas correctamente
            const processedEntries = response.data.map(entry => {
                // Crear una copia del entry para no mutar el original
                const processedEntry = { ...entry };
                
                // Si la fecha viene con 'Z' al final (UTC), la convertimos a la zona horaria local
                if (typeof processedEntry.date === 'string' && processedEntry.date.endsWith('Z')) {
                    // Mantener la fecha en su formato original sin conversión a UTC
                    processedEntry.date = processedEntry.date.replace('Z', '');
                }
                
                return processedEntry;
            });
            
            // Ordenar las entradas por fecha
            const sortedEntries = processedEntries.sort((a, b) => {
                return b.date.localeCompare(a.date);
            });
            
            setEntries(sortedEntries);
            setFilteredEntries(sortedEntries);
            setError(null);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Error al cargar los datos");
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los datos. Intente nuevamente.',
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
        } finally {
            setEntriesLoading(false);
        }
    };

    const fetchMonthlyData = async () => {
        // Format the current month as yyyy-MM for the API
        const monthYear = formatDate(dateRange[0], "yyyy-MM");
        setLoadingMonthlyData(true);

        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
            const response = await axios.get(`${API_BASE_URL}/balance/month/${monthYear}`);
            const { total_incomes, total_expenses, net_balance } = response.data;
            const balanceValue = parseFloat(net_balance) || 0;
            const incomeValue = parseFloat(total_incomes) || 0;
            const expensesValue = parseFloat(total_expenses) || 0;

            setMonthlyBalance(balanceValue);
            setMonthlyIncome(incomeValue);
            setMonthlyExpenses(expensesValue);
        } catch (err) {
            setError("Error al cargar los datos mensuales");
            console.error("Error fetching monthly data:", err.response ? err.response.data : err.message);
        } finally {
            setLoadingMonthlyData(false);
        }
    };

    const goToPreviousMonth = () => {
        simulateLoading();
        const prevMonth = subMonths(currentMonth, 1);
        setCurrentMonth(prevMonth);
        setDateRange([startOfMonth(prevMonth), endOfMonth(prevMonth)]);
    };

    const goToNextMonth = () => {
        simulateLoading();
        const nextMonth = addMonths(currentMonth, 1);
        setCurrentMonth(nextMonth);
        setDateRange([startOfMonth(nextMonth), endOfMonth(nextMonth)]);
    };

    const goToCurrentMonth = () => {
        simulateLoading();
        const now = new Date();
        setCurrentMonth(now);
        setDateRange([startOfMonth(now), endOfMonth(now)]);
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        columnWidth: 48,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            {
                key: 'none',
                text: 'Deseleccionar todo',
                onSelect: () => setSelectedRowKeys([]),
            },
        ],
    };

    const handleBatchOperation = (operation) => {
        if (selectedRowKeys.length === 0) {
            Swal.fire({
                title: 'Selección vacía',
                text: 'Por favor, seleccione al menos un registro',
                icon: 'warning',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const selectedItems = entries.filter(item => selectedRowKeys.includes(item.id));

        switch (operation) {
            case 'download':
                generateInvoicePDF(selectedItems);
                break;
            case 'delete':
                Swal.fire({
                    title: '¿Está seguro?',
                    text: `¿Desea eliminar ${selectedRowKeys.length} registro(s) seleccionado(s)?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        const deletePromises = selectedRowKeys.map(id => handleDeleteItem(id));

                        Promise.all(deletePromises)
                            .then(() => {
                                Swal.fire(
                                    '¡Eliminado!',
                                    'Los registros han sido eliminados.',
                                    'success'
                                );
                                setSelectedRowKeys([]);
                                fetchData();
                            })
                            .catch(error => {
                                console.error("Error eliminando registros:", error);
                                Swal.fire(
                                    'Error',
                                    'Hubo un problema al eliminar los registros.',
                                    'error'
                                );
                            });
                    }
                });
                break;
            default:
                break;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleDeleteItem = async (id) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
            await axios.delete(`${API_BASE_URL}/incomes/${id}`);
            return id;
        } catch (error) {
            console.error(`Error eliminando el ingreso ${id}:`, error);
            throw error;
        }
    };

    const getAccountName = (accountId) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.name : "Cuenta no encontrada";
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Categoría no encontrada";
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

            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Error al descargar el archivo:", error);
        }
    };

    const downloadAllImages = async (urls) => {
        try {
            await Promise.all(urls.map((url) => downloadImage(url)));
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
    
    // New function to generate the PDF invoice
    const generateInvoicePDF = (items) => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("FACTURA", 105, 20, { align: "center" });

        // Company Info (customize as needed)
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Nombre de la Empresa", 14, 30);
        doc.text("NIT: 123456789-0", 14, 36);
        doc.text("Dirección: Calle 123 #45-67, Bogotá, Colombia", 14, 42);
        doc.text("Teléfono: +57 123 456 7890", 14, 48);

        // Invoice Info
        doc.text(`Fecha: ${formatDate(new Date(), "d MMMM yyyy", { locale: es })}`, 140, 30);
        doc.text(`Factura N°: ${Math.floor(Math.random() * 1000000)}`, 140, 36); // Random invoice number

        // Table of Items
        const tableData = items.map(item => [
            item.arqueo_number || "N/A",
            item.description,
            renderDate(item.date),
            getAccountName(item.account_id),
            getCashierName(item.cashier_id),
            formatCurrency(item.amount),
            renderDate(item.start_period),
            renderDate(item.end_period)
        ]);

        // Use autoTable as a function
        autoTable(doc, {
            startY: 60,
            head: [['N° Arqueo', 'Descripción', 'Fecha', 'Cuenta', 'Cajero', 'Monto', 'Desde', 'Hasta']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 2 },
            headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 40 },
                2: { cellWidth: 20 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 },
                6: { cellWidth: 20 },
                7: { cellWidth: 20 },
            },
        });

        // Total
        const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        doc.setFontSize(12);
        doc.text(`Total: ${formatCurrency(totalAmount)}`, 140, doc.lastAutoTable.finalY + 10);

        // Footer
        doc.setFontSize(10);
        doc.text("Gracias por su negocio", 105, 280, { align: "center" });
        doc.text("Este documento no tiene validez fiscal", 105, 286, { align: "center" });

        // Save the PDF
        doc.save(`Factura_Ingresos_${formatDate(new Date(), "yyyy-MM-dd")}.pdf`);
    };

    const columns = [
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Fecha y Hora
                    <input
                        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                        onChange={(e) => handleSearch(e.target.value, "date")}
                        style={{
                            marginTop: 2,
                            padding: 4,
                            height: 28,
                            fontSize: 12,
                            border: "1px solid #d9d9d9",
                            borderRadius: 4,
                            outline: "none",
                        }}
                    />
                </div>
            ),
            dataIndex: "date",
            key: "date",
            render: (text) => renderDate(text),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            sortDirections: ["descend", "ascend"],
            width: 180, // Aumentamos el ancho para dar espacio a la hora
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    N° Arqueo
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "arqueo_number")}
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
            dataIndex: "arqueo_number",
            key: "arqueo_number",
            sorter: (a, b) => a.arqueo_number - b.arqueo_number,
            render: (text) => <a>{text || "No disponible"}</a>,
            width: 110,
        },

        {
            title: (
                <div className="flex flex-col" style={{ margin: "2px 0", gap: 1, lineHeight: 1 }}>
                    Titulo
                    <input
                        prefix={<SearchOutlined style={{ color: '#d9d9d9' }} />}
                        onChange={(e) => handleSearch(e.target.value, "description")}
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
            dataIndex: "description",
            key: "description",
            sorter: (a, b) => a.description.localeCompare(b.description),
            sortDirections: ["ascend", "descend"],
            ellipsis: true,
            width: 300,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Cuenta
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "account_id")}
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
            dataIndex: "account_id",
            key: "account_id",
            render: (id) => <Tag color="blue">{getAccountName(id)}</Tag>,
            sorter: (a, b) => getAccountName(a.account_id).localeCompare(getAccountName(b.account_id)),
            sortDirections: ["ascend", "descend"],
            width: 150,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Cajero
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
            dataIndex: "cashier_id",
            key: "cashier_id",
            sorter: (a, b) => getCashierName(a.cashier_id).localeCompare(getCashierName(b.cashier_id)),
            render: (cashierId) => <Tag color="purple">{getCashierName(cashierId)}</Tag>,
            width: 150,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Monto Total
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "amount")}
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
            dataIndex: "amount",
            key: "amount",
            render: (amount) => <span className="font-bold">{formatCurrency(amount)}</span>,
            sorter: (a, b) => a.amount - b.amount,
            sortDirections: ["descend", "ascend"],
            width: 140,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Desde
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "start_period")}
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
            dataIndex: "start_period",
            key: "start_period",
            render: (start_period) => <span className="font-bold">{start_period}</span>,
            sorter: (a, b) => new Date(a.start_period || 0) - new Date(b.start_period || 0),
            sortDirections: ["descend", "ascend"],
            width: 120,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Hasta
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "end_period")}
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
            dataIndex: "end_period",
            key: "end_period",
            render: (end_period) => <span className="font-bold">{end_period}</span>,
            sorter: (a, b) => new Date(a.end_period || 0) - new Date(b.end_period || 0),
            sortDirections: ["descend", "ascend"],
            width: 120,
        },
        {
            title: "Comprobante",
            dataIndex: "voucher",
            key: "voucher",
            render: (vouchers) =>
                Array.isArray(vouchers) && vouchers.length > 0 ? (
                    <Button
                        type="link"
                        onClick={(e) => {
                            e.stopPropagation();
                            openDrawer(vouchers);
                        }}
                    >
                        Ver comprobante
                    </Button>
                ) : (
                    "—"
                ),
            width: 130,
        }
    ];

    return (
        <>
            <Acciones
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                selectedRowKeys={selectedRowKeys}
                handleEditSelected={handleEditSelected}
                handleDeleteSelected={handleDeleteSelected}
                handleDownloadSelected={handleDownloadSelected}
                handleExportSelected={handleExportSelected}
                clearSelection={clearSelection}
                activeTab={activeTab}
                loadingMonthlyData={loadingMonthlyData}
                formatCurrency={formatCurrency}
                monthlyIncome={monthlyIncome}
                monthlyExpenses={monthlyExpenses}
                monthlyBalance={monthlyBalance}
                setDateRange={setDateRange}
                selectList={cashiers}
                setFirstFilter={setCashierFilter}
                firstFilter={cashierFilter}
                firstFilterPlaceholder="Filtrar por cajero"
                typeOptions={["arqueo", "otro"]}
                setTypeFilter={setTypeFilter}
                typeFilter={typeFilter}
                filteredEntries={filteredEntries}
                setSelectedRowKeys={setSelectedRowKeys}
            />

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded border border-red-200">
                    <p className="font-medium">{error}</p>
                    <Button
                        type="primary"
                        danger
                        onClick={fetchData}
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

            <ViewIncome entry={selectedEntry} visible={isViewModalOpen} onClose={closeModal} activeTab={activeTab} />

            <style>
                {`
                .ant-table-cell {
                    padding: 12px !important;
                    font-size: 14px;
                }
                
                .ant-table-thead > tr > th {
                    background-color: #f5f5f5;
                    font-weight: 600;
                }
                
                .ant-table-row:hover {
                    cursor: pointer;
                }
                
                .ant-checkbox-wrapper {
                    cursor: default;
                }
                
                .ant-tag {
                    margin-right: 0;
                }
                
                .ant-input-affix-wrapper {
                    border-radius: 4px;
                }
                
                .ant-card-head {
                    min-height: auto;
                    padding: 0;
                }
                
                .hover\\:bg-gray-50:hover {
                    background-color: #f9f9f9;
                }
                
                .transition-colors {
                    transition: background-color 0.3s ease;
                }
                `}
            </style>

            <Drawer
                visible={isDrawerOpen}
                onClose={closeDrawer}
                placement="right"
                width={420}
                title="Comprobantes de ingresos"
                extra={
                    selectedImages.length > 1 && (
                        <Button
                            type="primary"
                            onClick={() => downloadAllImages(selectedImages)}
                            icon={<DownloadOutlined />}
                        >
                            Descargar todas
                        </Button>
                    )
                }
            >
                <div className="flex flex-col">
                    <div className="flex flex-wrap gap-4 justify-center mb-4">
                        {selectedImages.map((image, index) => (
                            <div key={index} className="relative w-60 h-80">
                                <img
                                    src={image}
                                    alt={`Comprobante ${index + 1}`}
                                    className="w-full h-full object-cover border rounded-md"
                                />
                                <Button
                                    type="primary"
                                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
                                    onClick={() => downloadImage(image)}
                                    icon={<DownloadOutlined />}
                                >
                                    Descargar
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </Drawer>


        </>
    );
};

export default IncomeTable;