import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import AccountSelector from "../AccountSelector ";
import CategorySelector from '../CategorySelector';
import TypeSelector from './TypeSelector';
import { DatePicker, Input, Button, Select } from "antd";
import {
  DollarCircleOutlined,
  CloseOutlined,
  ShoppingOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import Swal from "sweetalert2";
import { uploadImage } from "../../../../../services/apiService";
import dayjs from "dayjs";
import ImageUploader from "../ImageUploader";
import AmountCalculator from './AmountCalculator';

const apiUrl = import.meta.env.VITE_API_FINANZAS;


const AddExpense = ({ isOpen, onClose, onTransactionAdded, transactionToEdit }) => {
  const [type, setType] = useState("gasto");
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [note, setNote] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [isEditing, setIsEditing] = useState(false);
  const [provider, setProvider] = useState("");
  const [providers, setProviders] = useState([]);
  const [finalAmount, setFinalAmount] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
    fetchProviders();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`);
      const data = await response.json();
      const expenseCategories = data.filter(category =>
        category.type?.toLowerCase() === 'expense' ||
        category.type?.toLowerCase() === 'gasto'
      );
      setCategories(expenseCategories);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${apiUrl}/accounts`);
      const data = await response.json();
      const filteredAccounts = data.filter(account =>
        !account.type?.toLowerCase().includes('loan') &&
        !account.type?.toLowerCase().includes('prestamo') &&
        !account.type?.toLowerCase().includes('préstamo')
      );
      setAccounts(filteredAccounts);
    } catch (error) {
      console.error("Error al obtener las cuentas:", error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch(`${apiUrl}/providers`);
      const data = await response.json();
      setProviders(data);
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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

  const handleSave = async () => {
    try {
      if (!account || !category) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor seleccione una cuenta y una categoría",
          confirmButtonColor: "#d33",
        });
        return;
      }

      if (!rawAmount) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor ingrese un monto válido",
          confirmButtonColor: "#d33",
        });
        return;
      }

      const requestBody = {
        user_id: sessionStorage.getItem('userId'),
        account_id: parseInt(account),
        category_id: parseInt(category),
        amount: rawAmount,
        type: type,
        date: date.format("YYYY-MM-DD[T]HH:mm:ss[Z]"),
        note: note,
        description: description,
        estado: true
      };

      const response = await fetch(`${apiUrl}/expenses`, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      Swal.fire({
        icon: "success",
        title: isEditing ? "Transacción Actualizada" : "Transacción Registrada",
        text: isEditing
          ? "La transacción se ha actualizado correctamente"
          : "La transacción se ha registrado correctamente",
        confirmButtonColor: "#3085d6",
      });

      setAmount("");
      setRawAmount("");
      setCategory("");
      setAccount("");
      setNote("");
      setDescription("");
      setImageUrls([]);
      setDate(dayjs());
      setType("gasto");

      onClose();
      if (onTransactionAdded) {
        onTransactionAdded();
      }

    } catch (error) {
      console.error("Error al guardar la transacción:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al guardar la transacción. Por favor, intente de nuevo.",
        confirmButtonColor: "#d33",
      });
    }
  };


  const ProviderSelector = ({ providers, selectedProvider, onProviderSelect }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Proveedor
      </label>
      <Select
        value={selectedProvider}
        onChange={onProviderSelect}
        placeholder="Seleccione un proveedor"
        className="w-full"
        allowClear
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {providers.map((provider) => (
          <Select.Option key={provider.nombre_comercial} value={provider.nombre_comercial}>
            {provider.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
      <div className="fixed inset-y-0 right-0 w-full md:w-[32em] bg-white shadow-2xl transform 
                      transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10">
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">
                  <DollarCircleOutlined className="text-xl" />
                </span>
                <h2 className="text-xl font-semibold text-gray-800">
                  {transactionToEdit ? "Editar Transacción" : "Nuevo Egreso"}
                </h2>
              </div>
              <Button
                type="text"
                icon={<CloseOutlined className="text-lg" />}
                onClick={onClose}
                className="hover:bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center"
              />
            </div>
          </div>
          <div className="h-1 bg-red-500" />
        </div>

        {/* Type Selection */}
        <div className="p-2">
          <div className="p-5">
            <TypeSelector
              selectedType={type}
              onTypeChange={setType}
            />
          </div>
        </div>


        <div className="pt-3 px-4 space-y-6">
          {/* Fecha e Importe */}
          <div className="grid grid-cols-2 gap-4">
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
            <AmountCalculator
              baseAmount={amount}
              onBaseAmountChange={setAmount}
              rawAmount={rawAmount}
              setRawAmount={setRawAmount}
              setFinalAmount={setFinalAmount}
            />
          </div>

          <div className="h-0.5 bg-red-200" />

          <AccountSelector
            accounts={accounts}
            selectedAccount={account}
            onAccountSelect={setAccount}
            formatCurrency={formatCurrency}
          />

          <CategorySelector
            categories={categories}
            selectedCategory={category}
            onCategorySelect={setCategory}
          />


          <ProviderSelector
            providers={providers}
            selectedProvider={provider}
            onProviderSelect={setProvider}
          />

          <div className="h-0.5 bg-red-200" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade una descripción"
              rows={3}
              className="w-full"
            />
          </div>

          <ImageUploader
            imageUrls={imageUrls}
            setImageUrls={setImageUrls}
            note={note}
            setNote={setNote}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <Button
            type="primary"
            onClick={handleSave}
            size="large"
            className="w-full bg-red-500 hover:bg-red-600 h-12"
          >
            {transactionToEdit ? "Actualizar Transacción" : "Registrar Transacción"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;