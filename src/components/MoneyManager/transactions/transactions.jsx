import React, { useEffect, useState, useMemo } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  format as formatDate,
  subDays,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  getTransactions,
  getTransfers,
  getAccounts,
} from "../../../services/moneymanager/moneyService";
import AddEntryModal from "./addModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);

  // Enhanced filters
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [accountFilter, setAccountFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilterType, setDateFilterType] = useState("custom");
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
          fromAccountName: getAccountName(tf.from_account_id),
          toAccountName: getAccountName(tf.to_account_id),
        })),
      ];

      setEntries(allEntries);
      updateFinancialSummary(allEntries);
    } catch (err) {
      setError("Error al cargar las entradas");
      console.error("Error fetching entries:", err);
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

  const updateFinancialSummary = (entries) => {
    const income = entries
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0);
    const expenses = entries
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0);
    setTotalIncome(income);
    setTotalExpenses(expenses);
    setBalance(income - expenses);
  };

  const handleEntryAdded = () => {
    fetchEntries();
  };

  useEffect(() => {
    fetchEntries();
    fetchAccounts();
  }, []);

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Cuenta no encontrada";
  };

  const handleDateFilterChange = (filterType) => {
    const today = new Date();
    let start, end;

    switch (filterType) {
      case "week":
        start = startOfWeek(today);
        end = endOfWeek(today);
        break;
      case "month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "custom":
        return;
      default:
        start = subDays(today, 30);
        end = today;
    }

    setDateFilterType(filterType);
    setDateRange({ start, end });
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = parseISO(entry.date);
      const matchesDateRange =
        entryDate >= dateRange.start && entryDate <= dateRange.end;
      const matchesAccount =
        accountFilter === "all" || entry.account_id === accountFilter;
      const matchesType = typeFilter === "all" || entry.type === typeFilter;
      const matchesSearch = entry.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesAmount =
        (amountRange.min === "" || entry.amount >= Number(amountRange.min)) &&
        (amountRange.max === "" || entry.amount <= Number(amountRange.max));

      return (
        matchesDateRange &&
        matchesAccount &&
        matchesType &&
        matchesSearch &&
        matchesAmount
      );
    });
  }, [entries, dateRange, accountFilter, typeFilter, searchTerm, amountRange]);

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredEntries.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Prepare data for the chart

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen w-full p-4">
      <main className="max-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Panel de Control Financiero
          </h1>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                Ingreso Total
              </h2>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Gasto Total
              </h2>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                Balance
              </h2>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(balance)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Filtros
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <select
                value={dateFilterType}
                onChange={(e) => handleDateFilterChange(e.target.value)}
                className="p-2 border rounded w-full"
              >
                <option value="custom">Personalizado</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
              </select>
              {dateFilterType === "custom" && (
                <>
                  <input
                    type="date"
                    value={formatDate(dateRange.start, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        start: parseISO(e.target.value),
                      })
                    }
                    className="p-2 border rounded w-full"
                  />
                  <input
                    type="date"
                    value={formatDate(dateRange.end, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setDateRange({
                        ...dateRange,
                        end: parseISO(e.target.value),
                      })
                    }
                    className="p-2 border rounded w-full"
                  />
                </>
              )}
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="p-2 border rounded w-full"
              >
                <option value="all">Todas las cuentas</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="p-2 border rounded w-full"
              >
                <option value="all">Todos los tipos</option>
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
                <option value="transfer">Transferencia</option>
              </select>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border rounded w-full"
              />
              <input
                type="number"
                placeholder="Monto mínimo"
                value={amountRange.min}
                onChange={(e) =>
                  setAmountRange({ ...amountRange, min: e.target.value })
                }
                className="p-2 border rounded w-full"
              />
              <input
                type="number"
                placeholder="Monto máximo"
                value={amountRange.max}
                onChange={(e) =>
                  setAmountRange({ ...amountRange, max: e.target.value })
                }
                className="p-2 border rounded w-full"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b text-gray-800">
              Transacciones
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left font-semibold text-gray-600">
                      Fecha
                    </th>
                    <th className="p-3 text-left font-semibold text-gray-600">
                      Descripción
                    </th>
                    <th className="p-3 text-left font-semibold text-gray-600">
                      Cuenta
                    </th>
                    <th className="p-3 text-left font-semibold text-gray-600">
                      Tipo
                    </th>
                    <th className="p-3 text-right font-semibold text-gray-600">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((entry, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-700">
                        {formatDate(parseISO(entry.date), "dd/MM/yyyy")}
                      </td>
                      <td className="p-3 text-gray-700">{entry.description}</td>
                      <td className="p-3 text-gray-700">
                        {entry.entryType === "transfer"
                          ? `${entry.fromAccountName} ➡️ ${entry.toAccountName}`
                          : getAccountName(entry.account_id)}
                      </td>
                      <td className="p-3 text-gray-700">
                        {entry.entryType === "transfer"
                          ? "Transferencia"
                          : entry.type}
                      </td>
                      <td
                        className={`p-3 text-right font-semibold ${
                          entry.type === "expense"
                            ? "text-red-500"
                            : "text-blue-500"
                        }`}
                      >
                        {formatCurrency(entry.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            {Array.from({
              length: Math.ceil(filteredEntries.length / entriesPerPage),
            }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={openModal}
          className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors duration-300"
        >
          + Añadir entrada
        </button>

        {isModalOpen && (
          <AddEntryModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onTransactionAdded={handleEntryAdded}
          />
        )}
      </main>
    </div>
  );
};

export default TransactionsDashboard;
