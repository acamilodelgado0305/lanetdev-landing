import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { DatePicker, Input, Button, Tabs, Card, Radio } from "antd";
import {
  BankOutlined,
  WalletOutlined,
  CreditCardOutlined,
  DollarOutlined
} from '@ant-design/icons';
import Swal from "sweetalert2";
import { uploadImage } from "../../../../services/apiService";
import dayjs from "dayjs";

const { TabPane } = Tabs;

const AddExpense = ({ isOpen, onClose, onTransactionAdded, transactionToEdit }) => {
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
  const [imageUrls, setImageUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [isEditing, setIsEditing] = useState(false);
  const [taxType, setTaxType] = useState("");
  const [timeRecurrent, setTimeRecurrent] = useState(null);


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
        // Usa Promise.all para cargar todos los archivos simultáneamente
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

  const getAccountIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'bank':
        return <BankOutlined className="text-2xl" />;
      case 'cash':
        return <WalletOutlined className="text-2xl" />;
      case 'card':
        return <CreditCardOutlined className="text-2xl" />;
      default:
        return <DollarOutlined className="text-2xl" />;
    }
  };

  const groupAccountsByType = () => {
    return accounts.reduce((acc, account) => {
      const type = account.type || 'others';
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    }, {});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
      <div className="fixed inset-y-0 right-0 w-full md:w-[35em] bg-white shadow-2xl transform 
                      transition-transform duration-300 ease-in-out overflow-y-auto">
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

        {/* Contenido Principal */}
        <div className="p-6 space-y-6">
          {/* Tabs de Tipo de Pago */}
          <Radio.Group
            value={isRecurring ? "recurrent" : "single"}
            onChange={(e) => setIsRecurring(e.target.value === "recurrent")}
            className="w-full mb-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <Radio.Button value="single" className="h-14 flex items-center justify-center">
                <span className="text-base">Pago Único</span>
              </Radio.Button>
              <Radio.Button value="recurrent" className="h-14 flex items-center justify-center">
                <span className="text-base">Pago Recurrente</span>
              </Radio.Button>
            </div>
          </Radio.Group>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importe
              </label>
              <Input
                value={amount}
                onChange={handleAmountChange}
                prefix="$"
                size="large"
                className="text-lg"
              />
            </div>
          </div>

          {/* Métodos de Pago */}
          <div className="space-y-4">
            <label className="block text-base font-medium text-gray-700">
              Método de pago
            </label>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(groupAccountsByType()).map(([type, accountsOfType]) => (
                <div key={type} className="space-y-4">
                  {accountsOfType.map((acc) => (
                    <Card
                      key={acc.id}
                      onClick={() => setAccount(acc.id.toString())}
                      className={`cursor-pointer transition-all ${account === acc.id.toString()
                          ? 'border-green-500 border-2'
                          : 'hover:border-gray-300'
                        }`}
                      bodyStyle={{ padding: '12px' }}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {getAccountIcon(acc.type)}
                        <span className="text-sm text-center">{acc.name}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-4">
            <label className="block text-base font-medium text-gray-700">
              Categoría
            </label>
            <div className="grid grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  onClick={() => setCategory(cat.id.toString())}
                  className={`cursor-pointer transition-all ${category === cat.id.toString()
                      ? 'border-green-500 border-2'
                      : 'hover:border-gray-300'
                    }`}
                  bodyStyle={{ padding: '12px' }}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl">{cat.icon || '🏷'}</span>
                    <span className="text-sm text-center">{cat.name}</span>
                  </div>
                </Card>
              ))}
            </div>
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
              className="w-full"
            />
          </div>

          {/* Opciones de Recurrencia */}
          {isRecurring && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Periodicidad
              </label>
              <Radio.Group
                value={timeRecurrent}
                onChange={(e) => setTimeRecurrent(e.target.value)}
                className="w-full"
              >
                <div className="grid grid-cols-3 gap-4">
                  <Radio.Button value="3">Cada 3 meses</Radio.Button>
                  <Radio.Button value="6">Cada 6 meses</Radio.Button>
                  <Radio.Button value="12">Cada año</Radio.Button>
                </div>
              </Radio.Group>
            </div>
          )}

          {/* Adjuntos */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Comprobantes
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full"
                disabled={isUploading}
              />
              {isUploading && (
                <div className="text-sm text-gray-500 mt-2">Subiendo imágenes...</div>
              )}
            </div>
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
            size="large"
            className="w-full bg-green-500 hover:bg-green-600 h-12"
          >
            {transactionToEdit ? "Actualizar Ingreso" : "Registrar Ingreso"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;