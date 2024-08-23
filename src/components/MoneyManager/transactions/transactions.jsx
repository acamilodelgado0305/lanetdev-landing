import React, { useEffect, useState } from "react";
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { format as formatDate, subDays, addDays } from "date-fns";
import AddEntryModal from "../addModal";
import { getTransactions } from "../../../services/moneymanager/moneyService";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const TransactionsDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      const filteredTransactions = data
        .filter(
          (tx) =>
            new Date(tx.date).toDateString() === currentDate.toDateString()
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(filteredTransactions);

      let income = 0;
      let expenses = 0;
      filteredTransactions.forEach(tx => {
        if (tx.type === "income") {
          income += tx.amount;
        } else if (tx.type === "expense") {
          expenses += tx.amount;
        }
      });

      setTotalIncome(income);
      setTotalExpenses(expenses);

    } catch (err) {
      setError("Error al cargar las transacciones");
      console.error("Error fetching transactions:", err);
    }
  };

  const handleTransactionAdded = () => {
    fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentDate]);

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  const balance = totalIncome - totalExpenses;

  return (
    <div className="bg-gray-100 min-h-screen w-full p-4">
      <main className="max-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
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

          <div className="space-y-4 max-h-[24rem] overflow-y-auto">
            {transactions.map((transaction, index) => (
              <Transaction
                key={index}
                date={transaction.date}
                description={transaction.description}
                note={transaction.note}
                amount={transaction.amount}
                type={transaction.type}
              />
            ))}
          </div>
          
          <button
            onClick={openModal}
            className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-colors duration-300"
            aria-label="Añadir transacción"
          >
            <PlusCircle size={24} />
          </button>
          <AddEntryModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onTransactionAdded={handleTransactionAdded}
          />
        </div>
      </main>
    </div>
  );
};

const Transaction = ({ date, description, note, amount, type }) => (
  <div className="border-t pt-4">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center">
        <span className="text-lg font-semibold mr-2">
          {formatDate(new Date(date), "d MMM")}
        </span>
      </div>
      <div className="flex justify-center space-x-4">
        <span className={`font-semibold ${type === "expense" ? "text-red-500" : "text-blue-500"}`}>
          {type === "expense" ? "-" : "+"}
          {formatCurrency(amount)}
        </span>
      </div>
    </div>
    <div className="flex items-center">
      <span className="text-2xl mr-3">
        {type === "expense" ? "💸" : "💰"}
      </span>
      <div>
        <p className="font-medium">{description}</p>
        {note && <p className="text-sm text-gray-500">{note}</p>}
      </div>
    </div>
  </div>
);

export default TransactionsDashboard;