import React, { useEffect, useState } from "react";
import { format as formatDate, subDays, addDays, parseISO } from "date-fns";
import {
  getTransactions,
  getTransfers,
  getAccounts,
} from "../../../services/moneymanager/moneyService";

import AddEntryModal from "./addModal"

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
  
  // State for filters
  const [dateRange, setDateRange] = useState({ start: subDays(new Date(), 30), end: new Date() });
  const [accountFilter, setAccountFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const openModal = () => {
    setIsModalOpen(true);
  };
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

  const fetchDailyData = async () => {
    // This function might need to be adjusted to fetch data for a date range
    // For now, we'll just use it to set some example values
    setTotalIncome(10000);
    setTotalExpenses(7500);
    setBalance(2500);
  };

  const handleEntryAdded = () => {
    fetchEntries();
    fetchDailyData();
  };

  useEffect(() => {
    fetchDailyData();
    fetchEntries();
    fetchAccounts();
  }, []);

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Cuenta no encontrada";
  };

  const filteredEntries = entries.filter((entry) => {
    const entryDate = parseISO(entry.date);
    const matchesDateRange = entryDate >= dateRange.start && entryDate <= dateRange.end;
    const matchesAccount = accountFilter === "all" || entry.account_id === accountFilter;
    const matchesType = typeFilter === "all" || entry.type === typeFilter;
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesDateRange && matchesAccount && matchesType && matchesSearch;
  });

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen w-full p-4">
      <main className="max-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Panel de Transacciones</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Ingreso Total</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Gasto Total</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Balance</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(balance)}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="date"
              value={formatDate(dateRange.start, "yyyy-MM-dd")}
              onChange={(e) => setDateRange({ ...dateRange, start: parseISO(e.target.value) })}
              className="p-2 border rounded"
            />
            <input
              type="date"
              value={formatDate(dateRange.end, "yyyy-MM-dd")}
              onChange={(e) => setDateRange({ ...dateRange, end: parseISO(e.target.value) })}
              className="p-2 border rounded"
            />
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">Todas las cuentas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 border rounded"
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
              className="p-2 border rounded"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Descripción</th>
                  <th className="p-3 text-left">Cuenta</th>
                  <th className="p-3 text-left">Tipo</th>
                  <th className="p-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{formatDate(parseISO(entry.date), "dd/MM/yyyy")}</td>
                    <td className="p-3">{entry.description}</td>
                    <td className="p-3">
                      {entry.entryType === "transfer"
                        ? `${entry.fromAccountName} ➡️ ${entry.toAccountName}`
                        : getAccountName(entry.account_id)}
                    </td>
                    <td className="p-3">
                      {entry.entryType === "transfer" ? "Transferencia" : entry.type}
                    </td>
                    <td className={`p-3 text-right ${
                      entry.type === "expense" ? "text-red-500" : "text-blue-500"
                    }`}>
                      {formatCurrency(entry.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button 
          onClick={openModal}
          className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-colors duration-300"
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

export default TransactionsDashboard