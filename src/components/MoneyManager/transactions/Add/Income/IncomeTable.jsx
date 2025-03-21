import React, { useState, useEffect } from "react";
import { Input, Drawer, Button, DatePicker, Select, Row, Col, Statistic } from "antd";
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
    SearchOutlined,
    FilterOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import FloatingActionMenu from "../../FloatingActionMenu";
import ViewIncome from "./ViewIncome";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Acciones from "../../Acciones";

const { RangePicker } = DatePicker;

const IncomeTable = ({ categories = [], accounts = [], activeTab }) => {
    const navigate = useNavigate();

    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [searchText, setSearchText] = useState({});
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
    const [cashiers, setCashiers] = useState([]);
    const [cashierFilter, setCashierFilter] = useState(null);
    const [monthlyBalance, setMonthlyBalance] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [loadingMonthlyData, setLoadingMonthlyData] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    const renderDate = (date) => {
        try {
            const parsedDate = DateTime.fromISO(date, { zone: "local" });
            if (!parsedDate.isValid) return "Fecha inválida";
            return parsedDate.toFormat("d 'de' MMMM 'de' yyyy HH:mm", { locale: "es" });
        } catch (error) {
            console.error("Error al formatear la fecha:", error);
            return "Fecha inválida";
        }
    };

    const handleMonthChange = (newDate) => {
        if (!newDate) return;
        setDateRange([startOfMonth(newDate), endOfMonth(newDate)]);
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
                text: 'No se pudieron cargar los cajeros.',
            });
        }
    };

    const getCashierName = (cashierId) => {
        const cashier = cashiers.find((cash) => cash.id_cajero === cashierId);
        return cashier ? cashier.nombre : "Cajero no encontrado";
    };

    const getAccountName = (accountId) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.name : "Cuenta no encontrada";
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Categoría no encontrada";
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
                text: 'No se pudieron cargar los datos.',
                icon: 'error',
            });
        } finally {
            setEntriesLoading(false);
        }
    };

    const fetchMonthlyData = async () => {
        const monthYear = formatDate(dateRange[0], "yyyy-MM");
        setLoadingMonthlyData(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
            const response = await axios.get(`${API_BASE_URL}/balance/month/${monthYear}`);
            const { total_incomes, total_expenses, net_balance } = response.data;
            setMonthlyBalance(parseFloat(net_balance) || 0);
            setMonthlyIncome(parseFloat(total_incomes) || 0);
            setMonthlyExpenses(parseFloat(total_expenses) || 0);
        } catch (err) {
            setError("Error al cargar los datos mensuales");
            console.error("Error fetching monthly data:", err);
        } finally {
            setLoadingMonthlyData(false);
        }
    };

    useEffect(() => {
        let filtered = [...entries];

        if (typeFilter) filtered = filtered.filter(entry => entry.type === typeFilter);
        if (cashierFilter) filtered = filtered.filter(entry => entry.cashier_id === cashierFilter);
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
                if (key === 'category_id') return getCategoryName(entry[key]).toLowerCase().includes(searchText[key].toLowerCase());
                if (key === 'account_id') return getAccountName(entry[key]).toLowerCase().includes(searchText[key].toLowerCase());
                if (key === 'cashier_id') return getCashierName(entry[key]).toLowerCase().includes(searchText[key].toLowerCase());
                return entry[key]?.toString().toLowerCase().includes(searchText[key].toLowerCase()) || true;
            })
        );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                if (sortConfig.key === 'date' || sortConfig.key === 'start_period' || sortConfig.key === 'end_period') {
                    return sortConfig.direction === 'ascend' ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue);
                }
                if (sortConfig.key === 'amount') {
                    return sortConfig.direction === 'ascend' ? aValue - bValue : bValue - aValue;
                }
                return sortConfig.direction === 'ascend' ? aValue.toString().localeCompare(bValue.toString()) : bValue.toString().localeCompare(aValue.toString());
            });
        }

        setFilteredEntries(filtered);
    }, [entries, searchText, dateRange, typeFilter, cashierFilter, sortConfig]);

    const handleSearch = (value, dataIndex) => {
        setSearchText((prev) => ({ ...prev, [dataIndex]: value }));
    };

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'ascend' ? 'descend' : 'ascend',
        }));
    };

    const handleRowClick = (record) => {
        setSelectedEntry(record);
        setIsViewModalOpen(true);
    };

    const closeModal = () => {
        setIsViewModalOpen(false);
        setSelectedEntry(null);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
    };

    const handleEditSelected = () => {
        if (selectedRowKeys.length === 1) {
            navigate(`/index/moneymanager/ingresos/edit/${selectedRowKeys[0]}`, { state: { returnTab: activeTab } });
        }
    };

    const handleDeleteSelected = () => {
        handleBatchOperation('delete');
    };

    const handleDownloadSelected = () => {
        if (selectedRowKeys.length === 0) {
            Swal.fire({ title: 'Selección vacía', text: 'Seleccione al menos un registro', icon: 'warning' });
            return;
        }
        const selectedItems = entries.filter(item => selectedRowKeys.includes(item.id));
        generateInvoicePDF(selectedItems);
    };

    const handleBatchOperation = (operation) => {
        if (selectedRowKeys.length === 0) {
            Swal.fire({ title: 'Selección vacía', text: 'Seleccione al menos un registro', icon: 'warning' });
            return;
        }
        const selectedItems = entries.filter(item => selectedRowKeys.includes(item.id));
        switch (operation) {
            case 'delete':
                Swal.fire({
                    title: '¿Está seguro?',
                    text: `¿Desea eliminar ${selectedRowKeys.length} registro(s)?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, eliminar',
                }).then((result) => {
                    if (result.isConfirmed) {
                        Promise.all(selectedRowKeys.map(id => axios.delete(`${import.meta.env.VITE_API_FINANZAS || '/api'}/incomes/${id}`)))
                            .then(() => {
                                Swal.fire('¡Eliminado!', 'Los registros han sido eliminados.', 'success');
                                setSelectedRowKeys([]);
                                fetchData();
                            })
                            .catch(() => Swal.fire('Error', 'Hubo un problema al eliminar los registros.', 'error'));
                    }
                });
                break;
            default:
                break;
        }
    };

    const generateInvoicePDF = (items) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("FACTURA", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text("Nombre de la Empresa", 14, 30);
        doc.text("NIT: 123456789-0", 14, 36);
        doc.text("Dirección: Calle 123 #45-67, Bogotá, Colombia", 14, 42);
        doc.text(`Fecha: ${formatDate(new Date(), "d MMMM yyyy", { locale: es })}`, 140, 30);
        autoTable(doc, {
            startY: 60,
            head: [['N° Arqueo', 'Descripción', 'Fecha', 'Cuenta', 'Cajero', 'Monto', 'Desde', 'Hasta']],
            body: items.map(item => [
                item.arqueo_number || "N/A",
                item.description,
                renderDate(item.date),
                getAccountName(item.account_id),
                getCashierName(item.cashier_id),
                formatCurrency(item.amount),
                renderDate(item.start_period),
                renderDate(item.end_period),
            ]),
            theme: 'grid',
        });
        const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        doc.text(`Total: ${formatCurrency(totalAmount)}`, 140, doc.lastAutoTable.finalY + 10);
        doc.save(`Factura_Ingresos_${formatDate(new Date(), "yyyy-MM-dd")}.pdf`);
    };

    const openDrawer = (images) => {
        setSelectedImages(images);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedImages([]);
    };

    return (
        <>
            <Acciones
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                selectedRowKeys={selectedRowKeys}
                handleEditSelected={handleEditSelected}
                handleDeleteSelected={handleDeleteSelected}
                handleDownloadSelected={handleDownloadSelected}
                clearSelection={() => setSelectedRowKeys([])}
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
                    <Button type="primary" danger onClick={fetchData} className="mt-2">Reintentar</Button>
                </div>
            )}

            <div className="bg-white p-4 rounded-lg shadow">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        checked={selectedRowKeys.length === filteredEntries.length && filteredEntries.length > 0}
                                        onChange={(e) => setSelectedRowKeys(e.target.checked ? filteredEntries.map(e => e.id) : [])}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex flex-col gap-1">
                                        Fecha y Hora
                                        <Input
                                            prefix={<SearchOutlined />}
                                            onChange={(e) => handleSearch(e.target.value, "date")}
                                            className="w-40"
                                        />
                                    </div>
                                    <button onClick={() => handleSort("date")} className="ml-2">
                                        {sortConfig.key === "date" && sortConfig.direction === "ascend" ? "↑" : "↓"}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex flex-col gap-1">
                                        N° Arqueo
                                        <Input
                                            prefix={<SearchOutlined />}
                                            onChange={(e) => handleSearch(e.target.value, "arqueo_number")}
                                            className="w-32"
                                        />
                                    </div>
                                    <button onClick={() => handleSort("arqueo_number")} className="ml-2">
                                        {sortConfig.key === "arqueo_number" && sortConfig.direction === "ascend" ? "↑" : "↓"}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex flex-col gap-1">
                                        Título
                                        <Input
                                            prefix={<SearchOutlined />}
                                            onChange={(e) => handleSearch(e.target.value, "description")}
                                            className="w-48"
                                        />
                                    </div>
                                    <button onClick={() => handleSort("description")} className="ml-2">
                                        {sortConfig.key === "description" && sortConfig.direction === "ascend" ? "↑" : "↓"}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex flex-col gap-1">
                                        Cuenta
                                        <Input
                                            prefix={<SearchOutlined />}
                                            onChange={(e) => handleSearch(e.target.value, "account_id")}
                                            className="w-32"
                                        />
                                    </div>
                                    <button onClick={() => handleSort("account_id")} className="ml-2">
                                        {sortConfig.key === "account_id" && sortConfig.direction === "ascend" ? "↑" : "↓"}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex flex-col gap-1">
                                        Cajero
                                        <Input
                                            prefix={<SearchOutlined />}
                                            onChange={(e) => handleSearch(e.target.value, "cashier_id")}
                                            className="w-32"
                                        />
                                    </div>
                                    <button onClick={() => handleSort("cashier_id")} className="ml-2">
                                        {sortConfig.key === "cashier_id" && sortConfig.direction === "ascend" ? "↑" : "↓"}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex flex-col gap-1">
                                        Monto Total
                                        <Input
                                            prefix={<SearchOutlined />}
                                            onChange={(e) => handleSearch(e.target.value, "amount")}
                                            className="w-32"
                                        />
                                    </div>
                                    <button onClick={() => handleSort("amount")} className="ml-2">
                                        {sortConfig.key === "amount" && sortConfig.direction === "ascend" ? "↑" : "↓"}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex flex-col gap-1">
                                        Desde
                                        <Input
                                            prefix={<SearchOutlined />}
                                            onChange={(e) => handleSearch(e.target.value, "start_period")}
                                            className="w-32"
                                        />
                                    </div>
                                    <button onClick={() => handleSort("start_period")} className="ml-2">
                                        {sortConfig.key === "start_period" && sortConfig.direction === "ascend" ? "↑" : "↓"}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex flex-col gap-1">
                                        Hasta
                                        <Input
                                            prefix={<SearchOutlined />}
                                            onChange={(e) => handleSearch(e.target.value, "end_period")}
                                            className="w-32"
                                        />
                                    </div>
                                    <button onClick={() => handleSort("end_period")} className="ml-2">
                                        {sortConfig.key === "end_period" && sortConfig.direction === "ascend" ? "↑" : "↓"}
                                    </button>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Comprobante
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {entriesLoading ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : filteredEntries.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                                        No hay datos disponibles
                                    </td>
                                </tr>
                            ) : (
                                filteredEntries.map((entry) => (
                                    <tr
                                        key={entry.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={(e) => {
                                            if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
                                                handleRowClick(entry);
                                            }
                                        }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={selectedRowKeys.includes(entry.id)}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedRowKeys((prev) =>
                                                        e.target.checked
                                                            ? [...prev, entry.id]
                                                            : prev.filter((id) => id !== entry.id)
                                                    );
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{renderDate(entry.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.arqueo_number || "N/A"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{entry.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {getAccountName(entry.account_id)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {getCashierName(entry.cashier_id)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(entry.amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{renderDate(entry.start_period)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{renderDate(entry.end_period)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {Array.isArray(entry.voucher) && entry.voucher.length > 0 ? (
                                                <Button
                                                    type="link"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDrawer(entry.voucher);
                                                    }}
                                                >
                                                    Ver comprobante
                                                </Button>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ViewIncome entry={selectedEntry} visible={isViewModalOpen} onClose={closeModal} activeTab={activeTab} />

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

const downloadImage = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("No se pudo descargar el archivo.");
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

export default IncomeTable;