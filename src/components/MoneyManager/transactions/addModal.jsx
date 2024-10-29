import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import Swal from "sweetalert2";
import { uploadImage } from "../../../services/apiService";
import InputField from "../transactions/components/InputField";
import SelectField from "../transactions/components/SelectField";
import { DatePicker, Card, Tabs, Radio, Input, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
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
    if (transactionToEdit) {
      setIsEditing(!!transactionToEdit.isEditing);

      if (transactionToEdit.type === "transfer") {
        setTransactionType("Transferencia");
        setFromAccount(transactionToEdit.fromAccountId || "");
        setToAccount(transactionToEdit.toAccountId || "");
      } else {
        setTransactionType(transactionToEdit.type || "expense");
        setAccount(transactionToEdit.account_id || "");
        setCategory(transactionToEdit.category_id || "");
      }
      // Convertir `amount` a número para `rawAmount` y a cadena para `amount`
      const numericAmount = parseFloat(transactionToEdit.amount) || 0;
      setRawAmount(numericAmount);
      setAmount(new Intl.NumberFormat("es-CO").format(numericAmount));

      setNote(transactionToEdit.note || "");
      setDescription(transactionToEdit.description || "");
      setIsRecurring(transactionToEdit.recurrent || false);
      setDate(transactionToEdit.date ? dayjs(transactionToEdit.date) : dayjs());

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
    const value = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
    const numericValue = parseFloat(value) || 0;
    setRawAmount(numericValue);
    setAmount(new Intl.NumberFormat("es-CO").format(numericValue));
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

  const transactionTypeOptions = [
    { label: "Ingreso", value: "income", color: "#52c41a" },
    { label: "Gasto", value: "expense", color: "#f5222d" },
    { label: "Transferencia", value: "Transferencia", color: "#1890ff" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div className={`w-screen max-w-md transform transition-all duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">
                  {isEditing
                    ? "Editar Transacción"
                    : transactionType === "Transferencia"
                      ? "Nueva Transferencia"
                      : "Nueva Transacción"}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <IoClose size={24} />
                </button>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {/* Tipo de transacción */}
                <div className="mb-6">
                  <Radio.Group
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    buttonStyle="solid"
                    className="w-full"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {transactionTypeOptions.map((option) => (
                        <Radio.Button
                          key={option.value}
                          value={option.value}
                          className="text-center"
                          style={{
                            backgroundColor: transactionType === option.value ? option.color : undefined,
                            color: transactionType === option.value ? 'white' : undefined,
                          }}
                        >
                          {option.label}
                        </Radio.Button>
                      ))}
                    </div>
                  </Radio.Group>
                </div>

                <Card className="mb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm">Fecha</label>
                        <DatePicker
                          value={dayjs(date)}
                          onChange={(date) => date && setDate(dayjs(date))}
                          format="YYYY-MM-DD"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <InputField
                          label="Valor"
                          id="amount"
                          value={amount}
                          onChange={handleAmountChange}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <Input.TextArea
                      placeholder="Descripción"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                </Card>

                <Card title="Detalles de la transacción" className="mb-4">
                  {transactionType === "Transferencia" ? (
                    <div className="space-y-4">
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
                    </div>
                  ) : (
                    <div className="space-y-4">
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

                      {/* Mostrar impuesto solo para gastos */}
                      {transactionType === "expense" && (
                        <SelectField
                          label="Impuesto"
                          id="taxType"
                          value={taxType}
                          onChange={(e) => setTaxType(e.target.value)}
                          options={taxOptions}
                        />
                      )}

                      {/* Opciones de recurrencia */}
                      <div className="pt-4 border-t">
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="recurring"
                            checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="recurring">Recurrente</label>
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
                      </div>
                    </div>
                  )}
                </Card>

                {/* Sección de imagen */}
                <Card title="Comprobante" className="mb-4">
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleImageUpload({ target: { files: [file] } });
                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />} loading={isUploading}>
                      Subir imagen
                    </Button>
                  </Upload>

                  {imageUrl && (
                    <div className="mt-4">
                      <img
                        src={imageUrl}
                        alt="Comprobante"
                        className="max-w-full rounded"
                      />
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <Button
                type="primary"
                onClick={handleSave}
                className="w-full h-10"
                style={{
                  backgroundColor: '#1890ff',
                }}
              >
                {isEditing ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEntryModal;