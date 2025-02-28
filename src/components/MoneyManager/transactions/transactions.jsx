import React, { useEffect, useState, useRef } from "react";
import { format as formatDate, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import axios from "axios";
import { Modal, message, Button, Card, Row, Col, Statistic, Typography, Tabs, Space } from "antd";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowLeftRight,
  FileText, // Changed from FileTextOutlined to FileText
  Share2,
  Zap,
  TrendingDown, BarChart2
} from 'lucide-react';
import { PlusOutlined, SwapOutlined, ArrowUpOutlined, ArrowDownOutlined, DollarOutlined } from '@ant-design/icons';
import AddEntryModal from "./addModal";
import VoucherContentModal from "./ViewImageModal";
import TransactionTable from "./components/TransactionTable";
import ExpenseTable from "./components/ExpenseTable";
import IncomeTable from "./Add/Income/IncomeTable";
import Summary from "./Summary";
import { useAuth } from '../../Context/AuthProvider';
import {
  getAccounts,
  getCategories,
  deleteTransaction,
  deleteTransfer
} from "../../../services/moneymanager/moneyService";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

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
      const sortedEntries = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(sortedEntries);
      setError(null);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error al cargar los datos");
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
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
    fetchData(tabToEndpoint[activeTab]);
  }, [activeTab, refreshTrigger, currentMonth]);

  const applyFilters = (entriesToFilter = entries) => {
    let filtered = entriesToFilter;

    if (!isSearching) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date);
        return (
          entryDate >= startOfMonth(currentMonth) &&
          entryDate <= endOfMonth(currentMonth)
        );
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
        filterType === "transfer"
          ? entry.entryType === "transfer"
          : entry.type === filterType
      );
    }

    setFilteredEntries(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, entries, currentMonth, isSearching]);

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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky  z-10 shadow-sm">
        <div className="max-w-7x2 mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">

                <div className="pt-10 pl-4 pr-4 flex flex-col">
                  <span className="text-gray-400 text-sm ">Área de Contabilidad</span>
                  <Title level={2} className="text-lg font-bold">
                    Gestión de Transacciones
                  </Title>
                </div>
              </div>


            </div>

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
                    <div className="px-2 rounded  text-center flex-none w-26">
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
                style={{
                  backgroundColor: '#36B37E',
                  borderColor: '#36B37E',
                  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onClick={() => navigate('/index/moneymanager/transactions/nuevoingreso', { state: { returnTab: 'incomes' } })}
              >
                Crear Ingreso
              </Button>

              <Button
                type="primary"
                icon={<ArrowDownOutlined />}
                danger
                style={{
                  backgroundColor: '#FF5630',
                  borderColor: '#FF5630',
                  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onClick={() => navigate('/index/moneymanager/transactions/nuevoegreso', { state: { returnTab: 'expenses' } })}
              >
                Crear Egreso
              </Button>

              <Button
                type="primary"
                icon={<SwapOutlined />}
                style={{
                  backgroundColor: '#0052CC',
                  borderColor: '#0052CC',
                  boxShadow: '0 2px 0 rgba(0, 0, 0, 0.045)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onClick={() => handleNavigate('/index/moneymanager/transactions/nuevatransferencia')}
              >
                Crear Transferencia
              </Button>
            </Space>
          </div>

          {/* Tabs - Similar to the project management tabs */}
          <div className="mt-[-1em] border-b-4 border-gray-300 ">
            <div className="flex  overflow-x-auto">
              <div
                className={`py-2 px-4 cursor-pointer border-b-3 ${activeTab === 'resumen' ? 'border-[#0052CC] text-[#0052CC]' : 'border-transparent text-gray-600'}`}
                onClick={() => handleTabChange('resumen')}
              >
                Resumen
              </div>
              <div
                className={`py-2 px-4 cursor-pointer border-b-2 ${activeTab === 'incomes' ? 'border-[#0052CC] text-[#0052CC]' : 'border-transparent text-gray-600'}`}
                onClick={() => handleTabChange('incomes')}
              >
                Ingresos
              </div>
              <div
                className={`py-2 px-4 cursor-pointer border-b-2 ${activeTab === 'expenses' ? 'border-[#0052CC] text-[#0052CC]' : 'border-transparent text-gray-600'}`}
                onClick={() => handleTabChange('expenses')}
              >
                Egresos
              </div>
              <div
                className={`py-2 px-4 cursor-pointer border-b-2 ${activeTab === 'transfers' ? 'border-[#0052CC] text-[#0052CC]' : 'border-transparent text-gray-600'}`}
                onClick={() => handleTabChange('transfers')}
              >
                Transferencias
              </div>
            </div>
          </div>
        </div>
      </div>


      {activeTab === "resumen" ? (
        // Usar el componente Summary importado
        <Summary
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          balance={balance}

        />
      ) : (
        <div className="bg-blue-900 bg-opacity-20 shadow-lg overflow-auto"> 
          <div className="max-w-full mx-auto  ">
            <div className="bg-gray rounded">
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
                  entries={paginatedEntries}
                  categories={categories}
                  accounts={accounts}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  onOpenContentModal={openContentModal}
                />
              )}

              {activeTab === "expenses" && (
                <ExpenseTable
                  entries={paginatedEntries}
                  categories={categories}
                  accounts={accounts}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  onOpenContentModal={openContentModal}
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
        </div>
      )}

      {/* Modals */}
      <AddEntryModal
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
