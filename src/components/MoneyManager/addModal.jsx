import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

const AddEntryModal = ({ isOpen, onClose, onTransactionAdded }) => {
  const apiUrl = import.meta.env.VITE_API_FINANZAS;

  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [fromAccount, setFromAccount] = useState(""); // Nueva cuenta de origen para transferencias
  const [toAccount, setToAccount] = useState(""); // Nueva cuenta de destino para transferencias
  const [note, setNote] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const currentDate = new Date().toISOString().split("T")[0]; // Fecha actual en formato YYYY-MM-DD

  useEffect(() => {
    // Fetch categories and accounts from the API
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiUrl}/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error al obtener las categorías:", error);
      }
    };

    const fetchAccounts = async () => {
      try {
        const response = await fetch(`${apiUrl}/accounts`);
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        console.error("Error al obtener las cuentas:", error);
      }
    };

    fetchCategories();
    fetchAccounts();
  }, []);

  const handleSave = async () => {
    let transactionData = {
      userId: 1,
      amount: parseFloat(amount),
      type: transactionType.toLowerCase(),
      date: new Date().toISOString(),
      note: note,
      description: description,
    };

    if (transactionType === "Transferencia") {
      transactionData = {
        ...transactionData,
        fromAccountId: parseInt(fromAccount, 10),
        toAccountId: parseInt(toAccount, 10),
      };
    } else {
      transactionData = {
        ...transactionData,
        accountId: parseInt(account, 10),
        categoryId: parseInt(category, 10),
      };
    }

    try {
      const response = await fetch(`${apiUrl}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        console.log("Transacción guardada con éxito");
        onClose();
        onTransactionAdded(); // Llamar a la función de actualización
      } else {
        console.error("Error al guardar la transacción");
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
            Nueva Transacción
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex justify-between space-x-2">
            <button
              className={`flex-1 py-2 rounded-full ${
                transactionType === "income"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setTransactionType("income")}
            >
              Ingreso
            </button>
            <button
              className={`flex-1 py-2 rounded-full ${
                transactionType === "expense"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setTransactionType("expense")}
            >
              Gasto
            </button>
            <button
              className={`flex-1 py-2 rounded-full ${
                transactionType === "Transferencia"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setTransactionType("Transferencia")}
            >
              Transferencia
            </button>
          </div>

          <div>
            <label
              htmlFor="date"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Fecha
            </label>
            <input
              type="date"
              id="date"
              value={currentDate}
              className="w-full p-2 bg-gray-100 rounded border border-gray-300"
              readOnly
            />
          </div>
          <div>
            <label
              htmlFor="amount"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Importe
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded border border-gray-300"
              placeholder="0.00"
            />
          </div>

          {transactionType === "Transferencia" ? (
            <>
              <div>
                <label
                  htmlFor="fromAccount"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Cuenta de Origen
                </label>
                <select
                  id="fromAccount"
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full p-2 bg-gray-100 rounded border border-gray-300"
                >
                  <option value="">Selecciona una cuenta de origen</option>
                  {accounts.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="toAccount"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Cuenta de Destino
                </label>
                <select
                  id="toAccount"
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full p-2 bg-gray-100 rounded border border-gray-300"
                >
                  <option value="">Selecciona una cuenta de destino</option>
                  {accounts.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="category"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Categoría
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 bg-gray-100 rounded border border-gray-300"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="account"
                  className="block mb-1 text-sm font-medium text-gray-700"
                >
                  Cuenta
                </label>
                <select
                  id="account"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full p-2 bg-gray-100 rounded border border-gray-300"
                >
                  <option value="">Selecciona una cuenta</option>
                  {accounts.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="note"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Nota
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded border border-gray-300"
              rows="2"
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded border border-gray-300"
              rows="3"
            ></textarea>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;
