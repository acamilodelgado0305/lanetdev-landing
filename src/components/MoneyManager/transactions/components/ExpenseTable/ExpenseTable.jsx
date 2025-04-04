import React, { useState, useEffect } from "react";
import { Table, Input, Drawer, Button, Checkbox, DatePicker, Dropdown, Menu, Card, Tag, Tooltip, Space, Typography, Divider, Select } from "antd";
import { format as formatDate, subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { DateTime } from "luxon";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import FloatingActionMenu from "../../FloatingActionMenu";
import ViewExpense from "../../Add/expense/ViewExpense";
import DateNavigator from "../../Add/DateNavigator";
import Acciones from "../../Acciones";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const ExpenseTable = ({ categories = [], accounts = [], activeTab }) => {
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
    const [providers, setProviders] = useState([]);
    const [providerFilter, setProviderFilter] = useState(null);
    const [monthlyBalance, setMonthlyBalance] = useState(0);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [monthlyExpenses, setMonthlyExpenses] = useState(0);
    const [loadingMonthlyData, setLoadingMonthlyData] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [dateRange, setDateRange] = useState(() => {
        const today = new Date();
        return [startOfMonth(today), endOfMonth(today)];
    });


    const handleMonthChange = (newDate) => {
        if (!newDate) {
            console.warn("Fecha inválida detectada:", newDate);
            return; // Evitamos asignar `false`
        }
        setDateRange([startOfMonth(newDate), endOfMonth(newDate)]);
    };

    /*  const [dateRange, setDateRange] = useState(() => {
         const today = new Date();
         return [startOfMonth(today), endOfMonth(today)];
     });
 
 
     const handleMonthChange = (newDate) => {
         if (!newDate) {
             console.warn("Fecha inválida detectada:", newDate);
             return; // Evitamos asignar `false`
         }
         setDateRange([startOfMonth(newDate), endOfMonth(newDate)]);
     }; */

    useEffect(() => {
        fetchData();
        fetchProviders();
    }, []);

    useEffect(() => {
        fetchMonthlyData();
    }, [currentMonth]);

    const fetchProviders = async () => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
            const response = await axios.get(`${API_BASE_URL}/terceros`);
            const providersArray = response.data;
            if (Array.isArray(providersArray) && providersArray.length > 0) {
                setProviders(providersArray);
            } else {
                setProviders([]);
            }
        } catch (error) {
            console.error('Error al obtener los proveedores:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los proveedores. Por favor, intente de nuevo.',
            });
            setProviders([]);
        }
    };

    const getProviderName = (providerId) => {
        if (!providerId) return "Proveedor no especificado";
        const provider = providers.find(provider => provider.id === providerId);
        return provider ? provider.nombre : "Proveedor no encontrado";
    };

    const fetchData = async () => {
        setEntriesLoading(true);
        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
            const response = await axios.get(`${API_BASE_URL}/expenses`);
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
        const monthYear = formatDate(currentMonth, "yyyy-MM");
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
            console.error("Error fetching monthly data:", err.response ? err.response.data : err.message);
        } finally {
            setLoadingMonthlyData(false);
        }
    };

    const simulateLoading = () => {
        setEntriesLoading(true);
        setTimeout(() => setEntriesLoading(false), 500);
    };

    useEffect(() => {
        let filtered = [...entries];
        if (typeFilter) {
            filtered = filtered.filter(entry => entry.type === typeFilter);
        }
        if (providerFilter) {
            filtered = filtered.filter(entry => entry.provider_id === providerFilter);
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

                if (key === 'account_id') {
                    return getAccountName(entry[key])?.toLowerCase().includes(searchText[key].toLowerCase());
                }
                if (key === 'provider_id') {
                    return getProviderName(entry[key])?.toLowerCase().includes(searchText[key].toLowerCase());
                }
                return entry[key]?.toString().toLowerCase().includes(searchText[key].toLowerCase()) || true;
            })
        );
        setFilteredEntries(filtered);
    }, [entries, searchText, dateRange, typeFilter, providerFilter, providers, accounts]);

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

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };


    const renderDate = (date) => {
        if (!date) return "Sin fecha";



        try {
            let parsedDate;

            // Si es un string, intentamos varios métodos de parsing
            if (typeof date === 'string') {
                // Eliminar 'Z' si existe para evitar conversión UTC
                const cleanDate = date.endsWith('Z') ? date.substring(0, date.length - 1) : date;


                // Intentar primero con fromISO (formato ISO)
                parsedDate = DateTime.fromISO(cleanDate, { zone: "America/Bogota" });

                // Si no es válido, intentar con fromSQL (formato de base de datos)
                if (!parsedDate.isValid) {
                    console.log("Intento con fromSQL");
                    parsedDate = DateTime.fromSQL(cleanDate, { zone: "America/Bogota" });
                }

                // Si sigue sin ser válido, intentar con fromFormat para algunos formatos comunes
                if (!parsedDate.isValid) {
                    console.log("Intento con formatos específicos");
                    const formats = [
                        "yyyy-MM-dd HH:mm:ss",
                        "yyyy-MM-dd'T'HH:mm:ss",
                        "dd/MM/yyyy HH:mm:ss",
                        "yyyy-MM-dd"
                    ];

                    for (const format of formats) {
                        parsedDate = DateTime.fromFormat(cleanDate, format, { zone: "America/Bogota" });
                        if (parsedDate.isValid) break;
                    }
                }
            } else if (date instanceof Date) {
                // Si es un objeto Date, convertirlo directamente
                parsedDate = DateTime.fromJSDate(date, { zone: "America/Bogota" });
            }

            // Verificar si se pudo parsear correctamente
            if (!parsedDate || !parsedDate.isValid) {
                console.warn("No se pudo parsear la fecha:", date);
                return "Fecha inválida";
            }


            // Formatear con configuración regional española
            return parsedDate.setLocale('es').toFormat("d 'de' MMMM 'de' yyyy HH:mm");
        } catch (error) {
            console.error("Error al formatear la fecha:", error, "Fecha original:", date);
            return "Fecha inválida";
        }
    };



    const getAccountName = (accountId) => {
        const account = accounts.find((acc) => acc.id === accountId);
        return account ? account.name : "Cuenta no encontrada";
    };



    const handleEditSelected = () => {
        if (selectedRowKeys.length === 1) {
            navigate(`/index/moneymanager/egresos/edit/${selectedRowKeys[0]}`, {
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
        generateExpensePDF(selectedItems);
    };

    const handleExportSelected = () => {
        handleBatchOperation('export');
    };

    const clearSelection = () => {
        setSelectedRowKeys([]);
    };

    const generateExpensePDF = (items) => {
        Swal.fire({
            title: "Generando PDF",
            text: "Por favor espere...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("FACTURA DE EGRESOS", 105, 20, { align: "center" });

            // Company Info (customize as needed)
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("Nombre de la Empresa", 14, 30);
            doc.text("NIT: 123456789-0", 14, 36);
            doc.text("Dirección: Calle 123 #45-67, Bogotá, Colombia", 14, 42);
            doc.text("Teléfono: +57 123 456 7890", 14, 48);

            // Invoice Info
            doc.text(`Fecha: ${formatDate(new Date(), "d MMMM yyyy", { locale: es })}`, 140, 30);
            doc.text(`Factura N°: ${Math.floor(Math.random() * 1000000)}`, 140, 36);

            // Table of Expenses
            const tableData = items.map(item => [
                item.invoice_number || "N/A",
                item.description || "Sin descripción",
                item.category || "Sin Sin Categoria",
                renderDate(item.date),
                getAccountName(item.account_id),
                getProviderName(item.provider_id),
                formatCurrency(item.total_gross || 0),
                formatCurrency(item.discounts || 0),
                formatCurrency(item.total_net || 0),
            ]);

            autoTable(doc, {
                startY: 60,
                head: [["N° Egreso", "Descripción", "Fecha", "Cuenta", "Proveedor", "Base", "Impuestos", "Total Neto"]],
                body: tableData,
                theme: "grid",
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
            const totalNet = items.reduce((sum, item) => sum + (item.total_net || 0), 0);
            doc.setFontSize(12);
            doc.text(`Total Neto: ${formatCurrency(totalNet)}`, 140, doc.lastAutoTable.finalY + 10);

            // Footer
            doc.setFontSize(10);
            doc.text("Gracias por su negocio", 105, 280, { align: "center" });
            doc.text("Este documento no tiene validez fiscal", 105, 286, { align: "center" });

            // Save the PDF
            doc.save(`Factura_Egresos_${formatDate(new Date(), "yyyy-MM-dd")}.pdf`);

            Swal.fire({
                icon: "success",
                title: "PDF Generado",
                text: "El comprobante se ha descargado correctamente",
            });
        } catch (error) {
            console.error("Error al generar PDF:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `No se pudo generar el PDF: ${error.message}`,
            });
        }
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
                                Swal.fire('¡Eliminado!', 'Los registros han sido eliminados.', 'success');
                                setSelectedRowKeys([]);
                                fetchData();
                            })
                            .catch(error => {
                                console.error("Error eliminando registros:", error);
                                Swal.fire('Error', 'Hubo un problema al eliminar los registros.', 'error');
                            });
                    }
                });
                break;
            case 'export':
                console.log("Exportar seleccionados:", selectedItems);
                // Add your export logic here
                break;
            default:
                break;
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
            await axios.delete(`${API_BASE_URL}/expenses/${id}`);
            return id;
        } catch (error) {
            console.error(`Error eliminando el egreso ${id}:`, error);
            throw error;
        }
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

    const openDrawer = (images) => {
        setSelectedImages(images);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedImages([]);
    };

    const columns = [

        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    N° de egreso
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "invoice_number")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none', width: 80 }}
                    />
                </div>
            ),
            dataIndex: "invoice_number",
            key: "invoice_number",
            sorter: (a, b) => a.invoice_number - b.invoice_number,
            render: (text) => <a>{text || "No disponible"}</a>,
            width: 30,
        },

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
            width: 150, // Aumentamos el ancho para dar espacio a la hora
        },


        {
            title: (
                <div className="flex flex-col" style={{ margin: "2px 0", gap: 1, lineHeight: 1 }}>
                    Categoría
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "category")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none', width: 180 }}
                    />
                </div>
            ),
            dataIndex: "category",
            key: "category",
            render: (category) => <Tag color="purple">{category}</Tag>,

            sortDirections: ["ascend", "descend"],
            ellipsis: true,
            width: 130,
        },


        {
            title: (
                <div className="flex flex-col" style={{ margin: "2px 0", gap: 1, lineHeight: 1 }}>
                    Título
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "description")}
                        style={{
                            marginTop: 2,
                            padding: 4,
                            height: 28,
                            fontSize: 12,
                            border: '1px solid #d9d9d9',
                            borderRadius: 4,
                            outline: 'none',
                            width: 180
                        }}
                    />
                </div>
            ),
            dataIndex: "description",
            key: "description",
            sorter: (a, b) => a.description.localeCompare(b.description),
            sortDirections: ["ascend", "descend"],
            width: 90, // Ancho fijo de la columna
            ellipsis: true, // Activa el truncamiento
            render: (text) => (
                <div
                    style={{
                        maxWidth: '200px', // Forzamos el ancho máximo
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {text || "No disponible"}
                </div>
            ),
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Cuenta
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "account_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none', width: 180 }}
                    />
                </div>
            ),
            dataIndex: "account_id",
            key: "account_id",
            render: (id) => <Tag color="blue">{getAccountName(id)}</Tag>,
            sorter: (a, b) => getAccountName(a.account_id).localeCompare(getAccountName(b.account_id)),
            sortDirections: ["ascend", "descend"],
            width: 100,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "2px 0", gap: 1, lineHeight: 1 }}>
                    Proveedor
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "provider_id")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none' }}
                    />
                </div>
            ),
            dataIndex: "provider_id",
            key: "provider_id",
            render: (providerId) => <Tag color="orange">{getProviderName(providerId)}</Tag>,
            sorter: (a, b) => getProviderName(a.provider_id).localeCompare(getProviderName(b.provider_id)),
            sortDirections: ["ascend", "descend"],
            width: 100,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Base
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "total_gross")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none' }}
                    />
                </div>
            ),
            dataIndex: "total_gross",
            key: "total_gross",
            render: (total_gross) => <span className="font-bold">{formatCurrency(total_gross)}</span>,
            sorter: (a, b) => a.total_gross - b.total_gross,
            sortDirections: ["descend", "ascend"],
            width: 100,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Impuestos
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "discounts")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none' }}
                    />
                </div>
            ),
            dataIndex: "discounts",
            key: "discounts",
            render: (discounts) => <span className="font-bold">{formatCurrency(discounts)}</span>,
            sorter: (a, b) => a.discounts - b.discounts,
            sortDirections: ["descend", "ascend"],
            width: 100,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Total Neto
                    <input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "total_net")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none' }}
                    />
                </div>
            ),
            dataIndex: "total_net",
            key: "total_net",
            render: (total_net) => <span className="font-bold">{formatCurrency(total_net)}</span>,
            sorter: (a, b) => a.total_net - b.total_net,
            sortDirections: ["descend", "ascend"],
            width: 100,
        },

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
                providers={providers}
                setProviderFilter={setProviderFilter}
                providerFilter={providerFilter}
                setTypeFilter={setTypeFilter}
                typeFilter={typeFilter}
                filteredEntries={filteredEntries}
                setSelectedRowKeys={setSelectedRowKeys}
            />

            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded border border-red-200">
                    <p className="font-medium">{error}</p>
                    <Button type="primary" danger onClick={fetchData} className="mt-2">
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
                    className="thick-bordered-table"
                    loading={entriesLoading}
                    onRow={(record) => ({
                        onClick: (e) => {
                            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                                handleRowClick(record);
                            }
                        },
                    })}
                    rowClassName="hover:bg-gray-50 transition-colors"
                    scroll={{ x: 'max-content' }}
                />
            </div>

            <ViewExpense entry={selectedEntry} visible={isViewModalOpen} onClose={closeModal} activeTab={activeTab} />

            <Drawer
                visible={isDrawerOpen}
                onClose={closeDrawer}
                placement="right"
                width={420}
                title="Comprobantes de egresos"
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
        </>
    );
};

export default ExpenseTable;