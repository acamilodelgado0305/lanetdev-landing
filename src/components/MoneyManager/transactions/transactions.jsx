import React, { useEffect, useState } from "react";
import {
  PlusCircle,
} from "lucide-react";
import {
  format as formatDate,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from "date-fns";
import axios from "axios";
import AddEntryModal from "./addModal";
import {
  getTransactions,
  getTransfers,
  getAccounts,
  getCategories,
  deleteTransaction,
  deleteTransfer
} from "../../../services/moneymanager/moneyService";
import { Modal, message } from "antd";
import NoteContentModal from "./ViewImageModal";
import TransactionTable from "./components/TransactionTable";
import TransactionFilters from "./components/TransactionFilters";
import { useAuth } from '../../Context/AuthProvider';

const API_BASE_URL = import.meta.env.VITE_API_FINANZAS;

const formatCurrency = (amount) => {
  if (isNaN(amount)) {
    return "$0.00";
  }
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
  const closeModal = () => setIsModalOpen(false);

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

  /*   const fetchEntries = async () => {
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
    }; */

  const fetchEntries = async () => {
    try {
      const [transactions, transfers] = await Promise.all([
        getTransactions(),
        getTransfers(),
      ]);

      // Filtrar solo las transacciones con estado true
      const filteredTransactions = transactions.filter(tx => tx.status === true);

      const allEntries = [
        ...filteredTransactions.map((tx) => ({
          ...tx,
          entryType: "transaction"
        })),
        ...transfers.map((tf) => ({
          ...tf,
          entryType: "transfer",
        })),
      ];

      // Ordenar por fecha de más reciente a más antigua
      const sortedEntries = allEntries.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setEntries(sortedEntries);
      applyFilters(sortedEntries);
    } catch (err) {
      setError("Error al cargar las entradas");
      console.error("Error fetching entries:", err);
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

  const getCategoryName = (categoryId) => {
    if (!categories || categories.length === 0) return "Categoría no encontrada";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Categoría no encontrada";
  };

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Cuenta no encontrada";
  };

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

  return (
    <div className="bg-gray-100  w-full p-2">
      <main className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 relative h-full overflow-hidden">
          {/* Filtros y controles de búsqueda */}
          <TransactionFilters
            currentMonth={currentMonth}
            searchTerm={searchTerm}
            filterType={filterType}
            onSearchChange={(term) => setSearchTerm(term)}
            onFilterChange={(type) => setFilterType(type)}
            onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
            onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
          />

          {/* Sección de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {userRole === "superadmin" && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Ingreso</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            )}
            {(userRole === "admin" || userRole === "superadmin") && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Gastos</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            )}
            {userRole === "superadmin" && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Balance</p>
                <p className="text-xl font-bold text-black-600">
                  {formatCurrency(balance)}
                </p>
              </div>
            )}
          </div>

          {/* Tabla de transacciones */}
          <TransactionTable
            entries={currentEntries}
            categories={categories}
            accounts={accounts}
            onDelete={handleDelete}
            onEdit={openEditModal}
            onOpenContentModal={openContentModal}
            onOpenModal={openModal}
          />
          {/* Paginación */}
          <div className="mt-2 flex justify-center">
            {Array.from({
              length: Math.ceil(filteredEntries.length / entriesPerPage),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`mx-1 px-2 py-1 rounded text-xs ${currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={openModal}
            className="fixed bottom-11 right-11 bg-[#FE6256] hover:bg-[#FFA38E] text-white rounded-full p-3 shadow-lg transition-colors duration-300"
            aria-label="Añadir entrada"
          >
            <PlusCircle size={30} />
          </button>

          {/* Modales */}
          <AddEntryModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onTransactionAdded={handleEntryAdded}
            transactionToEdit={editTransaction}
          />
          <NoteContentModal
            isOpen={isContentModalOpen}
            onClose={closeContentModal}
            noteContent={selectedNoteContent}
          />
        </div>
      </main>
    </div>
  );
};

export default TransactionsDashboard;
