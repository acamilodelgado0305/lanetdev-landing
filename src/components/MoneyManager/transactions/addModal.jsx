import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { uploadImage } from "../../../services/apiService";
import InputField from "../transactions/components/InputField";
import SelectField from "../transactions/components/SelectField";
import { DatePicker } from "antd";
import "antd/dist/reset.css";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extiende dayjs con los plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const AddEntryModal = ({
  isOpen,
  onClose,
  onTransactionAdded,
  transactionToEdit,
}) => {
  const apiUrl = import.meta.env.VITE_API_FINANZAS;

  // Estado inicial
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
  const [date, setDate] = useState(dayjs());
  const [isEditing, setIsEditing] = useState(false);
  const [taxType, setTaxType] = useState("");
  const [timeRecurrent, setTimeRecurrent] = useState(null);

  useEffect(() => {
    // Si hay una transacción para editar, activamos el modo edición
    if (transactionToEdit && transactionToEdit.isEditing) {
      setIsEditing(true);
      if (transactionToEdit.type === "transfer") {
        setTransactionType("Transferencia");
        setFromAccount(transactionToEdit.fromAccountId || "");
        setToAccount(transactionToEdit.toAccountId || "");
      } else {
        setTransactionType(transactionToEdit.type || "expense");
        setAccount(transactionToEdit.account_id);
        setCategory(transactionToEdit.category_id || "");
      }
      setRawAmount(parseFloat(transactionToEdit.amount) || "");
      setAmount(
        transactionToEdit.amount
          ? new Intl.NumberFormat("es-CO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(transactionToEdit.amount)
          : ""
      );
      setNote(transactionToEdit.note || "");
      setDescription(transactionToEdit.description || "");
      setIsRecurring(transactionToEdit.recurrent || false);
      setDate(transactionToEdit.date ? dayjs(transactionToEdit.date) : dayjs());
    } else if (transactionToEdit && !transactionToEdit.isEditing) {
      setTransactionType(transactionToEdit.type || "expense");
      setAmount(transactionToEdit.amount ? transactionToEdit.amount.toString() : "");
      setDescription(transactionToEdit.description || "");
      setCategory(transactionToEdit.category || "");
      setAccount(transactionToEdit.account || "");
      setIsEditing(false);
    } else {
      resetForm();
    }
  }, [transactionToEdit]);

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
  }, []);

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

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    if (!value) {
      setRawAmount("");
      setAmount("");
      return;
    }
    setRawAmount(parseFloat(value));
    setAmount(value);
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

  const validateFields = () => {
    const errors = [];
    if (!amount || isNaN(parseFloat(rawAmount))) {
      errors.push("El campo 'Importe' es obligatorio y debe ser un número válido.");
    }
    if (transactionType === "Transferencia") {
      if (!fromAccount) errors.push("La 'Cuenta de Origen' es obligatoria para una transferencia.");
      if (!toAccount) errors.push("La 'Cuenta de Destino' es obligatoria para una transferencia.");
    } else {
      if (!account) errors.push("La 'Cuenta' es obligatoria.");
      if (!category) errors.push("La 'Categoría' es obligatoria.");
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validateFields();
    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Error en la Transacción",
        html: errors.join("<br/>"),
        confirmButtonColor: "#d33",
      });
      return;
    }
    let data;
    let endpoint;
    let method;
    const localDate = dayjs(date)
      .set("hour", dayjs().hour())
      .set("minute", dayjs().minute())
      .set("second", 0)
      .format("YYYY-MM-DDTHH:mm:ss");

    if (transactionType === "Transferencia") {
      data = {
        userId: 1,
        fromAccountId: parseInt(fromAccount, 10),
        toAccountId: parseInt(toAccount, 10),
        amount: parseFloat(rawAmount),
        date: localDate,
        note: note,
        description: description,
      };
      endpoint = `${apiUrl}/transfers`;
    } else {
      data = {
        userId: 1,
        amount: parseFloat(rawAmount),
        type: transactionType.toLowerCase(),
        date: localDate,
        note: note,
        description: description,
        accountId: parseInt(account, 10),
        categoryId: parseInt(category, 10),
        tax_type: taxType,
        recurrent: isRecurring,
        timeRecurrent: isRecurring ? timeRecurrent : null,
      };
      endpoint = `${apiUrl}/transactions`;
    }

    console.log("Datos que se están enviando:", data);
    if (isEditing) {
      method = "PUT";
      endpoint += `/${transactionToEdit.id}`;
    } else {
      method = "POST";
    }

    try {
      const response = await fetch(endpoint, {
        method: method || "POST",
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
        resetForm();
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
    setDate(dayjs());
    setIsEditing(false);
    setTaxType("");
  };

  const taxOptions = [
    { label: "IVA", value: "IVA" },
    { label: "Retención", value: "retencion" },
    { label: "Sin Impuesto", value: "sin_impuesto" },
  ];

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
            <div className="flex justify-between space-x-2">
              <button
                className={`flex-1 py-2 rounded-full ${transactionType === "income"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
                  }`}
                onClick={() => setTransactionType("income")}
              >
                Ingreso
              </button>
              <button
                className={`flex-1 py-2 rounded-full ${transactionType === "expense"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200"
                  }`}
                onClick={() => setTransactionType("expense")}
              >
                Gasto
              </button>
              <button
                className={`flex-1 py-2 rounded-full ${transactionType === "Transferencia"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
                  }`}
                onClick={() => setTransactionType("Transferencia")}
              >
                Transferencia
              </button>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Fecha
              </label>
              <DatePicker
                value={dayjs(date)}
                onChange={(date) => {
                  if (date) {
                    setDate(dayjs(date));
                  }
                }}
                format="YYYY-MM-DD"
                className="w-full"
              />
            </div>
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
                <SelectField
                  label="Impuesto"
                  id="taxType"
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  options={taxOptions}
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
                {isRecurring && (
                  <SelectField
                    label="Tiempo recurrente (meses)"
                    id="timeRecurrent"
                    value={timeRecurrent}
                    onChange={(e) => setTimeRecurrent(parseInt(e.target.value, 10))}
                    options={[
                      { label: "3 meses", value: "3" },
                      { label: "6 meses", value: "6" },
                      { label: "12 meses", value: "12" },
                    ]}
                  />
                )}
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
