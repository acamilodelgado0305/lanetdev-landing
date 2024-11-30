import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import AccountSelector from "./AccountSelector ";
import CategorySelector from './CategorySelector';
import { DatePicker, Input, Button, Tabs, Card, Radio } from "antd";
import {
  BankOutlined,
  WalletOutlined,
  CreditCardOutlined,
  DollarOutlined, DollarCircleOutlined, CloseOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import Swal from "sweetalert2";
import { uploadImage } from "../../../../services/apiService";
import dayjs from "dayjs";

const apiUrl = import.meta.env.VITE_API_FINANZAS;

const AddIncome = ({ isOpen, onClose, onTransactionAdded, transactionToEdit }) => {
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [rawAmount, setRawAmount] = useState("");
  const [fevAmount, setFevAmount] = useState("");
  const [rawFevAmount, setRawFevAmount] = useState("");
  const [diversoAmount, setDiversoAmount] = useState("");
  const [rawDiversoAmount, setRawDiversoAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [voucher, setVoucher] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [isEditing, setIsEditing] = useState(false);
  const [ventaCategoryId, setVentaCategoryId] = useState(null);
  const [isFevChecked, setIsFevChecked] = useState(false);



  const [arqueoCategoryId, setArqueoCategoryId] = useState(null);

  //------------USE EFECTS--------------------------

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
  }, []);

  useEffect(() => {
    // Cuando cambie alguno de los importes, actualizar el importe total si la categoría es Arque
    if (category === arqueoCategoryId?.toString()) {
      const fev = parseFloat(rawFevAmount) || 0;
      const diverso = parseFloat(rawDiversoAmount) || 0;
      const total = fev + diverso;
      setRawAmount(total);
      setAmount(new Intl.NumberFormat("es-CO").format(total));
    }
  }, [rawFevAmount, rawDiversoAmount, category, arqueoCategoryId]);


  //---------------------------FETCH---------------------------//

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`);
      const data = await response.json();
      const incomeCategories = data.filter(category =>
        category.type?.toLowerCase() === 'income' ||
        category.type?.toLowerCase() === 'ingreso'
      );
      setCategories(incomeCategories);

      // Encontrar y guardar los IDs de las categorías Arque y Venta
      const arqueoCategory = incomeCategories.find(cat => cat.name === 'Arqueo');
      const ventaCategory = incomeCategories.find(cat => cat.name === 'Venta');

      if (arqueoCategory) {
        setArqueoCategoryId(arqueoCategory.id);
      }
      if (ventaCategory) {
        setVentaCategoryId(ventaCategory.id);
      }
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${apiUrl}/accounts`);
      const data = await response.json();
      // Filtrar las cuentas, excluyendo los préstamos
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


  //-------------MONEDA--------------------

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };


  //--------------------------FUNCIONES

  const handleAmountChange = (e, type) => {
    const value = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "");
    const numericValue = parseFloat(value) || 0;

    switch (type) {
      case 'fev':
        setRawFevAmount(numericValue);
        setFevAmount(new Intl.NumberFormat("es-CO").format(numericValue));
        break;
      case 'diverso':
        setRawDiversoAmount(numericValue);
        setDiversoAmount(new Intl.NumberFormat("es-CO").format(numericValue));
        break;
      case 'venta':
        setRawAmount(numericValue);
        setAmount(new Intl.NumberFormat("es-CO").format(numericValue));
        break;
      default:
        setRawAmount(numericValue);
        setAmount(new Intl.NumberFormat("es-CO").format(numericValue));
    }
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
        setVoucher((prevVoucher) => `${prevVoucher}\n${uploadedImageUrls.join("\n")}`);
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

      // Verificar que el monto no sea 0 o vacío
      if (!rawAmount && category !== arqueoCategoryId?.toString()) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor ingrese un monto válido",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // Si es categoría Arqueo, verificar que al menos uno de los montos no sea 0
      if (category === arqueoCategoryId?.toString() && !rawFevAmount && !rawDiversoAmount) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor ingrese al menos un monto para el arqueo",
          confirmButtonColor: "#d33",
        });
        return;
      }

      let transactionType;
      // Determinar el tipo de transacción
      if (category === ventaCategoryId?.toString()) {
        transactionType = isFevChecked ? "FEV*" : "arqueo";
      } else {
        transactionType = "arqueo"; // tipo por defecto para otras categorías
      }


      let requestBody = {
        user_id: sessionStorage.getItem('userId'),
        account_id: parseInt(account),
        category_id: parseInt(category),
        type: transactionType, // Usar el tipo determinado por la condición
        date: date.format("YYYY-MM-DD[T]HH:mm:ss[Z]"),
        voucher: voucher,
        description: description,
        estado: true
      };


      if (category === ventaCategoryId?.toString()) {
        requestBody = {
          ...requestBody,
          amount: rawAmount
        };
      } else if (category === arqueoCategoryId?.toString()) {
        requestBody = {
          ...requestBody,
          amountfev: rawFevAmount || 0,
          amountdiverse: rawDiversoAmount || 0
        };
      } else {
        requestBody = {
          ...requestBody,
          amount: rawAmount
        };
      }

      const response = await fetch(`${apiUrl}/incomes`, {
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
        title: isEditing ? "Ingreso Actualizado" : "Ingreso Registrado",
        text: isEditing
          ? "El ingreso se ha actualizado correctamente"
          : "El ingreso se ha registrado correctamente",
        confirmButtonColor: "#3085d6",
      });

      // Limpiar el formulario
      setAmount("");
      setRawAmount("");
      setFevAmount("");
      setRawFevAmount("");
      setDiversoAmount("");
      setRawDiversoAmount("");
      setCategory("");
      setAccount("");
      setVoucher("");
      setDescription("");
      setImageUrls([]);
      setDate(dayjs());

      // Cerrar el modal y actualizar la lista
      onClose();
      if (onTransactionAdded) {
        onTransactionAdded();
      }

    } catch (error) {
      console.error("Error al guardar el ingreso:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al guardar el ingreso. Por favor, intente de nuevo.",
        confirmButtonColor: "#d33",
      });
    }
  };


  //----------------------RENDERS-------------------------------//
  const renderArqueoInputs = (selectedCategory) => {
    if (selectedCategory === arqueoCategoryId?.toString()) {
      return (
        <div className="col-span-2 space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importe FEV
            </label>
            <Input
              value={fevAmount}
              onChange={(e) => handleAmountChange(e, 'fev')}
              prefix="$"
              size="large"
              className="text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importe Diverso
            </label>
            <Input
              value={diversoAmount}
              onChange={(e) => handleAmountChange(e, 'diverso')}
              prefix="$"
              size="large"
              className="text-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importe Total
            </label>
            <Input
              value={amount}
              disabled
              prefix="$"
              size="large"
              className="text-lg bg-gray-50"
            />
          </div>
        </div>
      );
    }
    return null;
  };


  const renderVentaInputs = (selectedCategory) => {
    if (selectedCategory === ventaCategoryId?.toString()) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importe
            </label>
            <Input
              value={amount}
              onChange={(e) => handleAmountChange(e, 'venta')}
              prefix="$"
              size="large"
              className="text-lg"
              placeholder="Ingrese el importe de la venta"
            />
          </div>
        </div>
      );
    }
    return null;
  };

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
          <div className="px-6 pt-4 ">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">
                  <DollarCircleOutlined className="text-xl" />
                </span>
                <h2 className="text-xl font-semibold text-gray-800">
                  {transactionToEdit ? "Editar Ingreso" : "Nuevo Ingreso"}
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
          <div className="h-1 bg-green-500" />
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


          </div>

          {/* Métodos de Pago */}
          <AccountSelector
            accounts={accounts}
            selectedAccount={account}
            onAccountSelect={setAccount}
            formatCurrency={formatCurrency}
          />

          {/* Categoría */}
          <CategorySelector
            categories={categories}
            selectedCategory={category}
            onCategorySelect={setCategory}
            additionalInputs={(selectedCategory) => {
              if (selectedCategory === arqueoCategoryId?.toString()) {
                return renderArqueoInputs(selectedCategory);
              } else if (selectedCategory === ventaCategoryId?.toString()) {
                return renderVentaInputs(selectedCategory);
              }
              return null;
            }}
            onFevCheckChange={setIsFevChecked}
            isFevChecked={isFevChecked}
            ventaCategoryId={ventaCategoryId}
          />
          {/*------------------------IMPORTE------------------------------*/}



          <div className="h-1 bg-green-500" /> {/* Línea verde decorativa */}


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
                        setVoucher(voucher => voucher.replace(url, '').trim());
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

export default AddIncome;