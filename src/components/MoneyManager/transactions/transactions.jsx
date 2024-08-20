import React, { useEffect, useState } from "react";
import {
  IoSearchOutline,
  IoStarOutline,
  IoMenuOutline,
} from "react-icons/io5";
import { BsPlusCircleFill } from "react-icons/bs";
import { format as formatDate, subDays, addDays } from "date-fns";
import AddEntryModal from "../addModal";
import { getTransactions } from "../../../services/moneymanager/moneyService";

const formatCOP = (amount) => {
  return amount.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
  });
};

const TransactionsDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      // Ordenar las transacciones por fecha en orden descendente
      setTransactions(
        data
          .filter(
            (tx) =>
              new Date(tx.date).toDateString() === currentDate.toDateString()
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      );
    } catch (err) {
      setError("Error al cargar las transacciones");
      console.error("Error fetching transactions:", err);
    }
  };

  const handleTransactionAdded = () => {
    fetchTransactions(); // Llamar a la función de actualización
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentDate]);

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen w-full">
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <IoSearchOutline className="text-gray-600 text-xl" />
          <h1 className="text-xl font-semibold text-gray-800">Trans.</h1>
          <div className="flex space-x-4">
            <IoStarOutline className="text-gray-600 text-xl" />
            <IoMenuOutline className="text-gray-600 text-xl" />
          </div>
        </div>
      </header>

      <main className="mx-auto pt-6">
        <div className="h-[39em] bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <button
              className="text-blue-500"
              onClick={() => setCurrentDate(subDays(currentDate, 1))}
            >
              &lt;
            </button>
            <h2 className="text-lg font-semibold">
              {formatDate(currentDate, "d MMM yyyy")}
            </h2>
            <button
              className="text-blue-500"
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
            >
              &gt;
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div>
              <p className="text-sm text-gray-500">Ingreso</p>
              <p className="text-lg font-semibold text-blue-500">
                {formatCOP(
                  transactions
                    .filter((tx) => tx.type === "income")
                    .reduce((total, tx) => total + tx.amount, 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gastos</p>
              <p className="text-lg font-semibold text-red-500">
                {formatCOP(
                  transactions
                    .filter((tx) => tx.type === "expense")
                    .reduce((total, tx) => total + tx.amount, 0)
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-lg font-semibold text-green-500">
                {formatCOP(
                  transactions.reduce(
                    (total, tx) =>
                      tx.type === "income"
                        ? total + tx.amount
                        : total - tx.amount,
                    0
                  )
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
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
          <div className="w-[90%] flex justify-end items-end">
            <button
              onClick={openModal}
              className="text-blue-500 hover:text-blue-600 focus:outline-none"
              aria-label="Añadir entrada"
            >
              <BsPlusCircleFill color="red" size={50} />
            </button>
            <AddEntryModal
              isOpen={isModalOpen}
              onClose={closeModal}
              onTransactionAdded={handleTransactionAdded}
            />
          </div>
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
        <span className={type === "expense" ? "text-red-500" : "text-blue-500"}>
          {type === "expense" ? "-" : ""}
          {formatCOP(amount)}
        </span>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl mr-2">
            {type === "expense" ? "💸" : "💰"}
          </span>
          <div>
            <p className="font-medium">{description}</p>
            <p className="text-sm text-gray-500">{note}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TransactionsDashboard;
