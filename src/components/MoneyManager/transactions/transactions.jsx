import React, { useEffect, useState } from "react";

import { format as formatDate, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import axios from "axios";
import { Modal, message, Input, Select, Button, Card } from "antd";
import AddEntryModal from "./addModal";
import AddIncome from "./Add/Income/AddIncome";
import AddExpense from "./Add/expense/AddExpense";
import {
  getAccounts,
  getCategories,
  deleteTransaction,
  deleteTransfer
} from "../../../services/moneymanager/moneyService";
import VoucherContentModal from "./ViewImageModal";
import TransactionTable from "./components/TransactionTable";
import ExpenseTable from "./components/ExpenseTable";
import IncomeTable from "./components/IncomeTable";
import { useAuth } from '../../Context/AuthProvider';
import Header from "./components/Header";
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ArrowLeftRight,
  Search,
  Plus,
  Menu
} from 'lucide-react';

const { Option } = Select;
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
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedVoucherContent, setSelectedVoucherContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
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
  const [selectedEndpoint, setSelectedEndpoint] = useState("/incomes");
  const { userRole } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openModal = () => {
    setEditTransaction(null);
    setIsModalOpen(true);
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

  const openIncomeModal = () => {
    setIsIncomeModalOpen(true);
    setEditTransaction(null);
  };

  const openExpenseModal = () => {
    setIsExpenseModalOpen(true);
    setEditTransaction(null);
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

  const closeIncomeModal = () => {
    setIsIncomeModalOpen(false);
    setEditTransaction(null);
  };

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditTransaction(null);
  };

  // Consolidar la función para cargar datos de acuerdo con el endpoint
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

  /* const fetchMonthlyData = async () => {
    const monthYear = formatDate(currentMonth, "yyyy-MM");
    try {
      const [balanceResponse, incomeResponse, expensesResponse] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/transactions/balance/month/${monthYear}`),
          axios.get(`${API_BASE_URL}/transactions/income/month/${monthYear}`),
          axios.get(`${API_BASE_URL}/transactions/expenses/month/${monthYear}`),
        ]);

      const balanceValue = parseFloat(balanceResponse.data.balance) || 0;
      const incomeValue = parseFloat(incomeResponse.data.totalIncome) || 0;
      const expensesValue = parseFloat(expensesResponse.data.totalExpenses) || 0;

      setBalance(balanceValue);
      setTotalIncome(incomeValue);
      setTotalExpenses(expensesValue);
    } catch (err) {
      setError("Error al cargar los datos mensuales");
      console.error("Error fetching monthly data:", err);
    }
  }; */
  const fetchMonthlyData = async () => {
    try {
      // Realizar la solicitud a la nueva ruta
      const response = await axios.get(`${API_BASE_URL}/balance/general`);

      // Extraer los datos de la respuesta
      const { total_incomes, total_expenses, net_balance } = response.data;

      // Asignar los valores a las variables correspondientes
      const balanceValue = parseFloat(net_balance) || 0;
      const incomeValue = parseFloat(total_incomes) || 0;
      const expensesValue = parseFloat(total_expenses) || 0;

      // Actualizar los estados con los valores obtenidos
      setBalance(balanceValue);
      setTotalIncome(incomeValue);
      setTotalExpenses(expensesValue);
    } catch (err) {
      // Manejo de errores
      setError("Error al cargar los datos generales");
      console.error("Error fetching general balance data:", err);
    }
  };

  const handleEntryAdded = () => {
    fetchData(selectedEndpoint); // Usa el endpoint actual para refrescar los datos
    fetchMonthlyData();
  };


  //carga de los datos 
  useEffect(() => {
    fetchCategories();
    fetchAccounts();
    fetchMonthlyData();
    fetchData(selectedEndpoint);
  }, [selectedEndpoint, refreshTrigger]);




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
          fetchMonthlyData();
        } catch (error) {
          console.error(`Error al eliminar la ${entry.entryType === "transfer" ? "transferencia" : "transacción"}:`, error);
          message.error(`Error al eliminar la ${entry.entryType === "transfer" ? "transferencia" : "transacción"}`);
        }
      },
    });
  };

  // Paginación
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const paginatedEntries = filteredEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getMonthsArray = () => {
    const months = [];
    for (let i = -2; i <= 2; i++) {
      const date = addMonths(currentMonth, i);
      months.push(date);
    }
    return months;
  };

  // Maneja el clic de navegación y establece el endpoint seleccionado
  const handleNavClick = (endpoint) => {
    setSelectedEndpoint(endpoint); // Actualiza el endpoint seleccionado
    fetchData(endpoint); // Carga los datos de acuerdo al nuevo endpoint
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Barra superior de herramientas */}
      <div className="bg-white border-b sticky top-0 z-0 shadow-sm">
        {/* Sección superior con botones de acción */}
        <div className="max-full mx-auto py-2 px-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-800">Control Financiero</h1>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={openIncomeModal}
                type="primary"
                className="bg-emerald-600 hover:bg-emerald-700 border-none h-11"
                icon={<TrendingUp className="w-4 h-4 mr-2" />}
              >
                Nuevo Ingreso
              </Button>
              <Button
                onClick={openExpenseModal}
                type="primary"
                className="bg-red-500 hover:bg-red-600 border-none h-11"
                icon={<CreditCard className="w-4 h-4 mr-2" />}
              >
                Nuevo Egreso
              </Button>
              <Button
                onClick={openTransferModal}
                type="primary"
                className="bg-blue-500 hover:bg-blue-600 border-none h-11"
                icon={<ArrowLeftRight className="w-4 h-4 mr-2" />}
              >
                Nueva Transferencia
              </Button>

              <button
                onClick={openExpenseModal}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Crear</span>
              </button>
            </div>
          </div>

          {/* Resumen financiero */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {userRole === "superadmin" && (
              <>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Balance Total</p>
                      <p className="text-2xl font-semibold text-gray-900">{formatCurrency(balance)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ingresos Totales</p>
                      <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalIncome)}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {(userRole === "admin" || userRole === "superadmin") && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <CreditCard className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gastos Totales</p>
                    <p className="text-2xl font-semibold text-red-600">{formatCurrency(totalExpenses)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barra de búsqueda */}
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-2xl">
              <Input
                prefix={<Search className="h-4 w-4 text-gray-400" />}
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Navegación entre categorías */}
        <div className="border-t">
          <div className="max-w-7xl mx-auto">
            <Header onNavClick={handleNavClick} />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-full py-4 mx-auto  ">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 450px)' }}>
            {error && (
              <div className="p-2 bg-red-50 border-l-4 border-red-500 text-red-700">
                <p className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </p>
              </div>
            )}

            {selectedEndpoint === "/incomes" && (
              <IncomeTable
                entries={paginatedEntries}
                categories={categories}
                accounts={accounts}
                onDelete={() => {
                  fetchData(selectedEndpoint);
                  fetchMonthlyData();
                }}
                onEdit={openEditModal}
                onOpenContentModal={openContentModal}
                onOpenModal={openModal}
              />
            )}

            {selectedEndpoint === "/expenses" && (
              <ExpenseTable
                entries={paginatedEntries}
                categories={categories}
                accounts={accounts}
                onDelete={() => {
                  fetchData(selectedEndpoint);
                  fetchMonthlyData();
                }}
                onEdit={openEditModal}
                onOpenContentModal={openContentModal}
                onOpenModal={openModal}
              />
            )}

            {selectedEndpoint === "/transfers" && (
              <TransactionTable
                entries={paginatedEntries}
                categories={categories}
                accounts={accounts}
                onDelete={() => {
                  fetchData(selectedEndpoint);
                  fetchMonthlyData();
                }}
                onEdit={openEditModal}
                onOpenContentModal={openContentModal}
                onOpenModal={openModal}
              />
            )}
          </div>
        </div>
      </div>

      {/* Navegación de meses */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-center space-x-4">
            <Button
              type="text"
              icon={<ChevronLeft className="w-4 h-4" />}
              onClick={handlePreviousMonth}
              className="hover:bg-gray-100"
            />

            <div className="flex overflow-x-auto space-x-2 px-2">
              {getMonthsArray().map((date) => {
                const isCurrentMonth = formatDate(date, "yyyy-MM") === formatDate(currentMonth, "yyyy-MM");
                return (
                  <button
                    key={date.getTime()}
                    onClick={() => setCurrentMonth(date)}
                    className={`
                      px-4 py-2 rounded-md text-sm font-medium transition-all
                      ${isCurrentMonth
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50"
                      }
                    `}
                  >
                    {formatDate(date, "MMMM yyyy")}
                  </button>
                );
              })}
            </div>

            <Button
              type="text"
              icon={<ChevronRight className="w-4 h-4" />}
              onClick={handleNextMonth}
              className="hover:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Modales */}
      <AddEntryModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onTransactionAdded={handleEntryAdded}
        transactionToEdit={editTransaction}
        transactionType={transactionType}
      />

      <AddIncome
        isOpen={isIncomeModalOpen}
        onClose={closeIncomeModal}
        onTransactionAdded={handleEntryAdded}
        transactionToEdit={editTransaction}
      />

      <AddExpense
        isOpen={isExpenseModalOpen}
        onClose={closeExpenseModal}
        onTransactionAdded={handleEntryAdded}
        transactionToEdit={editTransaction}
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
