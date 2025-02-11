import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import AccountSelector from "../AccountSelector ";
import CategorySelector from '../CategorySelector';
import { DatePicker, Input, Button, Row, Col, Tabs, Card, Radio, Typography, Space, Checkbox } from "antd";
import {
  DollarCircleOutlined, CloseOutlined
} from '@ant-design/icons';
import Swal from "sweetalert2";
import { uploadImage } from "../../../../../services/apiService";
import dayjs from "dayjs";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
const apiUrl = import.meta.env.VITE_API_FINANZAS;
import VoucherSection from "../../components/VoucherSection";

const { Title, Text } = Typography;


const AddIncome = ({ onTransactionAdded, transactionToEdit }) => {
  const navigate = useNavigate(); // Inicializa el hook useNavigate
  const [transactionType, setTransactionType] = useState("expense");
  const [amount, setAmount] = useState("");

  const [fevAmount, setFevAmount] = useState("");
  const [diversoAmount, setDiversoAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [voucher, setVoucher] = useState("");
  const [description, setDescription] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [date, setDate] = useState(dayjs());
  const [isEditing, setIsEditing] = useState(false);
  const [ventaCategoryId, setVentaCategoryId] = useState(null);
  const [isFevChecked, setIsFevChecked] = useState(false);
  const [loading, setLoading] = useState(false);


  const [arqueoCategoryId, setArqueoCategoryId] = useState(null);
  const [isArqueoChecked, setIsArqueoChecked] = useState(false);
  const [isVentaChecked, setIsVentaChecked] = useState(false);

  const [startPeriod, setStartPeriod] = useState(null);
  const [endPeriod, setEndPeriod] = useState(null);
  const [cashierName, setCashierName] = useState("");
  const [arqueoNumber, setArqueoNumber] = useState("");
  const [otherIncome, setOtherIncome] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [cashierCommission, setCashierCommission] = useState("");

  const handleCancel = () => {
    navigate(-1); // Navega hacia atrás en la historia del navegador
  };



  //------------USE EFECTS--------------------------

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
  }, []);


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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${apiUrl}/incomes/bulk-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Carga masiva completada exitosamente!");
      if (onTransactionAdded) onTransactionAdded(); // Recargar la lista de ingresos
    } catch (error) {
      message.error("Error al procesar la carga masiva.");
      console.error("Error en la carga masiva:", error);
    } finally {
      setLoading(false);
    }
  };


  //-------------MONEDA--------------------

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  //--------------------------FUNCIONES

  const handleAmountChange = (e, field) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Eliminar caracteres no numéricos
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0; // Convertir a número

    if (field === 'fev') {
      setFevAmount(numericValue); // Actualizar el estado con el valor numérico
    } else if (field === 'diverso') {
      setDiversoAmount(numericValue); // Actualizar el estado con el valor numérico
    }
    else if (field === 'other_incomes') {
      setOtherIncome(numericValue); // Actualizar el estado con el valor numérico
    }
    else if (field === 'cashReceived') {
      setCashReceived(numericValue); // Actualizar el estado con el valor numérico
    }
  };




  const handleSave = async () => {
    try {
      if (!account) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor seleccione una cuenta",
          confirmButtonColor: "#d33",
        });
        return;
      }

      const totalAmount = isArqueoChecked ?
        (parseFloat(fevAmount) || 0) +
        (parseFloat(diversoAmount) || 0) +
        (parseFloat(otherIncome) || 0) :
        parseFloat(amount);

      const baseRequestBody = {
        user_id: parseInt(sessionStorage.getItem('userId')),
        account_id: parseInt(account),
        category_id: parseInt(category),
        type: isArqueoChecked ? "arqueo" : "income",
        date: date.format("YYYY-MM-DD[T]HH:mm:ss[Z]"),
        voucher: voucher,
        description: description,
        comentarios: comentarios,
        estado: true,
        amount: totalAmount // Add the total amount here
      };

      let requestBody;
      if (isArqueoChecked) {
        const commission = totalAmount * 0.02;

        requestBody = {
          ...baseRequestBody,
          amountfev: parseFloat(fevAmount) || 0,
          amountdiverse: parseFloat(diversoAmount) || 0,
          cashier_name: cashierName,
          arqueo_number: parseInt(arqueoNumber),
          other_income: parseFloat(otherIncome) || 0,
          cash_received: parseFloat(cashReceived) || 0,
          cashier_commission: commission,
          start_period: startPeriod?.format("YYYY-MM-DD"),
          end_period: endPeriod?.format("YYYY-MM-DD")
        };
      } else {
        requestBody = baseRequestBody;
      }

      const response = await fetch(`${apiUrl}/incomes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();

      Swal.fire({
        icon: "success",
        title: "Ingreso Registrado",
        text: "El ingreso se ha registrado correctamente",
        confirmButtonColor: "#3085d6",
      });

      resetForm();
      fetchAccounts();
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

  const resetForm = () => {
    setAmount("");
    setFevAmount("");
    setDiversoAmount("");
    setCategory("");
    setAccount("");
    setVoucher("");
    setDescription("");
    setComentarios("");
    setImageUrls([]);
    setDate(dayjs());
    setCashierName("");
    setArqueoNumber("");
    setOtherIncome("");
    setCashReceived("");
    setCashierCommission("");
    setStartPeriod(null);
    setEndPeriod(null);
  };

  //----------------------RENDERS-------------------------------//
  const renderArqueoInputs = () => {
    if (isArqueoChecked) {
      const calculateTotalAmount = () => {
        const fev = parseFloat(fevAmount) || 0;
        const diverso = parseFloat(diversoAmount) || 0;
        const otros = parseFloat(otherIncome) || 0;
        return fev + diverso + otros;
      };

      // Calcular el importe total
      const amount = calculateTotalAmount();
      // Verificar si el dinero recibido en efectivo coincide con el importe total
      const cashReceivedValue = parseFloat(cashReceived) || 0;
      const isCashMatch = cashReceivedValue === amount;
      // Calcular la comisión del cajero (2% del importe total)
      const commission = amount * 0.02;

      return (
        <div className="p-6 bg-white rounded-lg shadow-lg space-y-8">
          {/* Título */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">Arqueo de Caja</h2>
            <p className="text-sm text-gray-500">Ingrese los datos requeridos para realizar el arqueo.</p>
          </div>

          {/* Periodo de Arqueo */}
          <div className="flex items-center relative">
            <div className="w-48 font-semibold text-gray-700 text-sm">Periodo de Arqueo</div>

            <div className="flex space-x-4 ml-6">
              <DatePicker
                value={startPeriod}
                onChange={(date) => setStartPeriod(date)}
                placeholder="Fecha Inicio"
                className="w-40 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              />
              <DatePicker
                value={endPeriod}
                onChange={(date) => setEndPeriod(date)}
                placeholder="Fecha Fin"
                className="w-40 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Cajero */}
          <div className="flex items-center relative">
            <div className="w-48 font-semibold text-gray-700 text-sm">Cajero</div>

            <div className="ml-6">
              <select
                className="w-64 text-sm py-1 px-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
              >
                <option value="">Selecciona un cajero</option>
                <option value="Seg-Rafael Urdaneta">Seg-Rafael Urdaneta</option>
                <option value="Seg-Ragonvalia Oficina">Seg-Ragonvalia Oficina</option>
                <option value="Seg-Ragonvalia Casa">Seg-Ragonvalia Casa</option>
                <option value="Seg-AsoFranco">Seg-AsoFranco</option>
                <option value="Seg-Bancolombia Rocely">Seg-Bancolombia Rocely</option>
                <option value="Seg-Bancolombia LANET">Seg-Bancolombia LANET</option>
              </select>
            </div>
          </div>

          {/* Número de Arqueo */}
          <div className="flex items-center relative">
            <div className="w-48 font-semibold text-gray-700 text-sm">Número de Arqueo</div>

            <div className="ml-6">
              <Input
                value={arqueoNumber}
                onChange={(e) => setArqueoNumber(e.target.value)}
                prefix="#"
                size="small"
                className="w-40 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                placeholder="Ej: 1234"
              />
            </div>
          </div>

          {/* Importes */}
          <div className="space-y-4">
            <div className="flex items-center relative">
              <div className="w-48 font-semibold text-gray-700 text-sm">Importe FEV</div>

              <div className="ml-6">
                <Input
                  value={formatCurrency(fevAmount)}
                  onChange={(e) => handleAmountChange(e, 'fev')}
                  size="small"
                  className="w-40 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  placeholder="Ej: 1000.00"
                />
              </div>
            </div>
            <div className="flex items-center relative">
              <div className="w-48 font-semibold text-gray-700 text-sm">Importe Diverso</div>

              <div className="ml-6">
                <Input
                  value={formatCurrency(diversoAmount)}
                  onChange={(e) => handleAmountChange(e, 'diverso')}
                  size="small"
                  className="w-40 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  placeholder="Ej: 500.00"
                />
              </div>
            </div>
            <div className="flex items-center relative">
              <div className="w-48 font-semibold text-gray-700 text-sm">Otros Ingresos</div>

              <div className="ml-6">
                <Input
                  value={formatCurrency(otherIncome)}
                  onChange={(e) => handleAmountChange(e, 'other_incomes')}
                  size="small"
                  className="w-40 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  placeholder="Ej: 200.00"
                />
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="space-y-4">
            <div className="flex justify-between items-center relative">
              <div className="w-48 font-semibold text-gray-700 text-sm">Dinero Recibido en Efectivo</div>

              <div className="ml-6">
                <Input
                  value={formatCurrency(cashReceived)}
                  onChange={(e) => handleAmountChange(e, 'cashReceived')}
                  size="small"
                  className="w-40 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                  placeholder="Ej: 1700.00"
                />
              </div>
            </div>
            <div className="flex justify-between items-center relative">
              <div className="w-48 font-semibold text-gray-700 text-sm">Importe Total</div>

              <div className="ml-6">
                <Input
                  value={formatCurrency(amount)}
                  disabled
                  size="small"
                  className="w-40 bg-green-100 text-green-700 font-bold border-none cursor-not-allowed px-2 py-1"
                  placeholder="Total calculado"
                />
              </div>
            </div>
          </div>

          {/* Mensaje de coincidencia */}
          <div className="text-center">
            {isCashMatch ? (
              <div className="text-green-600 font-semibold">
                Los valores coinciden correctamente.
              </div>
            ) : (
              <div className="text-red-600 font-semibold">
                ¡Error! Hay un descuadre en el arqueo.
              </div>
            )}
          </div>

          {/* Comisión del Cajero */}
          <div className="flex items-center relative">
            <div className="w-48 font-semibold text-gray-700 text-sm">Comisión del Cajero (2%)</div>

            <div className="ml-6">
              <Input
                value={formatCurrency(commission)}
                disabled
                size="small"
                className="w-40 bg-gray-100 text-gray-700 font-bold border-none cursor-not-allowed px-2 py-1"
                placeholder="Comisión"
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };



  const renderVentaInputs = () => {
    if (isVentaChecked) {
      return (
        <div>
          {/* Campos específicos de Venta */}
          <div>Importe*</div>
          <Input
            onChange={(e) => handleAmountChange(e, 'venta')}
            prefix="$"
            size="large"
            className="text-lg"
            placeholder="Ingrese el importe de la venta"
          />

          <CategorySelector
            selectedCategory={category}  // Cambiar 'value' por 'selectedCategory'
            onCategorySelect={(value) => setCategory(value)}  // Cambiar 'onChange' por 'onCategorySelect'
            categories={categories}
          />
        </div>


      );
    }
    return null;
  };

  const handleCheckboxChange = (checkedValues) => {
    const isArqueoSelected = checkedValues.includes('arqueo');
    const isVentaSelected = checkedValues.includes('venta');

    // Si se selecciona Arqueo, desactivar Venta y viceversa
    setIsArqueoChecked(isArqueoSelected);
    setIsVentaChecked(isVentaSelected && !isArqueoSelected);

    // Resetear la categoría cuando cambia el tipo de ingreso
    setCategory('');
  };


  return (
    <div className="p-6 max-w-[1200px] mx-auto bg-white  shadow">
      <div
        className="flex justify-between items-center mb-6"
        style={{
          position: "sticky", // Hace que el elemento sea pegajoso
          top: 0, // Define la posición desde la parte superior donde se fija
          zIndex: 10, // Asegura que esté por encima de otros elementos
          backgroundColor: "white", // Fondo blanco para evitar transparencias
          padding: "1rem", // Espaciado interno
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Sombra para destacarlo
        }}
      >
        <Title level={3} className="mb-0">
          Crear un Ingreso
        </Title>
        <Space>
          <Space>
            <div className="px-6 py-4 flex justify-end">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="bulkUploadInput"
              />
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={loading}
                onClick={() => document.getElementById("bulkUploadInput").click()}
                className="bg-blue-400 hover:bg-green-800 border-none text-white"
              >
                Cargar Ingresos Masivos
              </Button>
            </div>
            <Button onClick={handleCancel} type="default" className="border-gray-300 text-gray-600">
              Cancelar
            </Button>
            <Button onClick={handleSave} type="primary" className="bg-green-500 text-white">
              Guardar
            </Button>
          </Space>
        </Space>
      </div>

      {/* Encabezado */}


      <Card
        className="mb-6"
        bordered={false}

      >

        <div className="flex justify-between items-start mb-4">
          {/* Descripción a la izquierda */}
          <div className="w-2/3">
            <label className="block text-sm font-medium text-gray-700">Titulo*</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade un título descriptivo"
              rows={1}
              className="w-[50em] border  p-1"
            />
          </div>

          {/* Fecha a la derecha */}
          <div className="w-1/4">
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <DatePicker
              value={date}
              onChange={(newDate) => setDate(newDate)}
              format="YYYY-MM-DD"
              className="w-full"
            />
          </div>
        </div>
        <div >
          <div className="mb-6">
            {/* Tipo de Ingreso */}
            <div>Tipo de Ingreso</div>
            <Radio.Group
              value={isArqueoChecked ? 'arqueo' : isVentaChecked ? 'venta' : null}
              onChange={(e) => handleCheckboxChange([e.target.value])}
            >
              <Radio value="arqueo">Arqueo</Radio>
              <Radio value="venta">Venta</Radio>
            </Radio.Group>

          </div>


          {renderArqueoInputs()}
          {renderVentaInputs()}
        </div>
      </Card>

      <div className="mt-6 text-center text-sm text-gray-500 border-t border-dashed border-gray-400 pt-2"></div>

      <Card
        className="mb-6"
        bordered={false}>
        <div className="mb-6">
          <AccountSelector
            selectedAccount={account}  // Cambiar 'value' por 'selectedAccount'
            onAccountSelect={(value) => setAccount(value)}  // Cambiar 'onChange' por 'onAccountSelect'
            accounts={accounts}
          />

        </div>

        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700">Comentarios*</label>
          <textarea
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            placeholder="Añade comentarios adicionales"
            rows={3}
            className="w-full border  p-1"
          />
        </div>

      </Card>

      {/* Cuerpo */}

      <VoucherSection
        onVoucherChange={setVoucher}
        initialVouchers={voucher ? JSON.parse(voucher) : []}
      />

      <div className="mt-6 text-center text-sm text-gray-500 border-t border-dashed border-gray-400 pt-2"></div></div>

  );
};

export default AddIncome;