import React, { useState, useEffect } from "react";
import { Input, Drawer, Button, DatePicker, Card, Tag, Space, Typography, Divider, Select } from "antd";
import { format as formatDate, subMonths, addMonths, startOfMonth, endOfMonth, isWithinInterval, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import {
    LeftOutlined,
    RightOutlined,
    FilterOutlined,
    EllipsisOutlined,
    DeleteOutlined,
    ExportOutlined,
    SearchOutlined,
    CalendarOutlined,
    MenuOutlined,
    EditOutlined
} from "@ant-design/icons";
import FloatingActionMenu from "../FloatingActionMenu";
import DateNavigator from "../Add/DateNavigator";
import Acciones from "../Acciones";
import TablaReutilizable from "../../../Tablas/TablaReutilzable";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const RenderPaymentsList = ({ categories = [], accounts = [] }) => {
    const navigate = useNavigate();

    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [searchText, setSearchText] = useState({});

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [dateRange, setDateRange] = useState([startOfMonth(new Date()), endOfMonth(new Date())]);
    const [showFilters, setShowFilters] = useState(false);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [entriesLoading, setEntriesLoading] = useState(true);
    const [entries, setEntries] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...entries];

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
                if (key === 'categoria') {
                    return entry[key]
                        .toLowerCase()
                        .includes(searchText[key].toLowerCase());
                }
                if (key === 'cuenta') {
                    return entry[key]
                        .toLowerCase()
                        .includes(searchText[key].toLowerCase());
                }
                return entry[key]
                    ? entry[key].toString().toLowerCase().includes(searchText[key].toLowerCase())
                    : true;
            })
        );

        setFilteredEntries(filtered);
    }, [entries, searchText, dateRange]);

    const handleEditSelected = () => {
        if (selectedRowKeys.length === 1) {
            navigate(`/index/moneymanager/pagos/edit/${selectedRowKeys[0]}`);
        }
    };

    const handleDeleteSelected = () => {
        handleBatchOperation('delete');
    };

    const handleExportSelected = () => {
        handleBatchOperation('export');
    };

    const clearSelection = () => {
        setSelectedRowKeys([]);
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
            const response = await axios.get(`${API_BASE_URL}/pagospending`);
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

    const goToPreviousMonth = () => {
        const prevMonth = subMonths(currentMonth, 1);
        setCurrentMonth(prevMonth);
        setDateRange([startOfMonth(prevMonth), endOfMonth(prevMonth)]);
    };

    const goToNextMonth = () => {
        const nextMonth = addMonths(currentMonth, 1);
        setCurrentMonth(nextMonth);
        setDateRange([startOfMonth(nextMonth), endOfMonth(nextMonth)]);
    };

    const goToCurrentMonth = () => {
        const now = new Date();
        setCurrentMonth(now);
        setDateRange([startOfMonth(now), endOfMonth(now)]);
    };

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
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
            case 'export':
                console.log("Exportar seleccionados:", selectedItems);
                break;
            case 'edit':
                if (selectedRowKeys.length > 1) {
                    Swal.fire({
                        title: 'Múltiples selecciones',
                        text: 'Solo puede editar un registro a la vez',
                        icon: 'warning',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'Entendido'
                    });
                } else {
                    navigate(`/index/moneymanager/pagos/view/${selectedRowKeys[0]}`);
                }
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
        // Agregamos un console.log para depurar
        console.log("formatCurrency called with amount:", amount);
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleDeleteItem = async (id) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
            await axios.delete(`${API_BASE_URL}/pagospending/${id}`);
            return id;
        } catch (error) {
            console.error(`Error eliminando el pago ${id}:`, error);
            throw error;
        }
    };

    const handleCreate = (newRow) => {
        console.log('Nueva fila creada:', newRow);
        const API_BASE_URL = import.meta.env.VITE_API_FINANZAS || '/api';
        axios.post(`${API_BASE_URL}/pagos`, newRow)
            .then(response => {
                fetchData(); // Refrescar los datos después de crear
            })
            .catch(error => {
                console.error('Error creando registro:', error);
                Swal.fire('Error', 'No se pudo crear el registro', 'error');
            });
    };

    const columns = [
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Fecha
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "date")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none' }}
                    />
                </div>
            ),
            dataIndex: "date",
            key: "date",
            render: (text) => formatDate(new Date(text), "yyyy-MM-dd HH:mm:ss", { locale: es }),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
            width: 50,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Cuenta
                    <Input
                        onChange={(e) => handleSearch(e.target.value, "cuenta")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none' }}
                    />
                </div>
            ),
            dataIndex: "cuenta",
            key: "cuenta",
            render: (cuenta) => <Tag color="blue">{cuenta}</Tag>,
            sorter: (a, b) => a.cuenta.localeCompare(b.cuenta),
            width: 120,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Categoría
                    <Input
                        onChange={(e) => handleSearch(e.target.value, "categoria")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none' }}
                    />
                </div>
            ),
            dataIndex: "categoria",
            key: "categoria",
            render: (categoria) => <Tag color="green">{categoria}</Tag>,
            sorter: (a, b) => a.categoria.localeCompare(b.categoria),
            width: 120,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Valor
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "valor")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none' }}
                    />
                </div>
            ),
            dataIndex: "valor",
            key: "valor",
            render: (valor) => {
                // Agregamos un console.log para depurar
                console.log("Rendering valor:", valor, "formatCurrency type:", typeof formatCurrency);
                return <span className="font-bold">{formatCurrency(valor)}</span>;
            },
            sorter: (a, b) => a.valor - b.valor,
            width: 140,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "2px 0", gap: 1, lineHeight: 1 }}>
                    Descripción
                    <Input
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => handleSearch(e.target.value, "descripcion")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none' }}
                    />
                </div>
            ),
            dataIndex: "descripcion",
            key: "descripcion",
            sorter: (a, b) => a.descripcion.localeCompare(b.descripcion),
            ellipsis: true,
            width: 300,
        },
        {
            title: (
                <div className="flex flex-col" style={{ margin: "-4px 0", gap: 1, lineHeight: 1 }}>
                    Recurrencia
                    <Input
                        onChange={(e) => handleSearch(e.target.value, "recurrencia")}
                        style={{ marginTop: 2, padding: 4, height: 28, fontSize: 12, border: '1px solid #d9d9d9', borderRadius: 4, outline: 'none' }}
                    />
                </div>
            ),
            dataIndex: "recurrencia",
            key: "recurrencia",
            render: (recurrencia) => <Tag color="purple">{recurrencia}</Tag>,
            sorter: (a, b) => a.recurrencia.localeCompare(b.recurrencia),
            width: 120,
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
          
                handleExportSelected={handleExportSelected}
                clearSelection={clearSelection}
               
                formatCurrency={formatCurrency}
               
              
               
                setDateRange={setDateRange}
                
 
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

            <TablaReutilizable
                className="px-7 py-5"
                columns={columns}
                dataSource={filteredEntries}
                onCreate={handleCreate}
            />
        </>
    );
};

export default RenderPaymentsList;