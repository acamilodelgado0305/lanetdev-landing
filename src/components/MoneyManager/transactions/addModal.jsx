import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { uploadImage } from "../../../services/apiService";

const AddEntryModal = ({ isOpen, onClose, onTransactionAdded }) => {
  const apiUrl = import.meta.env.VITE_API_FINANZAS;

  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [note, setNote] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false); // Nuevo estado para el campo recurrente

  const currentDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
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

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Elimina cualquier carácter no numérico
    setRawAmount(value);
    const formattedAmount = new Intl.NumberFormat("es-CO").format(value);
    setAmount(formattedAmount);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      try {
        const uploadedImageUrl = await uploadImage(file);
        setImageUrl(uploadedImageUrl);
        setNote((prevNote) => `${prevNote}\n${uploadedImageUrl}`);
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo subir la imagen. Por favor, intente de nuevo.",
          confirmButtonColor: "#d33",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    let data;
    let endpoint;

    if (transactionType === "Transferencia") {
      data = {
        userId: 1,
        fromAccountId: parseInt(fromAccount, 10),
        toAccountId: parseInt(toAccount, 10),
        amount: parseFloat(rawAmount),
        date: new Date().toISOString(),
        note: note,
        description: description,
      };
      endpoint = `${apiUrl}/transfers`;
    } else {
      data = {
        userId: 1,
        amount: parseFloat(rawAmount),
        type: transactionType.toLowerCase(),
        date: new Date().toISOString(),
        note: note,
        description: description,
        accountId: parseInt(account, 10),
        categoryId: parseInt(category, 10),
        isRecurring,
      };
      endpoint = `${apiUrl}/transactions`;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title:
            transactionType === "Transferencia"
              ? "Transferencia realizada"
              : "Transacción guardada",
          text:
            transactionType === "Transferencia"
              ? "La transferencia se ha realizado correctamente."
              : "La transacción se ha guardado correctamente.",
          confirmButtonColor: "#3085d6",
        });
        onClose();
        onTransactionAdded();
      } else {
        throw new Error(
          transactionType === "Transferencia"
            ? "Error al realizar la transferencia"
            : "Error al guardar la transacción"
        );
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
        confirmButtonColor: "#d33",
      });
    }
  };

  if (!isOpen) return null;

  // Filtrar categorías según el tipo de transacción
  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {transactionType === "Transferencia"
              ? "Nueva Transferencia"
              : "Nueva Transacción"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="flex">
          <div className="w-2/3 p-4 space-y-4">
            <div className="flex justify-between space-x-2">
              <button
                className={`flex-1 py-2 rounded-full ${transactionType === "income"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-800"
                  }`}
                onClick={() => setTransactionType("income")}
              >
                Ingreso
              </button>
              <button
                className={`flex-1 py-2 rounded-full ${transactionType === "expense"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-800"
                  }`}
                onClick={() => setTransactionType("expense")}
              >
                Gasto
              </button>
              <button
                className={`flex-1 py-2 rounded-full ${transactionType === "Transferencia"
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
                type="text"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
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
                    {filteredCategories.map((cat) => (
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
            {/* Solo mostrar checkbox si no es una transferencia */}
            {transactionType !== "Transferencia" && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                />
                <label
                  htmlFor="recurring"
                  className="text-sm font-medium text-gray-700"
                >
                  Recurrente
                </label>
              </div>
            )}
          </div>

          <div className="w-1/3 p-4 border-l border-gray-200">
            <div className="mb-4">
              <label
                htmlFor="imageUpload"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Subir Imagen
              </label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 bg-gray-100 rounded border border-gray-300"
                disabled={isUploading}
              />
              {isUploading && (
                <p className="text-sm text-gray-500 mt-1">Subiendo imagen...</p>
              )}
            </div>
            {imageUrl && (
              <div className="mt-2">
                <img
                  src={imageUrl}
                  alt="Imagen adjunta"
                  className="max-w-full h-auto rounded"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;
