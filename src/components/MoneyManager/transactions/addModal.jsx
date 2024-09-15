import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { uploadImage } from "../../../services/apiService";
import InputField from "../transactions/components/InputField";
import SelectField from "../transactions/components/SelectField";

const AddEntryModal = ({ isOpen, onClose, onTransactionAdded, transactionToEdit }) => {
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
  const [isRecurring, setIsRecurring] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (transactionToEdit) {
      setIsEditing(true);
      if (transactionToEdit.type === "transfer") {
        setTransactionType("Transferencia");
        setFromAccount(transactionToEdit.fromAccountId || "");
        setToAccount(transactionToEdit.toAccountId || "");
      } else {
        setTransactionType(transactionToEdit.type || "expense");
        setAccount(transactionToEdit.account_id);
        setCategory(transactionToEdit.category_id|| "");
      }
      setRawAmount(transactionToEdit.amount?.toString() || "");
      setAmount(transactionToEdit.amount ? new Intl.NumberFormat("es-CO").format(transactionToEdit.amount) : "");
      setNote(transactionToEdit.note || "");
      setDescription(transactionToEdit.description || "");
      setIsRecurring(transactionToEdit.recurrent || false);
      setDate(transactionToEdit.date ? new Date(transactionToEdit.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
    } else {
      resetForm();
    }
  }, [transactionToEdit])

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`);
      const data = await response.json();
      setCategories(data);
      console.log(data)
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

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
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
    let method;

    if (transactionType === "Transferencia") {
      data = {
        userId: 1,
        fromAccountId: parseInt(fromAccount, 10),
        toAccountId: parseInt(toAccount, 10),
        amount: parseFloat(rawAmount),
        date: new Date(date).toISOString(),
        note: note,
        description: description,
      };
      endpoint = `${apiUrl}/transfers`;
    } else {
      data = {
        userId: 1,
        amount: parseFloat(rawAmount),
        type: transactionType.toLowerCase(),
        date: new Date(date).toISOString(),
        note: note,
        description: description,
        accountId: parseInt(account, 10),
        categoryId: parseInt(category, 10),
        recurrent: isRecurring,
      };
      endpoint = `${apiUrl}/transactions`;
    }

    if (isEditing) {
      method = "PUT";
      endpoint += `/${transactionToEdit.id}`;
    } else {
      method = "POST";
    }

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: isEditing
            ? "Transacción actualizada"
            : transactionType === "Transferencia"
            ? "Transferencia realizada"
            : "Transacción guardada",
          text: isEditing
            ? "La transacción se ha actualizado correctamente."
            : transactionType === "Transferencia"
            ? "La transferencia se ha realizado correctamente."
            : "La transacción se ha guardado correctamente.",
          confirmButtonColor: "#3085d6",
        });
        onClose();
        onTransactionAdded();
      } else {
        throw new Error(
          isEditing
            ? "Error al actualizar la transacción"
            : transactionType === "Transferencia"
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

  const resetForm = () => {
    setTransactionType("expense");
    setAmount("");
    setRawAmount("");
    setCategory("");
    setAccount("");
    setFromAccount("");
    setToAccount("");
    setNote("");
    setDescription("");
    setImageUrl("");
    setIsRecurring(false);
    setDate(new Date().toISOString().split("T")[0]);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(
    (cat) => cat.type === transactionType
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing
              ? "Editar Transacción"
              : transactionType === "Transferencia"
              ? "Nueva Transferencia"
              : "Nueva Transacción"}
          </h2>
          <button onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>

        <div className="flex">
          <div className="w-2/3 p-4 space-y-4">
            {/* Botones de tipo de transacción */}
            <div className="flex justify-between space-x-2">
              <button
                className={`flex-1 py-2 rounded-full ${
                  transactionType === "income" ? "bg-green-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setTransactionType("income")}
              >
                Ingreso
              </button>
              <button
                className={`flex-1 py-2 rounded-full ${
                  transactionType === "expense" ? "bg-red-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setTransactionType("expense")}
              >
                Gasto
              </button>
              <button
                className={`flex-1 py-2 rounded-full ${
                  transactionType === "Transferencia" ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={() => setTransactionType("Transferencia")}
              >
                Transferencia
              </button>
            </div>

            <InputField
              label="Fecha"
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <InputField
              label="Importe"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
            />
            
            <InputField
              label="Descripción"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade una descripción"
            />

            {transactionType === "Transferencia" ? (
              <>
                <SelectField
                  label="Cuenta de Origen"
                  id="fromAccount"
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value)}
                  options={accounts}
                />
                <SelectField
                  label="Cuenta de Destino"
                  id="toAccount"
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  options={accounts}
                />
              </>
            ) : (
              <>
                <SelectField
                  label="Categoría"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={filteredCategories}
                />
                <SelectField
                  label="Cuenta"
                  id="account"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  options={accounts}
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  <label htmlFor="recurring" className="text-sm font-medium">
                    Recurrente
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="w-1/3 p-4 border-l">
            <div className="mb-4">
              <label htmlFor="imageUpload" className="block mb-1">
                Subir Imagen
              </label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 bg-gray-100 rounded border"
                disabled={isUploading}
              />
              {isUploading && <p>Subiendo imagen...</p>}
            </div>
            {imageUrl && (
              <img src={imageUrl} alt="Imagen adjunta" className="rounded" />
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
          >
            {isEditing ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;