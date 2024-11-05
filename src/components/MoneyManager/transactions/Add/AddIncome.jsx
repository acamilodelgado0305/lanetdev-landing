import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { DatePicker, Input, Button } from "antd";
import Swal from "sweetalert2";
import { uploadImage } from "../../../../services/apiService";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extender dayjs con los plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const AddIncome = ({ isOpen, onClose, onTransactionAdded, transactionToEdit }) => {
  const apiUrl = import.meta.env.VITE_API_FINANZAS;

  // Estados principales
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(dayjs());
  const [note, setNote] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [timeRecurrent, setTimeRecurrent] = useState(null);

  // Estados para datos externos
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  
  // Estados para manejo de imágenes
  const [imageUrls, setImageUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
    if (transactionToEdit) {
      initializeEditForm();
    }
  }, [transactionToEdit]);

  const initializeEditForm = () => {
    const numericAmount = parseFloat(transactionToEdit.amount) || 0;
    setRawAmount(numericAmount);
    setAmount(new Intl.NumberFormat("es-CO").format(numericAmount));
    setCategory(transactionToEdit.category_id || "");
    setAccount(transactionToEdit.account_id || "");
    setDescription(transactionToEdit.description || "");
    setNote(transactionToEdit.note || "");
    setIsRecurring(transactionToEdit.recurrent || false);
    setDate(transactionToEdit.date ? dayjs(transactionToEdit.date) : dayjs());
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`);
      const data = await response.json();
      setCategories(data.filter(cat => cat.type === "income"));
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
        const uploadedUrls = await Promise.all(
          files.map(file => uploadImage(file))
        );
        setImageUrls(prev => [...prev, ...uploadedUrls]);
        setNote(prev => `${prev}\n${uploadedUrls.join("\n")}`);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error al subir las imágenes",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    const transactionData = {
      userId: 1,
      amount: parseFloat(rawAmount),
      type: "income",
      date: dayjs(date).format("YYYY-MM-DDTHH:mm:ss"),
      note,
      description,
      accountId: parseInt(account, 10),
      categoryId: parseInt(category, 10),
      recurrent: isRecurring,
      timeRecurrent: isRecurring ? timeRecurrent : null,
    };

    try {
      const response = await fetch(
        `${apiUrl}/transactions${transactionToEdit ? `/${transactionToEdit.id}` : ''}`,
        {
          method: transactionToEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionData),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: `Ingreso ${transactionToEdit ? "actualizado" : "registrado"} correctamente`,
        });
        resetForm();
        onClose();
        onTransactionAdded();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo procesar la transacción",
      });
    }
  };

  const validateFields = () => {
    const errors = [];
    if (!amount) errors.push("El importe es requerido");
    if (!category) errors.push("La categoría es requerida");
    if (!account) errors.push("La cuenta es requerida");
    
    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Campos requeridos",
        html: errors.join("<br/>"),
      });
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setAmount("");
    setRawAmount("");
    setCategory("");
    setAccount("");
    setDescription("");
    setNote("");
    setImageUrls([]);
    setIsRecurring(false);
    setTimeRecurrent(null);
    setDate(dayjs());
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fixed inset-y-0 right-0 w-full md:w-[30em] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {transactionToEdit ? "Editar Ingreso" : "Nuevo Ingreso"}
          </h2>
          <Button
            type="text"
            icon={<IoClose size={24} />}
            onClick={onClose}
            className="hover:bg-gray-100 rounded-full"
          />
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-6">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <DatePicker
              value={date}
              onChange={(newDate) => setDate(newDate)}
              format="YYYY-MM-DD"
              className="w-full"
            />
          </div>

          {/* Importe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importe
            </label>
            <Input
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              size="large"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccione una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cuenta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuenta
            </label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full h-10 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccione una cuenta</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade una descripción"
              rows={3}
            />
          </div>

          {/* Recurrencia */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                Ingreso Recurrente
              </label>
            </div>
            
            {isRecurring && (
              <select
                value={timeRecurrent || ""}
                onChange={(e) => setTimeRecurrent(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Selecciona la periodicidad</option>
                <option value="3">Cada 3 meses</option>
                <option value="6">Cada 6 meses</option>
                <option value="12">Cada 12 meses</option>
              </select>
            )}
          </div>

          {/* Subida de imágenes */}
          <div className="space-y-4 pt-4 border-t">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="w-full"
              disabled={isUploading}
            />
            {isUploading && (
              <div className="text-sm text-gray-500">Subiendo imágenes...</div>
            )}
            
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Comprobante ${index + 1}`}
                      className="rounded-lg w-full h-24 object-cover"
                    />
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<IoClose />}
                      onClick={() => {
                        setImageUrls(urls => urls.filter((_, i) => i !== index));
                        setNote(note => note.replace(url, '').trim());
                      }}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <Button
            type="primary"
            onClick={handleSave}
            className="w-full h-10 bg-green-500 hover:bg-green-600"
          >
            {transactionToEdit ? "Actualizar Ingreso" : "Registrar Ingreso"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddIncome;