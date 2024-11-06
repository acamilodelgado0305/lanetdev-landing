import React, { useEffect, useState } from "react";
import { PlusOutlined, SearchOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { format as formatDate, startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import axios from "axios";
import { Modal, message, Input, Select, Button, Tooltip, Card, Statistic } from "antd";
import AddEntryModal from "./addModal";
import AddIncome from "./Add/AddIncome";
import {
  getTransactions,
  getTransfers,
  getAccounts,
  getCategories,
  deleteTransaction,
  deleteTransfer
} from "../../../services/moneymanager/moneyService";
import NoteContentModal from "./ViewImageModal";
import TransactionTable from "./components/TransactionTable";
import { useAuth } from '../../Context/AuthProvider';
import Header from "./components/Header";
import { TrendingUp, DollarSign, CreditCard } from 'lucide-react';

const { Option } = Select;
const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;
console.log('API Base URL:', import.meta.env.VITE_API_FINANZAS);

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
  const [selectedNoteContent, setSelectedNoteContent] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
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



  const openModal = () => {
    setEditTransaction(null);
    setIsModalOpen(true);
  };

  const openContentModal = (noteContent) => {
    setSelectedNoteContent(noteContent);
    setIsContentModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditTransaction(entry);
    setIsModalOpen(true);
  };

  const closeContentModal = () => {
    setIsContentModalOpen(false);
    setSelectedNoteContent("");
  };

  const openIncomeModal = () => {
    setIsIncomeModalOpen(true);
    setEditTransaction(null);
  };

  const openExpenseModal = () => {
    setTransactionType('expense');
    setIsModalOpen(true);
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
  };

  const fetchEntries = async () => {
    try {
      const [transactions, transfers] = await Promise.all([
        getTransactions(),
        getTransfers(),
      ]);

      const allEntries = [
        ...transactions.map((tx) => ({ ...tx, entryType: "transaction" })),
        ...transfers.map((tf) => ({ ...tf, entryType: "transfer" })),
      ];

      const sortedEntries = allEntries.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setEntries(sortedEntries); // Actualiza todas las transacciones
    } catch (error) {
      console.error("Error fetching all transactions:", error);
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
      const [balanceResponse, incomeResponse, expensesResponse] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/transactions/balance/month/${monthYear}`),
          axios.get(`${API_BASE_URL}/transactions/income/month/${monthYear}`),
          axios.get(`${API_BASE_URL}/transactions/expenses/month/${monthYear}`),
        ]);

      const balanceValue = parseFloat(balanceResponse.data.balance) || 0;
      const incomeValue = parseFloat(incomeResponse.data.totalIncome) || 0;
      const expensesValue =
        parseFloat(expensesResponse.data.totalExpenses) || 0;

      setBalance(balanceValue);
      setTotalIncome(incomeValue);
      setTotalExpenses(expensesValue);
    } catch (err) {
      setError("Error al cargar los datos mensuales");
      console.error("Error fetching monthly data:", err);
    }
  };

  const handleEntryAdded = () => {
    fetchEntries();
    fetchMonthlyData();
  };

  useEffect(() => {
    fetchCategories();
    fetchMonthlyData();
    fetchEntries();
    fetchAccounts();
  }, [currentMonth]);

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
          (entry.note && entry.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
  const currentEntries = filteredEntries.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  const getMonthsArray = () => {
    const months = [];
    for (let i = -2; i <= 2; i++) {
      const date = addMonths(currentMonth, i);
      months.push(date);
    }
    return months;
  };
  const fetchData = async (endpoint) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`);
      setEntries(response.data);
    } catch (error) {
      setError("Error al cargar los datos");
      console.error("Error al realizar la solicitud:", error);
    }
  };
  useEffect(() => {
    // Cargar datos iniciales (opcional, dependiendo de la pestaña que quieras cargar primero)
    fetchData("/incomes");
  }, []);

  return (
    <div className="flex-1 bg-white]">



      {/* Barra superior de herramientas */}
      <div className="py-2 border bg-white sticky top-0 shadow-sm">
        <div className="w-full flex items-end justify-end">
          <div className="flex gap-3">
            <Button
              onClick={openIncomeModal}
              className="bg-green-500 hover:bg-green-600 text-white h-12 px-6"
            >
              Nuevo Ingreso
            </Button>

            <Button
              onClick={openExpenseModal}
              className="bg-red-500 hover:bg-red-600 text-white h-12 px-6"
            >
              Nuevo Egreso
            </Button>

            <Button
              onClick={openTransferModal}
              className="bg-blue-500 hover:bg-blue-600 text-white h-12 px-6"
            >
              Nueva Transferencia
            </Button>
          </div>

        </div>





        <div className="w-full flex items-center justify-center">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[17em] px-6 py-4">
            {userRole === "superadmin" && (
              <div className="flex items-center space-x-4">
                <div className="bg-green-50 p-4 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Balance</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(balance)}
                  </div>
                </div>
              </div>
            )}

            {userRole === "superadmin" && (
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-4 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Ventas totales</div>
                  <div className="text-xl font-semibold text-green-600">
                    {formatCurrency(totalIncome)}
                  </div>
                </div>
              </div>
            )}

            {(userRole === "admin" || userRole === "superadmin") && (
              <div className="flex items-center space-x-4">
                <div className="bg-red-50 p-4 rounded-full">
                  <CreditCard className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Gastos totales</div>
                  <div className="text-xl font-semibold text-red-600">
                    {formatCurrency(totalExpenses)}
                  </div>
                </div>
              </div>
            )}
          </div>



        </div>




        <div className="w-full flex items-center justify-center">
          <div className="w-[25em]">
            <div className="relative">
              <Input
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />

            </div>
          </div>
        </div>
      </div>
      <div className="my-1">
        <Header onNavClick={fetchData} />
      </div>



      {/* Contenido principal */}
      <div className="overflow-y-auto h[40em]">
        <div className="border border-gray-200 rounded-lg h-full flex flex-col">
          {error && <p className="text-red-500">{error}</p>}
          <TransactionTable
            entries={entries}
            categories={categories}
            accounts={accounts}
            onDelete={handleDelete}
            onEdit={openEditModal}
            onOpenContentModal={openContentModal}
            onOpenModal={openModal} />
        </div>
      </div>

      {/* Navegación de meses estilo Google Sheets */}
      <div className="fixed bottom-0 mx-0 w-full bg-gray-50 border-t border-gray-200 flex justify-center items-center py-2 z-50">
        <div className="flex items-center space-x-4">
          <Button
            type="text"
            size="small"
            icon={<LeftOutlined />}
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          />

          <div className="flex overflow-x-auto space-x-1 px-2">
            {getMonthsArray().map((date) => (
              <button
                key={date.getTime()}
                onClick={() => setCurrentMonth(date)}
                className={`px-4 py-1 text-xs rounded-t border-t-2 min-w-max ${formatDate(date, "yyyy-MM") === formatDate(currentMonth, "yyyy-MM")
                  ? "bg-white text-blue-600 border-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100 border-transparent"
                  }`}
              >
                {formatDate(date, "MMMM yyyy")}
              </button>
            ))}
          </div>

          <Button
            type="text"
            size="small"
            icon={<RightOutlined />}
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          />
        </div>
      </div>

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

      <NoteContentModal
        isOpen={isContentModalOpen}
        onClose={closeContentModal}
        noteContent={selectedNoteContent}
      />
    </div>
  );
};

export default TransactionsDashboard;