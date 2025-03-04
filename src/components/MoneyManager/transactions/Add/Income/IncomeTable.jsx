import React, { useState, useEffect } from "react";
import { Table, Input, Drawer, Button, Checkbox, DatePicker, Dropdown, Menu, Card, Tag, Tooltip, Space, Typography, Divider, Select, Row, Col, Statistic } from "antd";
import { format as formatDate, subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import {
    LeftOutlined,
    RightOutlined,
    DownloadOutlined,
    FilterOutlined,
    EllipsisOutlined,
    DeleteOutlined,
    ExportOutlined,
    SearchOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    MenuOutlined,
    EditOutlined,
    DollarOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from "@ant-design/icons";
import FloatingActionMenu from "../../FloatingActionMenu";
import ViewIncome from "./ViewIncome";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const IncomeTable = ({ categories = [], accounts = [] }) => {
    const navigate = useNavigate();

    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [searchText, setSearchText] = useState({});

    // State variables for selection and date filtering
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [dateRange, setDateRange] = useState([startOfMonth(new Date()), endOfMonth(new Date())]);
    const [showFilters, setShowFilters] = useState(false);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [entriesLoading, setEntriesLoading] = useState(true);
    const [entries, setEntries] = useState([]);
    const [error, setError] = useState(null);
    const [typeFilter, setTypeFilter] = useState(null);



    const [cashiers, setCashiers] = useState([]);
    const [cashierFilter, setCashierFilter] = useState(null);
    const [monthlyBalance, setMonthlyBalance] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);

    const [loadingMonthlyData, setLoadingMonthlyData] = useState(false);


    //estados para el modal de vista:

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);





    const handleEditSelected = () => {
        if (selectedRowKeys.length === 1) {
            navigate(`/index/moneymanager/ingresos/edit/${selectedRowKeys[0]}`);
        }
    };

    const handleDeleteSelected = () => {
        // Use the existing batch delete logic
        handleBatchOperation('delete');
    };

    const handleDownloadSelected = () => {
        // Use the existing batch download logic
        handleBatchOperation('download');
    };

    const handleExportSelected = () => {
        // Use the existing batch export logic
        handleBatchOperation('export');
    };

    const clearSelection = () => {
        setSelectedRowKeys([]);
    };


    // Fetch data when component mounts
    useEffect(() => {
        fetchData();
        fetchCashiers(); // Add this to fetch cashiers data
    }, []);

    useEffect(() => {
        fetchMonthlyData();
    }, [currentMonth]);


    const fetchCashiers = async () => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_TERCEROS || '/api';
            const response = await axios.get(`${API_BASE_URL}/cajeros`);

            // Acceder al array de cajeros dentro de response.data.data
            const cashiersArray = response.data.data || [];

            // Map only the needed fields
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

    // Simulate loading when changing date or filter
    const simulateLoading = () => {
        setEntriesLoading(true);
        setTimeout(() => {
            setEntriesLoading(false);
        }, 500);
    };

    useEffect(() => {
        let filtered = [...entries];

        // Filter by type
        if (typeFilter) {
            filtered = filtered.filter(entry => entry.type === typeFilter);
        }

        // Filter by cashier
        if (cashierFilter) {
            filtered = filtered.filter(entry => entry.cashier_id === cashierFilter);
        }

        // Filter by date range
        if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);

            // Validate that dates are valid
            if (isValid(startDate) && isValid(endDate)) {
                filtered = filtered.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return isValid(entryDate) && isWithinInterval(entryDate, { start: startDate, end: endDate });
                });
            }
        }

        // Apply search text filters
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

    // Menú desplegable para el filtro de tipo
    const typeOptions = ["arqueo", "otro"]; // Ajusta según los tipos disponibles

    const handleTypeFilterChange = (value) => {
        setTypeFilter(value);
    };


    const handleCashierFilterChange = (value) => {
        setCashierFilter(value);
    };


    useEffect(() => {
        let filtered = [...entries];

        if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);

            // Validate dates are valid
            if (isValid(startDate) && isValid(endDate)) {
                filtered = filtered.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return isValid(entryDate) && isWithinInterval(entryDate, { start: startDate, end: endDate });
                });
            }
        }

        // Apply search text filters
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
    }, [entries, searchText, dateRange, cashiers]);

    // Función para manejar el clic en una fila
    const handleRowClick = (record) => {
        setSelectedEntry(record); // Almacena la entrada seleccionada
        setIsViewModalOpen(true); // Abre el modal
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
            const sortedEntries = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
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
        const monthYear = formatDate(currentMonth, "yyyy-MM");
        setLoadingMonthlyData(true);

        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
            const response = await axios.get(`${API_BASE_URL}/balance/month/${monthYear}`);

            // Extract and parse the financial data
            const { total_incomes, total_expenses, net_balance } = response.data;
            const balanceValue = parseFloat(net_balance) || 0;
            const incomeValue = parseFloat(total_incomes) || 0;
            const expensesValue = parseFloat(total_expenses) || 0;

            // Update state with the fetched values
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


    // Month navigation handlers
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

    /*const handleDateRangeChange = (dates) => {
        simulateLoading();
        if (dates && dates.length === 2) {
            setDateRange([dates[0].toDate(), dates[1].toDate()]);
        } else {
            setDateRange(null);
        }
    };*/

    // Row selection handlers
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

    // Batch operations with selected rows
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
                // Logic to download all vouchers from selected items
                const allVouchers = selectedItems.flatMap(item => item.voucher || []);
                if (allVouchers.length > 0) {
                    downloadAllImages(allVouchers);
                } else {
                    Swal.fire({
                        title: 'Sin comprobantes',
                        text: 'No hay comprobantes disponibles para descargar',
                        icon: 'info',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'Entendido'
                    });
                }
                break;
            case 'export':
                // Export selected items to CSV or Excel
                console.log("Exportar seleccionados:", selectedItems);
                // Add your export logic here
                break;
            case 'edit':
                // Navigate to edit page for the selected item (only works with one selection)
                if (selectedRowKeys.length > 1) {
                    Swal.fire({
                        title: 'Múltiples selecciones',
                        text: 'Solo puede editar un registro a la vez',
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'Entendido'
                    });
                } else {
                    navigate(`/index/moneymanager/ingresos/edit/${selectedRowKeys[0]}`);
                }
                break;
            case 'delete':
                // Delete selected items
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
                        // Call delete function for each selected ID
                        const deletePromises = selectedRowKeys.map(id => handleDeleteItem(id));

                        Promise.all(deletePromises)
                            .then(() => {
                                Swal.fire(
                                    '¡Eliminado!',
                                    'Los registros han sido eliminados.',
                                    'success'
                                );
                                setSelectedRowKeys([]);
                                // Refresh data after deletion
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
            return id; // Return the id for confirmation
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

            // Limpia la URL temporal
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

    const renderDate = (date) => {
        try {
            // Convierte la fecha a UTC (sin aplicar el ajuste automático de zona horaria)
            const parsedDate = DateTime.fromISO(date, { zone: 'utc' }).toLocal(); // Convertir a zona local sin alteraciones

            // Formatea la fecha en el formato deseado
            return parsedDate.toFormat("d MMM yyyy");
        } catch (error) {
            console.error("Error al formatear la fecha:", error);
            return "Fecha inválida";
        }
    };
    const columns = [
        {
            title: (
                <Tooltip title="Número de arqueo">
                    <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                        N° Arqueo
                        <Input
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}

                            onChange={(e) => handleSearch(e.target.value, "arqueo_number")}
                            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                        />
                    </div>
                </Tooltip>
            ),
            dataIndex: "arqueo_number",
            key: "arqueo_number",
            sorter: (a, b) => a.arqueo_number - b.arqueo_number,
            render: (text) => <a>{text || "No disponible"}</a>,
            width: 110,
        },
        {
            title: (
                <Tooltip title="Fecha de registro">
                    <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                        Fecha
                        <Input
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            onChange={(e) => handleSearch(e.target.value, "date")}
                            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                        />
                    </div>
                </Tooltip>
            ),
            dataIndex: "date",
            key: "date",
            render: (text) => renderDate(text),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            sortDirections: ["descend", "ascend"],
            width: 120,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "2px 0", gap: 1, lineHeight: 1 }}>
                    Titulo
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}

                        onChange={(e) => handleSearch(e.target.value, "description")}
                        style={{ marginTop: 2, padding: 4, height: 25, fontSize: 12 }}
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
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "account_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
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
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "cashier_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
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
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "amount")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
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
                <Tooltip title="Fecha de inicio">
                    <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                        Desde
                        <Input
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            onChange={(e) => handleSearch(e.target.value, "start_period")}
                            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                        />
                    </div>
                </Tooltip>
            ),
            dataIndex: "start_period",
            key: "start_period",
            render: (text) => renderDate(text),
            sorter: (a, b) => new Date(a.start_period || 0) - new Date(b.start_period || 0),
            sortDirections: ["descend", "ascend"],
            width: 120,
        },
        {
            title: (
                <Tooltip title="Fecha de finalizacion">
                    <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                        Hasta
                        <Input
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            onChange={(e) => handleSearch(e.target.value, "end_period")}
                            style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12 }}
                        />
                    </div>
                </Tooltip>
            ),
            dataIndex: "end_period",
            key: "end_period",
            render: (text) => renderDate(text),
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
            <div className="bg-white py-2 px-5 shadow-sm">
                <div className="flex  justify-between items-center">
                    {/* Left side: Actions */}
                    <div className="flex items-center space-x-1">
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            {showFilters ? "Filtro" : "Filtro"}
                        </Button>
                    </div>
                    <div className="flex items-center">
                        <div className="mr-3">
                            <div className="flex items-center justify-end ">
                                <div className="bg-white px-2  text-center flex-none w-26">
                                    <h3 className="text-gray-500 text-[10px] font-medium uppercase">Ingresos</h3>
                                    <p className="text-green-600 text-sm font-semibold mt-1 truncate">
                                        {loadingMonthlyData ? "Cargando..." : formatCurrency(monthlyIncome)}
                                    </p>
                                </div>
                                <div className="bg-white px-2  text-center flex-none w-26">
                                    <h3 className="text-gray-500 text-[10px] font-medium uppercase">Egresos</h3>
                                    <p className="text-red-600 text-sm font-semibold mt-1 truncate">
                                        {loadingMonthlyData ? "Cargando..." : formatCurrency(monthlyExpenses)}
                                    </p>
                                </div>
                                <div className="px-2 bg-white text-center flex-none w-26">
                                    <h3 className="text-gray-500 text-[10px] font-medium uppercase">Balance</h3>
                                    <p className="text-blue-600 text-sm font-semibold mt-1 truncate">
                                        {loadingMonthlyData ? "Cargando..." : formatCurrency(monthlyBalance)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Tooltip title="Mes actual">
                            <Button
                                icon={<CalendarOutlined />}
                                onClick={goToCurrentMonth}
                                className="mr-2"
                            >
                                Hoy
                            </Button>
                        </Tooltip>
                        <Button
                            icon={<LeftOutlined />}
                            onClick={goToPreviousMonth}
                            className="mr-1"
                        />
                        <span className="font-medium px-3 py-1 bg-gray-100 rounded">
                            {formatDate(currentMonth, "MMMM yyyy", { locale: es })}
                        </span>
                        <Button
                            icon={<RightOutlined />}
                            onClick={goToNextMonth}
                            className="ml-1"
                        />
                    </div>
                </div>

                {showFilters && (
                    <div className="mt-4 p-3 bg-white ">
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Cashier filter dropdown */}
                            <Select
                                placeholder="Filtrar por cajero"
                                style={{ width: 200 }}
                                onChange={handleCashierFilterChange}
                                value={cashierFilter || undefined}
                                loading={cashiers.length === 0}
                                allowClear
                            >
                                {cashiers.map((cashier) => (
                                    <Select.Option key={cashier.id_cajero} value={cashier.id_cajero}>
                                        {cashier.nombre}
                                    </Select.Option>
                                ))}
                            </Select>
                            <Select
                                placeholder="Filtrar por tipo"
                                style={{ width: 150 }}
                                onChange={handleTypeFilterChange}
                                value={typeFilter || undefined}
                                allowClear
                            >
                                {typeOptions.map((type) => (
                                    <Select.Option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Select.Option>
                                ))}
                            </Select>
                            <Divider type="vertical" style={{ height: '24px' }} />
                            <div className="flex items-center">
                                <Text strong className="mr-2">Seleccionados:</Text>
                                <Tag color="blue">
                                    {selectedRowKeys.length} de {filteredEntries.length} registros
                                </Tag>
                                {selectedRowKeys.length > 0 && (
                                    <Button
                                        type="link"
                                        size="small"
                                        onClick={() => setSelectedRowKeys([])}
                                    >
                                        Limpiar selección
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Error message if data loading fails */}
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

            {/* Enhanced Table with Jira styling */}
            <div className="rounded-none">
                <Table
                    className="px-7 py-5"
                    rowSelection={rowSelection}
                    dataSource={filteredEntries}
                    columns={columns}
                    rowKey={(record) => record.id}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} registros`
                    }}
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

            <ViewIncome entry={selectedEntry} visible={isViewModalOpen} onClose={closeModal} />

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
                
                /* Prevent checkbox click from navigating */
                .ant-checkbox-wrapper {
                    cursor: default;
                }
                
                /* Style Tag components */
                .ant-tag {
                    margin-right: 0;
                }
                
                /* Improved input styling */
                .ant-input-affix-wrapper {
                    border-radius: 4px;
                }
                
                /* Custom card header */
                .ant-card-head {
                    min-height: auto;
                    padding: 0;
                }
                
                /* Jira-style hover */
                .hover\\:bg-gray-50:hover {
                    background-color: #f9f9f9;
                }
                
                /* Transitions */
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
                    <div className="flex flex-wrap gap-4 justify-center mb-4 ">
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

            <FloatingActionMenu
                selectedRowKeys={selectedRowKeys}
                onEdit={handleEditSelected}
                onDelete={handleDeleteSelected}
                onDownload={handleDownloadSelected}
                onExport={handleExportSelected}
                onClearSelection={clearSelection}
            />


        </>
    );
};

export default IncomeTable;