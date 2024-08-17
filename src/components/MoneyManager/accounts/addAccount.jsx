import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

const AddAccountModal = ({ isOpen, onClose }) => {
  const apiUrl = import.meta.env.VITE_API_FINANZAS;

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState("");

  const handleSave = async () => {
    const accountData = {
      name: name,
      balance: parseFloat(balance),
      type: type
    };

    try {
      const response = await fetch(`${apiUrl}/accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      if (response.ok) {
        console.log("Cuenta creada con éxito");
        onClose();
      } else {
        console.error("Error al crear la cuenta");
      }
    } catch (error) {
      console.error("Error al conectar con la API:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Nueva Cuenta
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label
              htmlFor="type"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Tipo de Cuenta
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded border border-gray-300"
            >
              <option value="">Selecciona un tipo</option>
              <option value="Banco">Banco</option>
              <option value="Dinero en Efectivo">Dinero en Efectivo</option>
              <option value="Cajeros">Cajeros</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="name"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Nombre de la Cuenta
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded border border-gray-300"
              placeholder="Ej: Cuenta de Ahorros"
            />
          </div>
          <div>
            <label
              htmlFor="balance"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Saldo Inicial
            </label>
            <input
              type="number"
              id="balance"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded border border-gray-300"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex p-4 border-t border-gray-200">
          <button
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg mr-2 hover:bg-blue-600"
            onClick={handleSave}
          >
            Guardar
          </button>
          <button
            className="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg ml-2 hover:bg-gray-400"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAccountModal;