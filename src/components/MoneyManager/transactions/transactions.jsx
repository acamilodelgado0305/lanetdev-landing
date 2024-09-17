import React, { useEffect, useState } from "react";
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
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
import { Table, Input, Button, Dropdown, Menu, Modal, message } from "antd";
import {
  FaTrashAlt,
  FaUserEdit,
  FaSearch,
  FaFilter,
  FaDownload,
} from "react-icons/fa";

import NoteContentModal from "./ViewImageModal";

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

  const [isContentModalOpen, setIsContentModalOpen] = useState(false); // Estado para el modal de contenido
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

  const fetchEntries = async () => {
    try {
      const [transactions, transfers] = await Promise.all([
        getTransactions(),
        getTransfers(),
      ]);

      const allEntries = [
        ...transactions.map((tx) => ({ ...tx, entryType: "transaction" })),
        ...transfers.map((tf) => ({
          ...tf,
          entryType: "transfer",
        })),
      ];

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
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Categoría no encontrada";
  };

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Cuenta no encontrada";
  };

  const applyFilters = (entriesToFilter = entries) => {
    let filtered = entriesToFilter;

    // Apply month filter
    filtered = filtered.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate >= startOfMonth(currentMonth) &&
        entryDate <= endOfMonth(currentMonth)
      );
    });

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (entry) =>
          entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.note &&
            entry.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (entry.category &&
            entry.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((entry) =>
        filterType === "transfer"
          ? entry.entryType === "transfer"
          : entry.type === filterType
      );
    }

    setFilteredEntries(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, entries, currentMonth]);

  // Pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }


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
          fetchMonthlyData(); // Actualizamos los totales después de eliminar
        } catch (error) {
          console.error(`Error al eliminar la ${entry.entryType === "transfer" ? "transferencia" : "transacción"}:`, error);
          message.error(`Error al eliminar la ${entry.entryType === "transfer" ? "transferencia" : "transacción"}`);
        }
      },
    });
  };




  return (
    <div className="bg-gray-100 min-h-screen w-full p-2">
      <main className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 relative h-[70vh] overflow-hidden">
          {/* Encabezado con controles de mes */}
          <div className="flex justify-between items-center mb-4">
            <button
              className="text-blue-500 hover:text-blue-600 transition-colors"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold">
              {formatDate(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              className="text-blue-500 hover:text-blue-600 transition-colors"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Sección de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Ingreso</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Gastos</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Balance</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(balance)}
              </p>
            </div>
          </div>

          {/* Controles de búsqueda y filtro */}
          <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar transacciones..."
                className="mx-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8 pr-2 py-1 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className="ml-[94%] md:ml-[90%] -mt-8 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-400" />
              <select
                className="border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="income">Ingresos</option>
                <option value="expense">Gastos</option>
                <option value="transfer">Transferencias</option>
              </select>
            </div>
          </div>

          {/* Contenedor de la tabla con scroll vertical y horizontal */}
          <div className="overflow-auto max-h-[40vh]">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuenta
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impuestos
                  </th>
                  {/* <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th> */}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comprobante
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentEntries.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(new Date(entry.date), "d MMM yyyy")}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">
                        {entry.description}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                      {entry.entryType === "transfer"
                        ? `${getAccountName(entry.from_account_id)} ➡️ ${getAccountName(entry.to_account_id)}`
                        : getAccountName(entry.account_id)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                      {getCategoryName(entry.category_id) || "Sin categoría"}
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap text-xs font-medium ${entry.type === "expense" ? "text-red-600" : "text-blue-600"}`}>
                      {entry.type === "expense" ? "-" : "+"}
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                      {entry.taxes ? (
                        <div>
                          <p>{`Retención: ${entry.taxes.retention}%`}</p>
                          <p>{`Impuesto: ${entry.taxes.amount}`}</p>
                        </div>
                      ) : (
                        "No aplica"
                      )}
                    </td>
                    {/* <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                      {entry.entryType === "transfer" ? "Transferencia" : entry.type}
                    </td> */}
                    <td className="px-4 py-2 whitespace-nowrap text-xs">
                      {entry.note ? (
                        <button className="text-blue-500 hover:text-blue-600" onClick={() => openContentModal(entry.note)}>
                          Ver contenido
                        </button>
                      ) : (
                        "No hay contenido"
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                      <Button
                        className="mr-1"
                        icon={<FaTrashAlt />}
                        onClick={() => handleDelete(entry)}
                        danger
                        size="small"
                      />

                      <Button
                        onClick={() => openEditModal(entry)}
                        icon={<FaUserEdit />}
                        type="primary"
                        size="small"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
            className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-colors duration-300"
            aria-label="Añadir entrada"
          >
            <PlusCircle size={20} />
          </button>
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
