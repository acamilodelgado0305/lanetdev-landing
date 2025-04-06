import React, { useEffect, useState, useRef } from "react";
import { format as formatDate, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import axios from "axios";
import { Modal, message, Button, Card, Row, Col, Statistic, Typography, Tabs, Space, Tooltip } from "antd";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowLeftRight,
  FileText,
  Share2,
  Zap,
  TrendingDown, BarChart2
} from 'lucide-react';
import { PlusOutlined, SwapOutlined, ArrowUpOutlined, ArrowDownOutlined, DollarOutlined } from '@ant-design/icons';

import VoucherContentModal from "./ViewImageModal";
import TransactionTable from "./components/TablaTransferencias";
import ExpenseTable from "./components/ExpenseTable/ExpenseTable";
import IncomeTable from "./Add/Income/IncomeTable";
import Summary from "./Summary";
import { useAuth } from '../../Context/AuthProvider';
import {
  getAccounts,
  getCategorias,
  deleteTransaction,
  deleteTransfer
} from "../../../services/moneymanager/moneyService";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

import TransferModal from "./TransferModal";
import DateNavigator from "./Add/DateNavigator";

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
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "resumen")
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
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [categories, setCategories] = useState([]);
  const [editTransaction, setEditTransaction] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const { userRole } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    return [startOfMonth(today), endOfMonth(today)];
  });

  const handleMonthChange = (dates) => {
    if (!dates || dates.length !== 2) {
      console.warn("Rango de fechas inválido:", dates);
      return;
    }
    setDateRange(dates); // Actualiza el rango de fechas
  };
  const formatCurrency = (amount) => {
    if (isNaN(amount)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };





  // Mapping for tab to endpoint conversion
  const tabToEndpoint = {
    incomes: "/incomes",
    expenses: "/expenses",
    transfers: "/transfers"
  };

  const handleNavigate = (path) => {
    navigate(path);
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
    setTransactionType('transfer');
    setIsModalOpen(true);
    setEditTransaction(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTransactionType(null);
  };

  // Fetch data based on the current tab's endpoint
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

      const balanceValue = parseFloat(net_balance) || 0;
      const incomeValue = parseFloat(total_incomes) || 0;
      const expensesValue = parseFloat(total_expenses) || 0;

      setMonthlyBalance(balanceValue);
      setMonthlyIncome(incomeValue);
      setMonthlyExpenses(expensesValue);
    } catch (err) {
      setError("Error al cargar los datos mensuales");
      console.error("Error fetching monthly data:", err.response ? err.response.data : err.message);
    }
  };

  const fetchGeneralBalance = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/balance/general`);
      const { total_incomes, total_expenses, net_balance } = response.data;

      const balanceValue = parseFloat(net_balance) || 0;
      const incomeValue = parseFloat(total_incomes) || 0;
      const expensesValue = parseFloat(total_expenses) || 0;

      setBalance(balanceValue);
      setTotalIncome(incomeValue);
      setTotalExpenses(expensesValue);
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

  // Initial data loading
  useEffect(() => {
    fetchCategories();
    fetchAccounts();
    fetchGeneralBalance();
    fetchMonthlyData();
    fetchData(tabToEndpoint[activeTab]); // Llamar a fetchData con el endpoint actual
  }, [activeTab, dateRange, refreshTrigger]); // Agregar dateRange como dependencia

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
    setCurrentPage(1);
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
          console.error(`Error al eliminar la ${entry.entryType === "transfer" ? "transferencia" : "transacción"}:`, error);
          message.error(`Error al eliminar la ${entry.entryType === "transfer" ? "transferencia" : "transacción"}`);
        }
      },
    });
  };

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const paginatedEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  const getMonthsArray = () => {
    const months = [];
    for (let i = -2; i <= 2; i++) {
      const date = addMonths(currentMonth, i);
      months.push(date);
    }
    return months;
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="flex flex-col  bg-white ">
      {/* Header */}
      <div className="px-4 bg-white sticky z-10 shadow-sm ">


        <div className="px-4 bg-white sticky z-10 shadow-sm">
          <div className="flex justify-between items-center border-b-3 border-gray-300">
            <div className="px-4 bg-white sticky z-10 shadow-sm">
              <div className="flex flex-col">
                <span className="text-gray-400 text-sm">Área de Contabilidad</span>
                <p level={2} className="text-2xl font-bold">
                  GESTIÓN DE TRANSACCIONES
                </p>
              </div>

            </div>





            {/* Resto del código de TransactionsDashboard */}



            <Space size="middle">
              <div>
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
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() =>
                  navigate("/index/moneymanager/transactions/nuevoingreso", {
                    state: { returnTab: "incomes" }, // Siempre pasar "incomes" como returnTab
                  })
                }
                style={{
                  backgroundColor: "#36B37E",
                  borderColor: "#36B37E",
                  borderRadius: "4px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 16px",
                  height: "40px",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.3s ease",
                }}
                className="hover:opacity-90 hover:scale-102 transition-transform"
                aria-label="Crear nuevo ingreso"
              >
                Nuevo Ingreso
              </Button>

              {/* Botón Nuevo Egreso */}
              <Button
                type="primary"
                icon={<ArrowDownOutlined />}
                danger
                onClick={() =>
                  navigate("/index/moneymanager/transactions/nuevoegreso", {
                    state: { returnTab: "expenses" },
                  })
                }
                style={{
                  backgroundColor: "#FF5630",
                  borderColor: "#FF5630",
                  borderRadius: "4px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 16px",
                  height: "40px",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.3s ease",
                }}
                className="hover:opacity-90 hover:scale-102 transition-transform"
                aria-label="Crear nuevo egreso"
              >
                Nuevo Egreso
              </Button>

              {/* Botón Nueva Transferencia */}
              <Tooltip title="Crear Transferencia">
                <Button
                  type="primary"
                  icon={<SwapOutlined />}
                  onClick={openTransferModal}
                  style={{
                    backgroundColor: "#0052CC",
                    borderColor: "#0052CC",
                    borderRadius: "4px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 16px",
                    height: "40px",
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "all 0.3s ease",
                  }}
                  className="hover:opacity-90 hover:scale-102 transition-transform"
                  aria-label="Crear nueva transferencia"
                >
                  Nueva Transferencia
                </Button>
              </Tooltip>
            </Space>
          </div>

          <div className="flex justify-end mt-2">
            <DateNavigator onMonthChange={handleMonthChange} formatCurrency={formatCurrency} />
          </div>

          {/* Tabs - Mejoradas con indicador azul */}
          <div className="mt-[-1em] border-b-4 border-gray-300">
            <div className="flex overflow-x-auto">
              <div
                className={`py-2 px-4 cursor-pointer border-b-4 transition-colors duration-200 ${activeTab === 'resumen'
                  ? 'border-[#0052CC] text-[#0052CC] font-semibold'
                  : 'border-transparent text-gray-800 hover:border-[#0052CC]-300 hover:text-[#0052CC]'
                  }`}
                onClick={() => handleTabChange('resumen')}
              >
                Resumen
              </div>
              <div
                className={`py-2 px-4 cursor-pointer border-b-4 transition-colors duration-200 ${activeTab === 'incomes'
                  ? 'border-blue-500 text-blue-500 font-semibold'
                  : 'border-transparent text-gray-800 hover:border-blue-300 hover:text-blue-400'
                  }`}
                onClick={() => handleTabChange('incomes')}
              >
                Ingresos
              </div>
              <div
                className={`py-2 px-4 cursor-pointer border-b-4 transition-colors duration-200 ${activeTab === 'expenses'
                  ? 'border-blue-500 text-blue-500 font-semibold'
                  : 'border-transparent text-gray-800 hover:border-blue-300 hover:text-blue-400'
                  }`}
                onClick={() => handleTabChange('expenses')}
              >
                Egresos
              </div>
              <div
                className={`py-2 px-4 cursor-pointer border-b-4 transition-colors duration-200 ${activeTab === 'transfers'
                  ? 'border-blue-500 text-blue-500 font-semibold'
                  : 'border-transparent text-gray-800 hover:border-blue-300 hover:text-blue-400'
                  }`}
                onClick={() => handleTabChange('transfers')}
              >
                Transferencias
              </div>
            </div>
          </div>
        </div>
      </div>

      {
        activeTab === "resumen" ? (
          // Usar el componente Summary importado
          <Summary
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            balance={balance}
          />
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
                  entries={paginatedEntries} // Entradas ya filtradas por dateRange
                  categories={categories}
                  accounts={accounts}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  onOpenContentModal={openContentModal}
                  activeTab={activeTab}
                  dateRange={dateRange} // Pasar dateRange para sincronización
                />
              )}

              {activeTab === "expenses" && (
                <ExpenseTable
                entries={paginatedEntries} // Entradas ya filtradas por dateRange
                categories={categories}
                accounts={accounts}
                onDelete={handleDelete}
                onEdit={openEditModal}
                onOpenContentModal={openContentModal}
                activeTab={activeTab}
                dateRange={dateRange} // Pasar da
                />
              )}

              {activeTab === "transfers" && (
                <TransactionTable
                  entries={paginatedEntries}
                  categories={categories}
                  accounts={accounts}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  onOpenContentModal={openContentModal}
                />
              )}
            </div>
          </div>
        )
      }

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



    </div >
  );
};

export default TransactionsDashboard;