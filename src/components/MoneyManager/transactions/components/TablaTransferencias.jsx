import React, { useState, useEffect } from "react";
import { Table, Input, Drawer, Button, Checkbox, DatePicker, Dropdown, Menu, Card, Tag, Tooltip, Space, Typography, Divider, Select } from "antd";
import { format as formatDate, subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval, isValid } from "date-fns";
import { es } from "date-fns/locale";
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
    EditOutlined
} from "@ant-design/icons";
import FloatingActionMenu from "../FloatingActionMenu";
import DateNavigator from "../Add/DateNavigator";
import Acciones from "../Acciones";


const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const TransactionTable = ({ categories = [], accounts = [] }) => {
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



    const [monthlyBalance, setMonthlyBalance] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);

    const [loadingMonthlyData, setLoadingMonthlyData] = useState(false);



    const handleEditSelected = () => {
        if (selectedRowKeys.length === 1) {
            navigate(`/index/moneymanager/trasfers/edit/${selectedRowKeys[0]}`);
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

    }, []);

    useEffect(() => {
        fetchMonthlyData();
    }, [currentMonth]);

    // Simulate loading when changing date or filter
    const simulateLoading = () => {
        setEntriesLoading(true);
        setTimeout(() => {
            setEntriesLoading(false);
        }, 500);
    };

    useEffect(() => {
        let filtered = [...entries];

        // Filtro por tipo
        if (typeFilter) {
            filtered = filtered.filter(entry => entry.type === typeFilter);
        }

        // Filtro por fecha
        if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);

            // Validar que las fechas sean válidas
            if (isValid(startDate) && isValid(endDate)) {
                filtered = filtered.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return isValid(entryDate) && isWithinInterval(entryDate, { start: startDate, end: endDate });
                });
            }
        }

        // Aplicar filtros de texto de búsqueda
        filtered = filtered.filter(entry =>
            Object.keys(searchText).every(key => {
                if (!searchText[key]) return true;
                if (key === 'category_id') {
                    return getCategoryName(entry[key])
                        .toLowerCase()
                        .includes(searchText[key].toLowerCase());
                }
                if (key === 'from_account_id') {
                    return getAccountName(entry[key])
                        .toLowerCase()
                        .includes(searchText[key].toLowerCase());
                }
                if (key === 'to_account') {
                    return getAccountName(entry[key])
                        .toLowerCase()
                        .includes(searchText[key].toLowerCase());
                }
                return entry[key] ?
                    entry[key].toString().toLowerCase().includes(searchText[key].toLowerCase()) :
                    true;
            })
        );

        setFilteredEntries(filtered);
    }, [entries, searchText, dateRange, typeFilter]);

    // Menú desplegable para el filtro de tipo
    const typeOptions = ["commission", "Legal"]; // Ajusta según los tipos disponibles

    const handleTypeFilterChange = (value) => {
        setTypeFilter(value);
    };

    useEffect(() => {
        let filtered = [...entries];

        // Filtro por fecha
        if (dateRange && dateRange[0] && dateRange[1]) {
            const startDate = new Date(dateRange[0]);
            const endDate = new Date(dateRange[1]);

            // Validar que las fechas sean válidas
            if (isValid(startDate) && isValid(endDate)) {
                filtered = filtered.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return isValid(entryDate) && isWithinInterval(entryDate, { start: startDate, end: endDate });
                });
            }
        }

        // Filtro por tipo
        if (typeFilter) {
            filtered = filtered.filter(entry => entry.type === typeFilter);
        }




        // Aplicar filtros de texto de búsqueda
        filtered = filtered.filter(entry =>
            Object.keys(searchText).every(key => {
                if (!searchText[key]) return true;

                // Filtro para categoría
                if (key === 'category_id') {
                    return getCategoryName(entry[key])
                        .toLowerCase()
                        .includes(searchText[key].toLowerCase());
                }

                // Filtro para cuenta
                if (key === 'account_id') {
                    return getAccountName(entry[key])
                        .toLowerCase()
                        .includes(searchText[key].toLowerCase());
                }

                // Filtro genérico para otros campos
                return entry[key] ?
                    entry[key].toString().toLowerCase().includes(searchText[key].toLowerCase()) :
                    true;
            })
        );

        setFilteredEntries(filtered);
    }, [entries, searchText, dateRange, typeFilter, categories, accounts]);

    const handleRowClick = (record) => {
        navigate(`/index/moneymanager/ingresos/view/${record.id}`);
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
            const response = await axios.get(`${API_BASE_URL}/transfers`);
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
                    navigate(`/index/moneymanager/ingresos/view/${selectedRowKeys[0]}`);
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
            await axios.delete(`${API_BASE_URL}/transfers/${id}`);
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
         console.log("Fecha recibida:", date);
 
         try {
 
             const isoDate = date.replace(' ', 'T') + '.000Z';
 
             const parsedDate = DateTime.fromISO(isoDate, { zone: 'utc' });
 
             console.log("Fecha parseada:", parsedDate);
 
             if (parsedDate.isValid) {
 
                 const formattedDate = parsedDate.toFormat("yyyy-MM-dd HH:mm:ss");
                 return formattedDate;
             } else {
                 console.error("Fecha inválida:", date);
                 return "Fecha inválida";
             }
         } catch (error) {
             console.error("Error al formatear la fecha:", error);
             return "Fecha inválida";
         }
     };

    const columns = [
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Fecha
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "date")}
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
            dataIndex: "date",
            key: "date",
            render: (text) => renderDate(text),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            sortDirections: ["descend", "ascend"],
            width: 50,
        },
        {

            title: (

                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    De la cuenta
                    <Input

                        onChange={(e) => handleSearch(e.target.value, "from_account")}
                        style={{
                            marginTop: 2,
                            padding: 4,
                            height: 28,
                            fontSize: 12,
                            border: '1px solid #d9d9d9', // Borde gris claro
                            borderRadius: 4, // Bordes redondeados para un diseño más profesional
                            outline: 'none', // Elimina el borde de enfoque predeterminado del navegador
                        }}
                    />

                </div>

            ),
            dataIndex: "from_account",
            key: "from_account",

            filterSearch: true,
            render: (id) => getAccountName(id),
            sorter: (a, b) => getAccountName(a.from_account_id).localeCompare(getAccountName(b.from_account)),
            render: (id) => <Tag color="blue">{getAccountName(id)}</Tag>,
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.from_account_id && record.from_account_id.toLowerCase().includes(searchText["from_account"] || ""),
            width: 120,
        },
        {
            title: (

                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    A la cuenta
                    <input

                        onChange={(e) => handleSearch(e.target.value, "to_account")}
                        style={{
                            marginTop: 2,
                            padding: 4,
                            height: 28,
                            fontSize: 12,
                            border: '1px solid #d9d9d9', // Borde gris claro
                            borderRadius: 4, // Bordes redondeados para un diseño más profesional
                            outline: 'none', // Elimina el borde de enfoque predeterminado del navegador
                        }}
                    />

                </div>

            ),
            dataIndex: "to_account",
            key: "to_account",
            render: (id) => getAccountName(id),
            render: (id) => <Tag color="green">{getAccountName(id)}</Tag>,
            sorter: (a, b) => getAccountName(a.to_account_id).localeCompare(getAccountName(b.to_account)),
            sortDirections: ["ascend", "descend"],
            onFilter: (value, record) =>
                record.to_account && record.to_account.toLowerCase().includes(searchText["to_account"] || ""),

            width: 120,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Monto
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}

                        onChange={(e) => handleSearch(e.target.value, "amount")}
                        style={{
                            marginTop: 2,
                            padding: 4,
                            height: 28,
                            fontSize: 12,
                            border: '1px solid #d9d9d9', // Borde gris claro
                            borderRadius: 4, // Bordes redondeados para un diseño más profesional
                            outline: 'none', // Elimina el borde de enfoque predeterminado del navegador
                        }}
                    />
                </div>
            ),
            dataIndex: "amount",
            key: "amount",
            render: (total_net) => <span className="font-bold">{formatCurrency(total_net)}</span>,
            sorter: (a, b) => a.total_net - b.total_net,
            sortDirections: ["descend", "ascend"],
            width: 140,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "2px 0", gap: 1, lineHeight: 1 }}>
                    Titulo
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}

                        onChange={(e) => handleSearch(e.target.value, "description")}
                        style={{
                            marginTop: 2,
                            padding: 4,
                            height: 28,
                            fontSize: 12,
                            border: '1px solid #d9d9d9', // Borde gris claro
                            borderRadius: 4, // Bordes redondeados para un diseño más profesional
                            outline: 'none', // Elimina el borde de enfoque predeterminado del navegador
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
            title: "Comprobante",
            dataIndex: "vouchers",
            key: "vouchers",
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

    // More compact columns for responsive layout
    const mobileColumns = columns.filter(col =>
        ["arqueo_number", "date", "description", "amount", "voucher"].includes(col.dataIndex)
    );

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
                loadingMonthlyData={loadingMonthlyData}
                formatCurrency={formatCurrency}
                monthlyIncome={monthlyIncome}
                monthlyExpenses={monthlyExpenses}
                monthlyBalance={monthlyBalance}
                setDateRange={setDateRange}
                setTypeFilter={setTypeFilter}
                typeFilter={typeFilter}
                filteredEntries={filteredEntries}
                setSelectedRowKeys={setSelectedRowKeys}
            />

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
            <Table
                className="px-7 py-5 "
                rowSelection={rowSelection}
                dataSource={filteredEntries}
                columns={columns}
                rowKey={(record) => record.id}

                bordered
                size="middle"
                loading={entriesLoading}
                onRow={(record) => ({
                    onClick: (e) => {
                        // Prevent navigation when clicking on checkbox or buttons
                        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
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

export default TransactionTable;