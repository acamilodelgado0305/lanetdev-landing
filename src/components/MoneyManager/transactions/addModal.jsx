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

const TransferModal = ({
  isOpen,
  onClose,
  onTransactionAdded,
  transactionToEdit,
}) => {
  const apiUrl = import.meta.env.VITE_API_FINANZAS;

  // Estado inicial
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState("");
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [note, setNote] = useState("");
  const [description, setDescription] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Si hay una transacción para editar, activamos el modo edición
    if (transactionToEdit) {
      setIsEditing(!!transactionToEdit.isEditing);
      setFromAccount(transactionToEdit.fromAccountId || "");
      setToAccount(transactionToEdit.toAccountId || "");

      // Convertir `amount` a número para `rawAmount` y a cadena para `amount`
      const numericAmount = parseFloat(transactionToEdit.amount) || 0;
      setRawAmount(numericAmount);
      setAmount(new Intl.NumberFormat("es-CO").format(numericAmount));

      setNote(transactionToEdit.note || "");
      setDescription(transactionToEdit.description || "");
      setDate(transactionToEdit.date ? dayjs(transactionToEdit.date) : dayjs());
    } else {
      resetForm();
    }
  }, [transactionToEdit]);

  useEffect(() => {
    fetchAccounts();
  }, []);

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
    const value = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
    const numericValue = parseFloat(value) || 0;
    setRawAmount(numericValue);
    setAmount(new Intl.NumberFormat("es-CO").format(numericValue));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setIsUploading(true);
      try {
        const uploadedImageUrls = await Promise.all(files.map(async (file) => {
          const uploadedImageUrl = await uploadImage(file);
          return uploadedImageUrl;
        }));

        setImageUrls((prevUrls) => [...prevUrls, ...uploadedImageUrls]);
        setNote((prevNote) => `${prevNote}\n${uploadedImageUrls.join("\n")}`);
      } catch (error) {
        console.error("Error al subir las imágenes:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron subir algunas imágenes. Por favor, intente de nuevo.",
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
    if (!fromAccount) errors.push("La 'Cuenta de Origen' es obligatoria para una transferencia.");
    if (!toAccount) errors.push("La 'Cuenta de Destino' es obligatoria para una transferencia.");
    return errors;
  };

  const handleSave = async () => {
    const errors = validateFields();
    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Error en la Transferencia",
        html: errors.join("<br/>"),
        confirmButtonColor: "#d33",
      });
      return;
    }

    const localDate = dayjs(date)
      .set("hour", dayjs().hour())
      .set("minute", dayjs().minute())
      .set("second", 0)
      .format("YYYY-MM-DDTHH:mm:ss");

    const data = {
      userId: 1,
      fromAccountId: parseInt(fromAccount, 10),
      toAccountId: parseInt(toAccount, 10),
      amount: parseFloat(rawAmount),
      date: localDate,
      note: note,
      description: description,
    };

    const endpoint = `${apiUrl}/transfers${isEditing ? `/${transactionToEdit.id}` : ''}`;
    const method = isEditing ? "PUT" : "POST";

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
          title: isEditing ? "Transferencia actualizada" : "Transferencia realizada",
          text: isEditing ? "La transferencia se ha actualizado correctamente." : "La transferencia se ha realizado correctamente.",
          confirmButtonColor: "#3085d6",
        });
        resetForm();
        onClose();
        onTransactionAdded();
      } else {
        throw new Error(isEditing ? "Error al actualizar la transferencia" : "Error al realizar la transferencia");
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
    setAmount("");
    setRawAmount("");
    setFromAccount("");
    setToAccount("");
    setNote("");
    setDescription("");
    setImageUrl("");
    setImageUrls([]);
    setDate(dayjs());
    setIsEditing(false);
  };

  const handleDeleteImage = (index, urlToDelete) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setImageUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
        setNote(prevNote => {
          const notes = prevNote.split('\n');
          const filteredNotes = notes.filter(note => note !== urlToDelete);
          return filteredNotes.join('\n');
        });
        Swal.fire(
          'Eliminada',
          'La imagen ha sido eliminada.',
          'success'
        );
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Editar Transferencia" : "Nueva Transferencia"}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-6">
          <div className="space-y-4">
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

            {/* Image Upload Section */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <label htmlFor="imageUpload" className="block mb-2 font-medium">
                  Subir Imágenes
                </label>
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full p-2 bg-gray-100 rounded border"
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="text-sm text-gray-500 mt-2">Subiendo imágenes...</p>
                )}
              </div>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Imagen adjunta ${index + 1}`}
                        className="rounded w-full h-24 object-cover"
                      />
                      <button
                        onClick={() => handleDeleteImage(index, url)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <IoClose size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 mt-6">
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
          >
            {isEditing ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;