import React, { useEffect, useState } from "react";
import { format as formatDate, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import axios from "axios";
import { Modal, message, Button, Typography, Tabs, Space, Tooltip, Popconfirm } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertCircle,
} from "lucide-react";
import { PlusOutlined, EditOutlined, SwapOutlined, ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined, DownloadOutlined, CloseOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import VoucherContentModal from "./ViewImageModal";
import TrasferTable from "./components/TablaTransferencias";
import ExpenseTable from "./components/ExpenseTable/ExpenseTable";
import IncomeTable from "./Add/Income/IncomeTable";
import Summary from "./Summary";
import { useAuth } from "../../Context/AuthProvider";
import {
  getAccounts,
  getCategorias,
  deleteTransaction,
  deleteTransfer,
  deleteExpense,
  deleteIncome,
} from "../../../services/moneymanager/moneyService";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

import TransferModal from "./TransferModal";
import DateNavigator from "./Add/DateNavigator";
import ActionButtons from "./ActionButtons";

const formatCurrency = (amount) => {
  if (isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const TransactionsDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "resumen");
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedVoucherContent, setSelectedVoucherContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState(null);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [categories, setCategories] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const { userRole } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    return [startOfMonth(today), endOfMonth(today)];
  });

  // Función para manejar la edición
  const handleEditSelected = () => {
    if (selectedRowKeys.length === 1) {
      // Buscar la entrada seleccionada
      const entry = filteredEntries.find((e) => e.id === selectedRowKeys[0]);

      // Validar el tipo de transacción y redirigir a la ruta de edición correspondiente
      if (entry) {
        if (entry.entryType === "income") {
          navigate(`/index/moneymanager/ingresos/edit/${entry.id}`, { state: { returnTab: activeTab } });
        } else if (entry.entryType === "expense") {
          navigate(`/index/moneymanager/egresos/edit/${entry.id}`, { state: { returnTab: activeTab } });
        } else if (entry.entryType === "transfer") {
          navigate(`/index/moneymanager/transferencias/edit/${entry.id}`, { state: { returnTab: activeTab } });
        } else {
          message.warning("Tipo de transacción no válido para editar.");
        }
      } else {
        message.warning("No se encontró un elemento con el ID seleccionado.");
      }
    } else {
      message.warning("Seleccione exactamente un elemento para editar.");
    }
  };


  // Función para manejar la eliminación
  const handleDeleteSelected = () => {
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: `¿Está seguro de que desea eliminar ${selectedRowKeys.length} elemento(s)?`,
        content: "Esta acción no se puede deshacer.",
        onOk: async () => {
          try {
            for (const id of selectedRowKeys) {
              const entry = filteredEntries.find((e) => e.id === id);
              if (entry.entryType === "transfer") {
                await deleteTransfer(entry.id);  // Si es una transferencia
              } else if (entry.entryType === "expense") {
                await deleteExpense(entry.id);  // Si es un egreso (Expense)
              } else if (entry.entryType === "income") {
                await deleteIncome(entry.id);  // Si es un ingreso (Income)
              }
            }

            setEntries(entries.filter((e) => !selectedRowKeys.includes(e.id)));
            setSelectedRowKeys([]);  // Limpiar la selección de filas
            message.success("Elementos eliminados con éxito");
            fetchGeneralBalance();
            fetchMonthlyData();
          } catch (error) {
            console.error("Error al eliminar:", error);
            message.error("Error al eliminar los elementos");
          }
        },
      });
    } else {
      message.warning("Seleccione al menos un elemento para eliminar.");
    }
  };

  // Función para manejar la descarga
  const handleDownloadSelected = () => {
    if (selectedRowKeys.length > 0) {
      const selectedEntries = filteredEntries.filter((entry) => selectedRowKeys.includes(entry.id));
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Reporte de Transacciones", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text(`Fecha: ${formatDate(new Date(), "d MMMM yyyy")}`, 14, 30);

      const tableData = selectedEntries.map((entry) => [
        entry.entryType || "N/A",
        entry.description || "Sin descripción",
        formatDate(new Date(entry.date), "d MMMM yyyy"),
        entry.amount ? formatCurrency(entry.amount) : "$0.00",
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["Tipo", "Descripción", "Fecha", "Monto"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
      });

      doc.save(`Reporte_Transacciones_${formatDate(new Date(), "yyyy-MM-dd")}.pdf`);
      message.success("Reporte descargado con éxito");
    } else {
      message.warning("Seleccione al menos un elemento para descargar.");
    }
  };

  // Función para limpiar la selección
  const handleClearSelection = () => {
    setSelectedRowKeys([]);
  };

  const handleMonthChange = (dates) => {
    if (!dates || dates.length !== 2) {
      console.warn("Rango de fechas inválido:", dates);
      return;
    }
    setDateRange(dates);
  };

  const tabToEndpoint = {
    incomes: "/incomes",
    expenses: "/expenses",
    transfers: "/transfers",
  };

  const openContentModal = (voucherContent) => {
    setSelectedVoucherContent(voucherContent);
    setIsContentModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditTransaction(entry);
    setIsModalOpen(true);
  };

  const closeContentModal = () => {
    setIsContentModalOpen(false);
    setSelectedVoucherContent("");
  };

  const openTransferModal = () => {
    setTransactionType("transfer");
    setIsModalOpen(true);
    setEditTransaction(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTransactionType(null);
  };

  const fetchData = async (endpoint) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      const allEntries = response.data;
      const filteredEntries = allEntries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= dateRange[0] && entryDate <= dateRange[1];
      });
      const sortedEntries = filteredEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(sortedEntries);
      setFilteredEntries(sortedEntries);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error al cargar los datos");
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategorias();
      setCategories(data);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error al obtener las cuentas:", error);
    }
  };

  const fetchMonthlyData = async () => {
    const monthYear = formatDate(currentMonth, "yyyy-MM");
    try {
      const response = await axios.get(`${API_BASE_URL}/balance/month/${monthYear}`);
      const { total_incomes, total_expenses, net_balance } = response.data;
      setMonthlyBalance(parseFloat(net_balance) || 0);
      setMonthlyIncome(parseFloat(total_incomes) || 0);
      setMonthlyExpenses(parseFloat(total_expenses) || 0);
    } catch (err) {
      setError("Error al cargar los datos mensuales");
      console.error("Error fetching monthly data:", err);
    }
  };

  const fetchGeneralBalance = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/balance/general`);
      const { total_incomes, total_expenses, net_balance } = response.data;
      setBalance(parseFloat(net_balance) || 0);
      setTotalIncome(parseFloat(total_incomes) || 0);
      setTotalExpenses(parseFloat(total_expenses) || 0);
    } catch (err) {
      setError("Error al cargar los datos generales");
      console.error("Error fetching general balance data:", err);
    }
  };

  const handleEntryAdded = () => {
    fetchData(tabToEndpoint[activeTab]);
    fetchGeneralBalance();
    fetchMonthlyData();
  };

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
    fetchGeneralBalance();
    fetchMonthlyData();
    fetchData(tabToEndpoint[activeTab]);
  }, [activeTab, dateRange, refreshTrigger]);

  const applyFilters = (entriesToFilter = entries) => {
    let filtered = entriesToFilter;

    if (!isSearching) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= dateRange[0] && entryDate <= dateRange[1];
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.voucher && entry.voucher.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.category && entry.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((entry) =>
        filterType === "transfer" ? entry.entryType === "transfer" : entry.type === filterType
      );
    }

    setFilteredEntries(filtered);
  };

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, entries, dateRange, isSearching]);

  const handleDelete = async (entry) => {
    Modal.confirm({
      title: `¿Está seguro de que desea eliminar esta ${entry.entryType === "transfer" ? "transferencia" : "transacción"}?`,
      content: "Esta acción no se puede deshacer.",
      onOk: async () => {
        try {
          if (entry.entryType === "transfer") {
            await deleteTransfer(entry.id);
          } else {
            await deleteTransaction(entry.id);
          }
          setEntries(entries.filter((e) => e.id !== entry.id));
          message.success(`${entry.entryType === "transfer" ? "Transferencia" : "Transacción"} eliminada con éxito`);
          fetchGeneralBalance();
          fetchMonthlyData();
        } catch (error) {
          console.error(`Error al eliminar:`, error);
          message.error(`Error al eliminar la ${entry.entryType === "transfer" ? "transferencia" : "transacción"}`);
        }
      },
    });
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSelectedRowKeys([]); // Limpiar selección al cambiar de pestaña
  };

  return (
    <div className="flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center border-b-3 border-gray-300 pt-4">
          <div>
            <span className="text-gray-400 text-sm">Área de Contabilidad</span>
            <p className="text-2xl font-bold">GESTIÓN DE TRANSACCIONES</p>
          </div>
          <Space size="middle">
            <div className="mt-10">
              <div className="flex items-center justify-end space-x-2">
                <div className="px-2 rounded text-center flex-none w-26">
                  <h3 className="text-gray-500 text-[10px] font-medium uppercase">Ingresos totales</h3>
                  <p className="text-green-600 text-sm font-semibold mt-1 truncate">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="px-2 rounded text-center flex-none w-26">
                  <h3 className="text-gray-500 text-[10px] font-medium uppercase">Egresos totales</h3>
                  <p className="text-red-600 text-sm font-semibold mt-1 truncate">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <div className="px-2 rounded text-center flex-none w-26">
                  <h3 className="text-gray-500 text-[10px] font-medium uppercase">Balance</h3>
                  <p className="text-blue-600 text-sm font-semibold mt-1 truncate">
                    {formatCurrency(balance)}
                  </p>
                </div>
              </div>
            </div>


            {/* Botones de acción */}

            {/* Botones de creación */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                navigate("/index/moneymanager/transactions/nuevoingreso", { state: { returnTab: "incomes" } })
              }
              style={{ backgroundColor: "#36B37E", borderColor: "#36B37E" }}
            >
              Nuevo Ingreso
            </Button>
            <Button
              type="primary"
              icon={<ArrowDownOutlined />}
              danger
              onClick={() =>
                navigate("/index/moneymanager/transactions/nuevoegreso", { state: { returnTab: "expenses" } })
              }
              style={{ backgroundColor: "#FF5630", borderColor: "#FF5630" }}
            >
              Nuevo Egreso
            </Button>
            <Tooltip title="Crear Transferencia">
              <Button
                type="primary"
                icon={<SwapOutlined />}
                onClick={openTransferModal}
                style={{ backgroundColor: "#0052CC", borderColor: "#0052CC" }}
              >
                Nueva Transferencia
              </Button>
            </Tooltip>
          </Space>
        </div>
        <div className="flex justify-between mt-2">
          <ActionButtons
            handleEditSelected={handleEditSelected}
            handleDeleteSelected={handleDeleteSelected}
            handleDownloadSelected={handleDownloadSelected}
            handleClearSelection={handleClearSelection}
            selectedRowKeys={selectedRowKeys}
          />
          <DateNavigator onMonthChange={handleMonthChange} formatCurrency={formatCurrency} />
        </div>

        {/* Tabs */}
        <div className="mt-[-1em] border-b-4 border-gray-300">
          <div className="flex overflow-x-auto">
            <div
              className={`py-2 px-4 cursor-pointer border-b-4 ${activeTab === "resumen" ? "border-[#0052CC] text-[#0052CC]" : "border-transparent text-gray-800"}`}
              onClick={() => handleTabChange("resumen")}
            >
              Resumen
            </div>
            <div
              className={`py-2 px-4 cursor-pointer border-b-4 ${activeTab === "incomes" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-800"}`}
              onClick={() => handleTabChange("incomes")}
            >
              Ingresos
            </div>
            <div
              className={`py-2 px-4 cursor-pointer border-b-4 ${activeTab === "expenses" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-800"}`}
              onClick={() => handleTabChange("expenses")}
            >
              Egresos
            </div>
            <div
              className={`py-2 px-4 cursor-pointer border-b-4 ${activeTab === "transfers" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-800"}`}
              onClick={() => handleTabChange("transfers")}
            >
              Transferencias
            </div>
          </div>
        </div>
      </div>

      {activeTab === "resumen" ? (
        <Summary totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} />
      ) : (
        <div className="shadow-lg overflow-auto">
          <div className="max-w-full mx-auto">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              </div>
            )}

            {activeTab === "incomes" && (
              <IncomeTable
                entries={filteredEntries}
                categories={categories}
                accounts={accounts}
                onDelete={handleDelete}
                onEdit={openEditModal}
                onOpenContentModal={openContentModal}
                activeTab={activeTab}
                dateRange={dateRange}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
              />
            )}

            {activeTab === "expenses" && (
              <ExpenseTable
                entries={filteredEntries}
                categories={categories}
                accounts={accounts}
                onDelete={handleDelete}
                onEdit={openEditModal}
                onOpenContentModal={openContentModal}
                activeTab={activeTab}
                dateRange={dateRange}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
              />
            )}

            {activeTab === "transfers" && (
              <TrasferTable
                entries={filteredEntries}
                categories={categories}
                accounts={accounts}
                onDelete={handleDelete}
                onEdit={openEditModal}
                onOpenContentModal={openContentModal}
                activeTab={activeTab}
                dateRange={dateRange}
                selectedRowKeys={selectedRowKeys}
                setSelectedRowKeys={setSelectedRowKeys}
              />
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <TransferModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onTransactionAdded={handleEntryAdded}
        transactionToEdit={editTransaction}
        transactionType={transactionType}
      />
      <VoucherContentModal
        isOpen={isContentModalOpen}
        onClose={closeContentModal}
        voucherContent={selectedVoucherContent}
      />
    </div>
  );
};

export default TransactionsDashboard;