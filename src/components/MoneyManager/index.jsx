import React, { useState } from "react";
import { BsPlusCircleFill } from "react-icons/bs";
import AddEntryModal from "./addModal"; // Asegúrate de crear este componente

const data = [
  { date: "2024-08-01", income: 500, expense: 200 },
  { date: "2024-08-02", income: 700, expense: 300 },
  { date: "2024-08-03", income: 600, expense: 400 },
];

const FinanceTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Resumen de Ingresos y Gastos</h2>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Ingresos</th>
              <th className="px-4 py-2 text-left">Gastos</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border px-4 py-2">{row.date}</td>
                <td className="border px-4 py-2 text-green-600">${row.income}</td>
                <td className="border px-4 py-2 text-red-600">${row.expense}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={openModal}
          className="text-blue-500 hover:text-blue-600 focus:outline-none"
          aria-label="Añadir entrada"
        >
          <BsPlusCircleFill size={24} />
        </button>
      </div>
      <AddEntryModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default FinanceTable;