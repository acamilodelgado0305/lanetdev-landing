import React, { useEffect, useState } from "react";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { format as formatDate, subDays, addDays } from "date-fns";
import axios from "axios";
import AddEntryModal from "./addModal";
import {
  getTransactions,
  getTransfers,
  getAccounts,
} from "../../../services/moneymanager/moneyService";
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

const TransactionsDashboard2 = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [entries, setEntries] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);

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

      const filteredEntries = allEntries
        .filter(
          (entry) =>
            new Date(entry.date).toDateString() === currentDate.toDateString()
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setEntries(filteredEntries);
      console.log(filteredEntries)
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
    const formattedDate = formatDate(currentDate, "yyyy-MM-dd");
    try {
      const [balanceResponse, incomeResponse, expensesResponse] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/transactions/balance/${formattedDate}`),
          axios.get(`${API_BASE_URL}/transactions/income/${formattedDate}`),
          axios.get(`${API_BASE_URL}/transactions/expenses/${formattedDate}`),
        ]);

      const balanceValue = parseFloat(balanceResponse.data.balance) || 0;
      const incomeValue = parseFloat(incomeResponse.data.totalIncome) || 0;
      const expensesValue =
        parseFloat(expensesResponse.data.totalExpenses) || 0;

      setBalance(balanceValue);
      setTotalIncome(incomeValue);
      setTotalExpenses(expensesValue);
    } catch (err) {
      setError("Error al cargar los datos diarios");
      console.error("Error fetching daily data:", err);
    }
  };

  const handleEntryAdded = () => {
    fetchEntries();
    fetchDailyData();
  };

  useEffect(() => {
    fetchDailyData();
    fetchEntries();
    fetchAccounts(); 
  }, [currentDate]);

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Cuenta no encontrada";
  };

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen w-full p-4">
      <main className="max-full mx-auto">
        <div className="h-[auto] bg-white rounded-lg shadow-lg p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <button
              className="text-blue-500 hover:text-blue-600 transition-colors"
              onClick={() => setCurrentDate(subDays(currentDate, 1))}
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-semibold">
              {formatDate(currentDate, "d MMM yyyy")}
            </h2>
            <button
              className="text-blue-500 hover:text-blue-600 transition-colors"
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Ingreso</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Gastos</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Balance</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(balance)}
              </p>
            </div>
          </div>

          <div className="space-y-4 max-h-[40rem] overflow-y-auto">
            {entries.map((entry, index) => (
              <Entry
                key={index}
                date={entry.date}
                description={entry.description}
                accountName={getAccountName(entry.account_id)} 
                note={entry.note}
                amount={entry.amount}
                type={entry.type}
                entryType={entry.entryType}
                fromAccountName={getAccountName(entry.from_account_id)} // Pasa el nombre de la cuenta de origen
                toAccountName={getAccountName(entry.to_account_id)}     // Pasa el nombre de la cuenta de destino
              />
            ))}
          </div>

          <button
            onClick={openModal}
            className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-colors duration-300"
            aria-label="Añadir entrada"
          >
            <PlusCircle size={24} />
          </button>
          <AddEntryModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onTransactionAdded={handleEntryAdded}
          />
        </div>
      </main>
    </div>
  );
};

const Entry = ({ date, description, accountName, note, amount, type, entryType, fromAccountName, toAccountName }) => (
  <div className="border-t pt-4">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center">
        <span className="text-lg font-semibold mr-2">
          {formatDate(new Date(date), "d MMM")}
        </span>
      </div>
      <div className="flex justify-center space-x-4">
        <span
          className={`font-semibold ${
            type === "expense" ? "text-red-500" : "text-blue-500"
          }`}
        >
          {type === "expense" ? "-" : "+"}
          {formatCurrency(amount)}
        </span>
      </div>
    </div>
    <div className="flex items-center">
      <span className="text-2xl mr-3">
        {entryType === "transfer" ? "🔄" : type === "expense" ? "🔴" : "✅"}
      </span>
      <div>
        <p className="font-medium">{description}</p>
        <p className="text-sm text-blue-500">
          {entryType === "transfer"
            ? ` ${fromAccountName} ➡️ ${toAccountName}`
            : accountName}
        </p>
        {note && <p className="text-sm text-gray-500">{note}</p>}
        {entryType === "transfer" && (
          <p className="text-xs text-gray-400">Transferencia</p>
        )}
      </div>
    </div>
  </div>
);

export default TransactionsDashboard2;