import React, { useState } from "react";
import {
  IoSearchOutline,
  IoStarOutline,
  IoMenuOutline,
  IoAddCircleOutline,
} from "react-icons/io5";
import { BsPlusCircleFill } from "react-icons/bs";
import AddEntryModal from "../addModal";


const Transactions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);



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
            <button className="text-blue-500">&lt;</button>
            <h2 className="text-lg font-semibold">ago 2024</h2>
            <button className="text-blue-500">&gt;</button>
          </div>

          <div className="flex items-center justify-center space-x-4 mb-6">
            {["Diario", "Calendario", "Mensual", "Resumen", "Descripción"].map(
              (tab, index) => (
                <button
                  key={tab}
                  className={`text-sm font-medium ${
                    index === 0
                      ? "text-blue-500 border-b-2 border-blue-500"
                      : "text-gray-500"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            <div>
              <p className="text-sm text-gray-500">Ingreso</p>
              <p className="text-lg font-semibold text-blue-500">860,500.00</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gastos</p>
              <p className="text-lg font-semibold text-red-500">418,000.00</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="text-lg font-semibold text-green-500">442,500.00</p>
            </div>
          </div>

          <div className="space-y-4">
            <DayTransactions
              date="13"
              day="mar"
              income="110,000.00"
              expense="180,000.00"
              transactions={[
                {
                  category: "Educación",
                  description: "Universidad",
                  account: "RAPPYPAY",
                  amount: -180000,
                  type: "expense",
                },
               
               
              ]}
            />

            <DayTransactions
              date="12"
              day="lun"
              income="139,000.00"
              expense="12,000.00"
              transactions={[
                {
                  category: "FEVA",
                  description: "NEQUI",
                  amount: 130000,
                  type: "income",
                },
              ]}
            />
          </div>
          <div className="w-[90%] flex justify-end items-end">
            <button
              onClick={openModal}
              className="text-blue-500 hover:text-blue-600 focus:outline-none"
              aria-label="Añadir entrada"
            >
              <BsPlusCircleFill color="red" size={50} />
            </button>
            <AddEntryModal isOpen={isModalOpen} onClose={closeModal} />
          </div>
        </div>
      </main>
    </div>
  );
};

const DayTransactions = ({ date, day, income, expense, transactions }) => (
  <div className="border-t pt-4">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center">
        <span className="text-lg font-semibold mr-2">{date}</span>
        <span className="text-sm text-gray-500">{day}</span>
      </div>
      <div className="flex justify-center space-x-4">
        <span className="text-blue-500">${income}</span>
        <span className="text-red-500">${expense}</span>
      </div>
    </div>
    <div className="space-y-2">
      {transactions.map((transaction, index) => (
        <div key={index} className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl mr-2">
              {transaction.category === "Educación"
                ? "📚"
                : transaction.category === "Transferencia"
                ? "🔄"
                : transaction.category === "Dinero"
                ? "💰"
                : transaction.category === "CLASES"
                ? "📚"
                : transaction.category === "FEVA"
                ? "📚"
                : transaction.category === "Comida"
                ? "🍽️"
                : "💼"}
            </span>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-gray-500">{transaction.account}</p>
            </div>
          </div>
          <span
            className={
              transaction.type === "expense" ? "text-red-500" : "text-blue-500"
            }
          >
            {transaction.type === "expense" ? "-" : ""}$
            {Math.abs(transaction.amount).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default Transactions;