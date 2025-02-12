import React, { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import AccountSelector from "../AccountSelector ";
import CategorySelector from '../CategorySelector';
import { DatePicker, Input, Button, Row, Col, Tabs, Card, Radio, Typography, Space, Checkbox, Divider, Select } from "antd";
import {
  DollarCircleOutlined, CloseOutlined
} from '@ant-design/icons';
import Swal from "sweetalert2";
import { uploadImage } from "../../../../../services/apiService";
import dayjs from "dayjs";
import { UploadOutlined, DownloadOutlined, FileTextOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
const apiUrl = import.meta.env.VITE_API_FINANZAS;
import VoucherSection from "../../components/VoucherSection";

const { Title, Text } = Typography;


const AddIncome = ({ onTransactionAdded, transactionToEdit }) => {
  const navigate = useNavigate(); // Inicializa el hook useNavigaten
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
  const [cashiers, setCashiers] = useState([]);

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

  const [stats, setStats] = useState({
    totalCashiers: 0,
    avgCommission: 0
  });

  const printRef = useRef();

  const handleCancel = () => {
    navigate(-1); // Navega hacia atrás en la historia del navegador
  };



  //------------USE EFECTS--------------------------

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
    fetchCashiers();
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

  const fetchCashiers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_TERCEROS}/cajeros`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const cashiersArray = responseData.data || [];

      // Mapear solo los campos necesarios
      const mappedCashiers = cashiersArray.map(cashier => ({
        nombre: cashier.nombre,
        comision_porcentaje: cashier.comision_porcentaje
      }));

      setCashiers(mappedCashiers);

      // Si necesitas mantener las estadísticas, puedes calcularlas con los datos simplificados
      if (mappedCashiers.length > 0) {
        const total = mappedCashiers.length;
        const avgComm = mappedCashiers.reduce((acc, curr) => acc + parseFloat(curr.comision_porcentaje || 0), 0) / total;

        setStats({
          totalCashiers: total,
          avgCommission: avgComm
        });
      }
    } catch (error) {
      console.error('Error al obtener los cajeros:', error);
      setCashiers([]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los cajeros. Por favor, intente de nuevo.',
      });
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


  const renderInvoiceHeader = () => (
    <div className="border-b-2 border-gray-200 pb-4 mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">COMPROBANTE DE ARQUEO</h1>

          <div className="flex items-center space-x-4">
            <span className="text-gray-600">No.</span>
            <Input
              value={arqueoNumber}
              onChange={(e) => setArqueoNumber(e.target.value)}
              placeholder="Número de Arqueo"
              className="w-40"
            />
          </div>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-center justify-end space-x-4">
            <p className="text-gray-600">Fecha: {date?.format("DD/MM/YYYY")}</p>

          </div>
          <div className="flex items-center justify-end space-x-4">
            <span className="text-gray-600">Cajero:</span>
            <Select
              value={cashierName}
              onChange={(value, option) => {
                setCashierName(value);
                // Actualizar la comisión basada en el cajero seleccionado
                const selectedCashier = cashiers.find(c => c.nombre === value);
                if (selectedCashier) {
                  // Guardar el porcentaje de comisión del cajero seleccionado
                  setCashierCommission(parseFloat(selectedCashier.comision_porcentaje));
                }
              }}
              className="w-64"
              placeholder="Selecciona un cajero"
            >
              {cashiers.map((cashier) => (
                <Select.Option
                  key={cashier.nombre}
                  value={cashier.nombre}
                >
                  {cashier.nombre} 
                </Select.Option>
              ))}
            </Select>
          </div>



        </div>

      </div>

      <div className="flex items-center space-x-4">
        <span className="text-gray-600">Titulo.</span>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Añade un título descriptivo"
          rows={1}
          className="w-[50em] border  p-1"
        />
      </div>

    </div>
  );

  //----------------------RENDERS-------------------------------//
  const renderArqueoInputs = () => {
    if (isArqueoChecked) {
      const calculateTotalAmount = () => {
        const fev = parseFloat(fevAmount) || 0;
        const diverso = parseFloat(diversoAmount) || 0;
        const otros = parseFloat(otherIncome) || 0;
        return fev + diverso + otros;
      };

      const amount = calculateTotalAmount();
      const cashReceivedValue = parseFloat(cashReceived) || 0;
      const isCashMatch = cashReceivedValue === amount;
      // Usar el porcentaje de comisión del cajero seleccionado
      const commission = amount * (cashierCommission / 100);

      return (
        <div className="p-6 bg-white rounded-lg shadow-lg space-y-8" ref={printRef}>
          {renderInvoiceHeader()}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <Title level={4}>Periodo de Arqueo</Title>
              <div className="flex space-x-4">
                <DatePicker
                  value={startPeriod}
                  onChange={(date) => setStartPeriod(date)}
                  placeholder="Fecha Inicio"
                  className="w-40"
                />
                <DatePicker
                  value={endPeriod}
                  onChange={(date) => setEndPeriod(date)}
                  placeholder="Fecha Fin"
                  className="w-40"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Title level={4}>Información de Cuenta</Title>
              <AccountSelector
                selectedAccount={account}
                onAccountSelect={(value) => setAccount(value)}
                accounts={accounts}
              />
            </div>
          </div>

          <Divider />

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Title level={5}>Desglose de Ingresos</Title>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Importe FEV:</span>
                    <Input
                      value={formatCurrency(fevAmount)}
                      onChange={(e) => handleAmountChange(e, 'fev')}
                      className="w-40"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Importe Diverso:</span>
                    <Input
                      value={formatCurrency(diversoAmount)}
                      onChange={(e) => handleAmountChange(e, 'diverso')}
                      className="w-40"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Otros Ingresos:</span>
                    <Input
                      value={formatCurrency(otherIncome)}
                      onChange={(e) => handleAmountChange(e, 'other_incomes')}
                      className="w-40"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <Title level={5}>Resumen</Title>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Ingresos:</span>
                    <span className="font-bold text-lg">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efectivo Recibido:</span>
                    <Input
                      value={formatCurrency(cashReceived)}
                      onChange={(e) => handleAmountChange(e, 'cashReceived')}
                      className="w-40"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Comisión ({cashierCommission}%):</span>
                    <span className="font-bold">{formatCurrency(commission)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg text-center ${isCashMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isCashMatch ? 'Los valores coinciden correctamente' : '¡Error! Hay un descuadre en el arqueo'}
            </div>
          </div>

          <Divider />

          <div className="space-y-4">
            <Title level={4}>Observaciones</Title>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Añade comentarios adicionales"
              rows={3}
              className="w-full border p-2 rounded"
            />
          </div>


        </div>
      );
    }
    return null;
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      const element = printRef.current;
      const { jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');

      const canvas = await html2canvas(element);
      const data = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const imgProperties = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`arqueo_${arqueoNumber || 'sin_numero'}.pdf`);

      Swal.fire({
        icon: 'success',
        title: 'PDF Generado',
        text: 'El comprobante se ha descargado correctamente',
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el PDF. Por favor, intente de nuevo.',
      });
    }
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
    <div className="p-6 max-w-[1200px] mx-auto bg-white shadow">
      <div className="sticky top-0 z-10 bg-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-green-400 p-2 rounded">
            <FileTextOutlined className=" text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-green-400 text-sm">Ingresos /</span>
            <Title level={3} >
              Crear
            </Title>
          </div>
        </div>
        <Space>
          {isArqueoChecked && (
            <Button
              onClick={handleDownloadPDF}
              type="primary"
              icon={<DownloadOutlined />}
              className="bg-red-500 text-white rounded"
            >
              Descargar PDF
            </Button>
          )}
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
              className="bg-blue-500 hover:bg-green-800 border-none text-white"
            >
              Cargar Ingresos Masivos
            </Button>
          </div>
          <Button onClick={handleCancel} type="default">
            Cancelar
          </Button>
          <Button onClick={handleSave} type="primary" className="bg-green-500">
            Guardar
          </Button>
        </Space>
      </div>

      <div bordered={false} className="mt-6">
        <Radio.Group
          value={isArqueoChecked ? 'arqueo' : isVentaChecked ? 'venta' : null}
          onChange={(e) => handleCheckboxChange([e.target.value])}
          className="mb-6"
        >
          <Radio value="arqueo">Arqueo</Radio>
          <Radio value="venta">Venta</Radio>
        </Radio.Group>

        {renderArqueoInputs()}
        {renderVentaInputs()}
      </div>

      <VoucherSection
        onVoucherChange={setVoucher}
        initialVouchers={voucher ? JSON.parse(voucher) : []}
      />
    </div>
  );
};


export default AddIncome;