import React, { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import AccountSelector from "../AccountSelector ";
import CategorySelector from '../CategorySelector';
import { DatePicker, Input, Button, Row, Col, Tabs, Card, Radio, Typography, Space, Checkbox, Divider, Select, Tooltip } from "antd";
import {
  InfoCircleOutlined,
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
import { useParams } from 'react-router-dom'; //
import NewExpenseTable from "./ExpenseTable";

const { Title, Text } = Typography;


const AddExpense = ({ onTransactionAdded, transactionToEdit }) => {
  const { id } = useParams(); // Obtener el ID de la URL
  const navigate = useNavigate();
  // Inicializa el hook useNavigaten
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
  const [date, setDate] = useState(dayjs());

  const [ventaCategoryId, setVentaCategoryId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isCompraCheckend, setisCompraCheckend] = useState(false);
  const [isVentaChecked, setIsVentaChecked] = useState(false);

  const [startPeriod, setStartPeriod] = useState(null);
  const [endPeriod, setEndPeriod] = useState(null);
  const [cashierName, setCashierName] = useState("");
  const [arqueoNumber, setArqueoNumber] = useState("");
  const [otherIncome, setOtherIncome] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [cashierCommission, setCashierCommission] = useState("");
  const [CommissionPorcentaje, setCommissionPorcentaje] = useState("");
  const [isIncomeSaved, setIsIncomeSaved] = useState(false);


  const [hasProviderPerItem, setHasProviderPerItem] = useState(false);
  const [hasIncludedTax, setHasIncludedTax] = useState(false);
  const [hasPercentageDiscount, setHasPercentageDiscount] = useState(false);

  const [stats, setStats] = useState({
    totalCashiers: 0,
    avgCommission: 0
  });

  const printRef = useRef();

  const handleCancel = () => {
    navigate(-1); // Navega hacia atrás en la historia del navegador
  };


  useEffect(() => {
    if (id) {
      fetchIncomeData();
      fetchCashiers();
    }
  }, [id]);


  //------------USE EFECTS--------------------------

  useEffect(() => {

    fetchAccounts();

  }, []);


  //---------------------------FETCH---------------------------//



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
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderCompraInputs = () => {
    if (isCompraCheckend) {
      return (
        <div className="p-6 bg-white rounded-lg shadow-lg space-y-8" ref={printRef}>
          {renderInvoiceHeader()}
          <Divider />
          <NewExpenseTable
            hasProviderPerItem={hasProviderPerItem}
            hasIncludedTax={hasIncludedTax}
            hasPercentageDiscount={hasPercentageDiscount}
          />
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

      const totalAmount = isCompraCheckend ?
        (parseFloat(fevAmount) || 0) +
        (parseFloat(diversoAmount) || 0) +
        (parseFloat(otherIncome) || 0) :
        parseFloat(amount);

      const baseRequestBody = {
        user_id: parseInt(sessionStorage.getItem('userId')),
        account_id: parseInt(account),
        category_id: parseInt(category),
        type: isCompraCheckend ? "arqueo" : "income",
        date: date.format("YYYY-MM-DD[T]HH:mm:ss[Z]"),
        voucher: voucher,
        description: description,
        comentarios: comentarios,
        estado: true,
        amount: totalAmount
      };

      let requestBody;
      if (isCompraCheckend) {
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

      const url = id ? `${apiUrl}/incomes/${id}` : `${apiUrl}/incomes`;
      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();

      // Actualizar el estado para indicar que el ingreso ha sido guardado
      setIsIncomeSaved(true);

      Swal.fire({
        icon: "success",
        title: id ? "Ingreso Actualizado" : "Ingreso Registrado",
        text: id ? "El ingreso se ha actualizado correctamente" : "El ingreso se ha registrado correctamente",
        confirmButtonColor: "#3085d6",
      });

      // ... (código existente)
    } catch (error) {
      console.error("Error al guardar el ingreso:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al procesar el ingreso. Por favor, intente de nuevo.",
        confirmButtonColor: "#d33",
      });
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


  const renderInvoiceHeader = () => (
    <div className="border-b-2 border-gray-200 pb-4 mb-6 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-red-600 mb-4">Nueva Factura de Compra</h1>

          <div className="flex items-center justify-end space-x-4">
            <span className="text-gray-600">Tipo:</span>
            <Select
              value={cashierName}
              onChange={(value, option) => {
                setCashierName(value);
                // Actualizar la comisión basada en el cajero seleccionado
                const selectedCashier = cashiers.find(c => c.nombre === value);
                if (selectedCashier) {
                  // Guardar el porcentaje de comisión del cajero seleccionado
                  setCommissionPorcentaje(parseFloat(selectedCashier.comision_porcentaje));
                }
              }}
              className="w-64"
              placeholder="Selecciona un cajero"
            >
              <option value="Proveedor 1">Legal</option>
              <option value="Proveedor 2">Diverso</option>


            </Select>
          </div>

          <div className="text-right space-y-2 space-x-4">
            <span className="text-gray-600">Fecha de Elaboración:</span>
            <DatePicker
              value={date} // Controla la fecha seleccionada
              onChange={(value) => setDate(value)} // Actualiza el estado cuando se selecciona una fecha
              format="DD/MM/YYYY" // Formato de visualización
              placeholder="Selecciona una fecha"
              className="w-64" // Clase para ajustar el ancho
            />


            <div className="flex items-center justify-end space-x-4">
              <span className="text-gray-600">Proveedor:</span>
              <Select
                value={cashierName}
                onChange={(value, option) => {
                  setCashierName(value);
                  // Actualizar la comisión basada en el cajero seleccionado
                  const selectedCashier = cashiers.find(c => c.nombre === value);
                  if (selectedCashier) {
                    // Guardar el porcentaje de comisión del cajero seleccionado
                    setCommissionPorcentaje(parseFloat(selectedCashier.comision_porcentaje));
                  }
                }}
                className="w-64"
                placeholder="Selecciona un cajero"
              >
                <option value="Proveedor 1">Proveedor 1</option>
                <option value="Proveedor 2">Proveedor 2</option>
                <option value="Proveedor 3">Proveedor 3</option>

              </Select>
            </div>


            <div className="flex items-center justify-end space-x-4">
              <span className="text-gray-600">Contacto:</span>
              <Select
                value={cashierName}
                onChange={(value, option) => {
                  setCashierName(value);
                  // Actualizar la comisión basada en el cajero seleccionado
                  const selectedCashier = cashiers.find(c => c.nombre === value);
                  if (selectedCashier) {
                    // Guardar el porcentaje de comisión del cajero seleccionado
                    setCommissionPorcentaje(parseFloat(selectedCashier.comision_porcentaje));
                  }
                }}
                className="w-64"
                placeholder="Selecciona un cajero"
              >
                <option value="Proveedor 1">Proveedor 1</option>
                <option value="Proveedor 2">Proveedor 2</option>
                <option value="Proveedor 3">Proveedor 3</option>

              </Select>
            </div>




          </div>
        </div>
        <div className="text-right space-y-2 space-x-5">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">No.</span>
            <Input
              value={arqueoNumber}
              onChange={(e) => setArqueoNumber(e.target.value)}
              placeholder="Número de Arqueo"
              className="w-40"
            />
          </div>


          <div className="flex items-center space-x-4">
            <span className="text-gray-600">No. Factura Proveedor</span>
            <Input
              value={arqueoNumber}
              onChange={(e) => setArqueoNumber(e.target.value)}
              placeholder="Número de Arqueo"
              className="w-30"
            />
            <Input
              value={arqueoNumber}
              onChange={(e) => setArqueoNumber(e.target.value)}
              placeholder="Número de Arqueo"
              className="w-40"
            />
          </div>





        </div>

      </div>

      <Row gutter={16} align="large">
        <Col>
          <Checkbox
            checked={hasProviderPerItem}
            onChange={(e) => setHasProviderPerItem(e.target.checked)}
          >
            Proveedor por ítem
          </Checkbox>
        </Col>
        <Col>
          <Checkbox
            checked={hasIncludedTax}
            onChange={(e) => setHasIncludedTax(e.target.checked)}
          >
            IVA / Impoconsumo incluido{" "}
            <Tooltip title="Incluye el IVA en el cálculo">
              <InfoCircleOutlined style={{ marginLeft: 4 }} />
            </Tooltip>
          </Checkbox>
        </Col>
        <Col>
          <Checkbox
            checked={hasPercentageDiscount}
            onChange={(e) => setHasPercentageDiscount(e.target.checked)}
          >
            Descuento en porcentaje
          </Checkbox>
        </Col>
      </Row>


    </div>
  );


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




  const handleCheckboxChange = (checkedValues) => {
    const isArqueoSelected = checkedValues.includes('arqueo');
    const isVentaSelected = checkedValues.includes('venta');

    // Si se selecciona Arqueo, desactivar Venta y viceversa
    setisCompraCheckend(isArqueoSelected);
    setIsVentaChecked(isVentaSelected && !isArqueoSelected);

    // Resetear la categoría cuando cambia el tipo de ingreso
    setCategory('');
  };


  return (
    <div className="p-6 max-w-[1200px] mx-auto bg-white shadow">
      <div className="sticky top-0 z-10 bg-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-red-400 p-2 rounded">
            <FileTextOutlined className=" text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-red-400 text-sm">Egresos /</span>
            <Title level={3}>
              {id ? 'Editar' : 'Nuevo'}
            </Title>
          </div>
        </div>
        <Space>

          <Button
            disabled={!isIncomeSaved}  // Deshabilitar el botón si el ingreso no ha sido guardado
            onClick={handleDownloadPDF}
            className="bg-red-500 text-white rounded"
          >
            Descargar PDF
          </Button>

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
          <Button onClick={handleSave} type="primary" className="bg-red-500">
            Guardar
          </Button>
        </Space>
      </div>

      <div bordered={false} className="mt-6">
        <Radio.Group
          value={isCompraCheckend ? 'arqueo' : isVentaChecked ? 'venta' : null}
          onChange={(e) => handleCheckboxChange([e.target.value])}
          className="mb-6"
        >
          <Radio value="arqueo">Compra</Radio>
          <Radio value="venta">Venta</Radio>
        </Radio.Group>


        {renderCompraInputs()}
        {renderVentaInputs()}


        <AccountSelector
          selectedAccount={account}
          onAccountSelect={(value) => setAccount(value)}
          accounts={accounts}
        />
      </div>

      <VoucherSection
        onVoucherChange={setVoucher}
        initialVouchers={voucher ? JSON.parse(voucher) : []}
        entryId={id}  // Añadir esta línea
      />
    </div>
  );
};


export default AddExpense;