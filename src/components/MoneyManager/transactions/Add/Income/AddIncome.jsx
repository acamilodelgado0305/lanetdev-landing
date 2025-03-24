import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import AccountSelector from "../AccountSelector";
import CategorySelector from "../CategorySelector";
import { DatePicker, Input, Button, Row, Col, Tabs, Card, Radio, Typography, Space, Checkbox, Divider, Select } from "antd";
import {
  DollarCircleOutlined, CloseOutlined, UploadOutlined, DownloadOutlined, FileTextOutlined
} from "@ant-design/icons";
import Swal from "sweetalert2";
import { uploadImage } from "../../../../../services/apiService";
import dayjs from "dayjs";
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import VoucherSection from "../../components/VoucherSection";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable
import { format as formatDate } from "date-fns";
import { es } from "date-fns/locale";
import ImportePersonalizado from "./ImportePersonalizado";


const apiUrl = import.meta.env.VITE_API_FINANZAS;
const { Title, Text } = Typography;

const AddIncome = ({ onTransactionAdded }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTab = location.state?.returnTab || "resumen";
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
  const [arqueoCategoryId, setArqueoCategoryId] = useState(null);
  const [isArqueoChecked, setIsArqueoChecked] = useState(true);
  const [isVentaChecked, setIsVentaChecked] = useState(false);
  const [startPeriod, setStartPeriod] = useState(null);
  const [endPeriod, setEndPeriod] = useState(null);
  const [arqueoNumber, setArqueoNumber] = useState("");
  const [otherIncome, setOtherIncome] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [cashierCommission, setCashierCommission] = useState("");
  const [CommissionPorcentaje, setCommissionPorcentaje] = useState("");
  const [isIncomeSaved, setIsIncomeSaved] = useState(false);
  const [cashierid, setCashierid] = useState(null);
  const [stats, setStats] = useState({
    totalCashiers: 0,
    avgCommission: 0,
  });

  const [hasImportePersonalizado, setHasImportePersonalizado] = useState(false);
  const [importePersonalizadoAmount, setImportePersonalizadoAmount] = useState("");

  const [expenseTableData, setExpenseTableData] = useState({
    items: [{
      key: '1',
      provider: '',
      product: '',
      quantity: 1.00,
      unitPrice: 0.00,
      purchaseValue: 0.00,
      discount: 0.00,
      taxCharge: 0.00,
      taxWithholding: 0.00,
      total: 0.00,
      categoria: "",
    }],
    totals: {
      totalBruto: 0,
      descuentos: 0,
      subtotal: 0,
      iva: 0,
      retencion: 0,
      totalNeto: 0,
      ivaPercentage: "0",
      retencionPercentage: "0",
      totalImpuestos: 0,
    },
  });


  const handleCancel = () => {
    // Siempre pasar el returnTab correcto al cancelar
    navigate("/index/moneymanager/transactions", { state: { activeTab: returnTab } });
  };

  const handleItemsChange = (updatedItems) => {
    setExpenseTableData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  useEffect(() => {
    if (id) {
      fetchIncomeData();
      fetchCashiers();
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
    fetchCashiers();
  }, []);

  useEffect(() => {
    const totalAmount = calculateTotalAmount();
    const commission = CommissionPorcentaje > 0 ? totalAmount * (CommissionPorcentaje / 100) : 0;
    setCashierCommission(commission);
  }, [fevAmount, diversoAmount, otherIncome, CommissionPorcentaje]);

  // Fetch Functions
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`);
      const data = await response.json();
      const incomeCategories = data.filter(
        (category) =>
          category.type?.toLowerCase() === "income" || category.type?.toLowerCase() === "ingreso"
      );
      setCategories(incomeCategories);

      const arqueoCategory = incomeCategories.find((cat) => cat.name === "Arqueo");
      const ventaCategory = incomeCategories.find((cat) => cat.name === "Venta");

      if (arqueoCategory) setArqueoCategoryId(arqueoCategory.id);
      if (ventaCategory) setVentaCategoryId(ventaCategory.id);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${apiUrl}/accounts`);
      const data = await response.json();
      const filteredAccounts = data.filter(
        (account) =>
          !account.type?.toLowerCase().includes("loan") &&
          !account.type?.toLowerCase().includes("prestamo") &&
          !account.type?.toLowerCase().includes("préstamo")
      );
      setAccounts(filteredAccounts);
    } catch (error) {
      console.error("Error al obtener las cuentas:", error);
    }
  };

  const fetchCashiers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_FINANZAS}/cajeros`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      const cashiersArray = responseData.data || [];
      const mappedCashiers = cashiersArray.map((cashier) => ({
        id_cajero: cashier.id_cajero,
        nombre: cashier.nombre,
        comision_porcentaje: cashier.comision_porcentaje,
        importe_personalizado: cashier.importe_personalizado || false, // Nuevo campo
      }));
      setCashiers(mappedCashiers);
    } catch (error) {
      console.error("Error al obtener los cajeros:", error);
      setCashiers([]);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los cajeros. Por favor, intente de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchIncomeData = async () => {
    try {
      const response = await fetch(`${apiUrl}/incomes/${id}`);
      if (!response.ok) throw new Error("No se pudo obtener la información del ingreso");
      const data = await response.json();

      setAmount(data.amount?.toString() || "");
      setCategory(data.category_id?.toString() || "");
      setAccount(data.account_id?.toString() || "");
      setDescription(data.description || "");
      setComentarios(data.comentarios || "");
      setDate(data.date ? dayjs(data.date) : dayjs());

      if (data.type === "arqueo") {
        setIsArqueoChecked(true);
        setFevAmount(data.amountfev?.toString() || "");
        setDiversoAmount(data.amountdiverse?.toString() || "");
        setCashierid(data.cashier_id || "");
        setArqueoNumber(data.arqueo_number?.toString() || "");
        setOtherIncome(data.other_income?.toString() || "");
        setCashReceived(data.cash_received?.toString() || "");
        setCashierCommission(data.cashier_commission?.toString() || "");
        setStartPeriod(data.start_period ? dayjs(data.start_period) : null);
        setEndPeriod(data.end_period ? dayjs(data.end_period) : null);
      } else if (data.category_id === ventaCategoryId) {
        setIsVentaChecked(true);
      }
    } catch (error) {
      console.error("Error al obtener los datos del ingreso:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la información del ingreso. " + error.message,
      });
    }
  };

  // Helper Functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalAmount = () => {
    const fev = parseFloat(fevAmount) || 0;
    const diverso = parseFloat(diversoAmount) || 0;
    const otros = parseFloat(otherIncome) || 0;
    const personalizado = hasImportePersonalizado ? (parseFloat(importePersonalizadoAmount) || 0) : 0;
    return fev + diverso + otros + personalizado;
  };

  const handleAmountChange = (e, field) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;

    if (field === "fev") setFevAmount(numericValue);
    else if (field === "diverso") setDiversoAmount(numericValue);
    else if (field === "other_incomes") setOtherIncome(numericValue);
    else if (field === "cashReceived") setCashReceived(numericValue);
    else if (field === "importePersonalizado") setImportePersonalizadoAmount(numericValue); // Nuevo campo
  };

  const handleTotalsChange = (updatedTotals) => {
    setExpenseTableData(prev => ({
      ...prev,
      totals: updatedTotals
    }));
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

      const totalAmount = isArqueoChecked
        ? calculateTotalAmount()
        : parseFloat(amount);

      const baseRequestBody = {
        user_id: parseInt(sessionStorage.getItem("userId")),
        account_id: parseInt(account),
        category_id: parseInt(category),
        type: isArqueoChecked ? "arqueo" : "income",
        date: date.format("YYYY-MM-DD[T]HH:mm:ss[Z]"),
        voucher: voucher,
        description: description,
        comentarios: comentarios,
        estado: true,
        amount: totalAmount,
      };

      let requestBody;
      if (isArqueoChecked) {
        const commission = totalAmount * 0.02;
        requestBody = {
          ...baseRequestBody,
          amountfev: parseFloat(fevAmount) || 0,
          amountdiverse: parseFloat(diversoAmount) || 0,
          cashier_id: cashierid,
          arqueo_number: arqueoNumber,
          other_income: parseFloat(otherIncome) || 0,
          cash_received: parseFloat(cashReceived) || 0,
          cashier_commission: cashierCommission,
          start_period: startPeriod?.format("YYYY-MM-DD"),
          end_period: endPeriod?.format("YYYY-MM-DD"),
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

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      await response.json();
      setIsIncomeSaved(true);

      Swal.fire({
        icon: "success",
        title: id ? "Ingreso Actualizado" : "Ingreso Registrado",
        text: id ? "El ingreso se ha actualizado correctamente" : "El ingreso se ha registrado correctamente",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Descargar PDF",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#5cb85c",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/index/moneymanager/transactions", { state: { activeTab: "incomes" } });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          handleDownloadPDF();
          navigate("/index/moneymanager/transactions", { state: { activeTab: "incomes" } });
        }
      });
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

  const resetForm = () => {
    setAmount("");
    setFevAmount("");
    setDiversoAmount("");
    setCategory("");
    setAccount("");
    setVoucher("");
    setDescription("");
    setComentarios("");
    setDate(dayjs());
    setCashierid("");
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
      if (onTransactionAdded) onTransactionAdded();
    } catch (error) {
      message.error("Error al procesar la carga masiva.");
      console.error("Error en la carga masiva:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCashierName = (cashierId) => {
    const cashier = cashiers.find((cash) => cash.id_cajero === cashierId);
    return cashier ? cashier.nombre : "Cajero no encontrado";
  };

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Cuenta no encontrada";
  };

  const renderDate = (date) => {
    return date ? date.format("D MMM YYYY") : "N/A";
  };

  const handleDownloadPDF = () => {
    Swal.fire({
      title: "Generando PDF",
      text: "Por favor espere...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("FACTURA", 105, 20, { align: "center" });

      // Company Info (customize as needed)
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Nombre de la Empresa", 14, 30);
      doc.text("NIT: 123456789-0", 14, 36);
      doc.text("Dirección: Calle 123 #45-67, Bogotá, Colombia", 14, 42);
      doc.text("Teléfono: +57 123 456 7890", 14, 48);

      // Invoice Info
      doc.text(`Fecha: ${formatDate(new Date(), "d MMMM yyyy", { locale: es })}`, 140, 30);
      doc.text(`Factura N°: ${Math.floor(Math.random() * 1000000)}`, 140, 36);

      // Income Data as a Single Entry
      const incomeData = [
        {
          arqueo_number: isArqueoChecked ? arqueoNumber || "N/A" : "N/A",
          description: description || "Sin descripción",
          date: date ? date.format("YYYY-MM-DD") : new Date().toISOString().split("T")[0],
          account_id: account,
          cashier_id: isArqueoChecked ? cashierid : null,
          amount: isArqueoChecked ? calculateTotalAmount() : parseFloat(amount) || 0,
          start_period: isArqueoChecked ? startPeriod?.format("YYYY-MM-DD") : null,
          end_period: isArqueoChecked ? endPeriod?.format("YYYY-MM-DD") : null,
        },
      ];

      const tableData = incomeData.map((item) => [
        item.arqueo_number,
        item.description,
        renderDate(date),
        getAccountName(item.account_id),
        getCashierName(item.cashier_id) || "N/A",
        formatCurrency(item.amount),
        renderDate(startPeriod),
        renderDate(endPeriod),
      ]);

      autoTable(doc, {
        startY: 60,
        head: [["N° Arqueo", "Descripción", "Fecha", "Cuenta", "Cajero", "Monto", "Desde", "Hasta"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 40 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 20 },
          7: { cellWidth: 20 },
        },
      });

      // Total
      const totalAmount = isArqueoChecked ? calculateTotalAmount() : parseFloat(amount) || 0;
      doc.setFontSize(12);
      doc.text(`Total: ${formatCurrency(totalAmount)}`, 140, doc.lastAutoTable.finalY + 10);

      // Additional Info (e.g., for Arqueo)
      if (isArqueoChecked) {
        doc.setFontSize(10);
        doc.text("Desglose de Ingresos:", 14, doc.lastAutoTable.finalY + 20);
        doc.text(`Importe FEV: ${formatCurrency(fevAmount)}`, 14, doc.lastAutoTable.finalY + 26);
        doc.text(`Importe Diverso: ${formatCurrency(diversoAmount)}`, 14, doc.lastAutoTable.finalY + 32);
        doc.text(`Otros Ingresos: ${formatCurrency(otherIncome)}`, 14, doc.lastAutoTable.finalY + 38);
        doc.text(`Efectivo Recibido: ${formatCurrency(cashReceived)}`, 14, doc.lastAutoTable.finalY + 44);
        doc.text(`Comisión (${CommissionPorcentaje}%): ${formatCurrency(cashierCommission)}`, 14, doc.lastAutoTable.finalY + 50);
        if (comentarios) {
          doc.text("Observaciones:", 14, doc.lastAutoTable.finalY + 56);
          doc.text(comentarios, 14, doc.lastAutoTable.finalY + 62, { maxWidth: 180 });
        }
      }

      // Footer
      doc.setFontSize(10);

      doc.text("Este documento no tiene validez fiscal", 105, 286, { align: "center" });

      // Save the PDF
      doc.save(`Factura_Ingreso_${arqueoNumber || "sin_numero"}_${formatDate(new Date(), "yyyy-MM-dd")}.pdf`);

      Swal.fire({
        icon: "success",
        title: "PDF Generado",
        text: "El comprobante se ha descargado correctamente",
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudo generar el PDF: ${error.message}`,
      });
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
              value={cashierid}
              onChange={(value, option) => {
                setCashierid(value);
                const selectedCashier = cashiers.find((c) => c.id_cajero === value);
                if (selectedCashier) {
                  const commissionPercentage =
                    parseFloat(selectedCashier.comision_porcentaje) > 0
                      ? parseFloat(selectedCashier.comision_porcentaje)
                      : 0;
                  setCommissionPorcentaje(commissionPercentage);
                  // Actualizar si tiene importe personalizado
                  setHasImportePersonalizado(selectedCashier.importe_personalizado || false);
                  // Reiniciar el importe personalizado al cambiar de cajero
                  setImportePersonalizadoAmount("");
                }
              }}
              className="w-64"
              placeholder="Selecciona un cajero"
            >
              {cashiers.map((cashier) => (
                <Select.Option key={cashier.id_cajero} value={cashier.id_cajero}>
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
          className="w-[50em] border p-1"
        />
      </div>
    </div>
  );

  const renderArqueoInputs = () => {
    if (isArqueoChecked) {
      const amount = calculateTotalAmount();
      const cashReceivedValue = parseFloat(cashReceived) || 0;
      const isCashMatch = cashReceivedValue === amount;
      const commission = amount * (CommissionPorcentaje / 100);

      return (
        <div className="p-6 space-y-8">
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
          </div>
          <Divider />
          <div className="space-y-4">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Title level={4} style={{ margin: 0 }}>Donde ingresa el dinero*</Title>
            </div>
            <AccountSelector
              selectedAccount={account}
              onAccountSelect={(value) => setAccount(value)}
              accounts={accounts}
            />
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4">
                <Title level={5}>Desglose de Ingresos</Title>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Importe FEV:</span>
                    <Input
                      value={formatCurrency(fevAmount)}
                      onChange={(e) => handleAmountChange(e, "fev")}
                      className="w-40"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Importe Diverso:</span>
                    <Input
                      value={formatCurrency(diversoAmount)}
                      onChange={(e) => handleAmountChange(e, "diverso")}
                      className="w-40"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Otros Ingresos:</span>
                    <Input
                      value={formatCurrency(otherIncome)}
                      onChange={(e) => handleAmountChange(e, "other_incomes")}
                      className="w-40"
                    />
                  </div>
                  {hasImportePersonalizado && (
                    <>
                      <div className="flex justify-between">
                        <span>Importe Personalizado:</span>

                      </div>
                      <div className="bg-white w-full">
                        <ImportePersonalizado
                          items={expenseTableData.items}
                          onItemsChange={handleItemsChange}
                          onTotalsChange={handleTotalsChange}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-4">
                <Title level={5}>Resumen</Title>
                <div className="space-y-3">
                  <div className="bg-[#0052CC] text-white rounded-md py-2 px-4 flex justify-between items-center">
                    <span className="text-white text-xl">Total a cobrar</span>
                    <span className="font-bold text-lg">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Efectivo Recibido:</span>
                    <Input
                      value={formatCurrency(cashReceived)}
                      onChange={(e) => handleAmountChange(e, "cashReceived")}
                      className="w-40"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Comisión ({CommissionPorcentaje}%):</span>
                    <span className="font-bold">{formatCurrency(cashierCommission)}</span>
                  </div>
                </div>
              </div>
            </div>
            {renderDiscrepancyMessage()}
          </div>
          <Divider />
          <div className="space-y-4">
            <Title level={4}>Observaciones</Title>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Añade comentarios adicionales"
              rows={3}
              className="w-full border p-2"
            />
          </div>
        </div>
      );
    }
    return null;
  };

  const renderDiscrepancyMessage = () => {
    const totalAmount = calculateTotalAmount();
    const cashReceivedValue = parseFloat(cashReceived) || 0;
    const difference = cashReceivedValue - totalAmount;
    const isCashMatch = Math.abs(difference) < 0.01;

    let messageText, messageClass, differenceText, questionText;

    if (isCashMatch) {
      messageText = "Los valores coinciden correctamente";
      messageClass = "bg-green-100 text-green-700";
      differenceText = "";
    } else if (difference > 0) {
      messageText = "¡Alerta! Hay un excedente en el arqueo";
      messageClass = "bg-yellow-100 text-yellow-700";
      differenceText = `Sobran ${formatCurrency(difference)}`;
      questionText = "¿Por qué hay dinero extra? Verifique posibles errores en el registro de ventas.";
    } else {
      messageText = "¡Error! Hay un déficit en el arqueo";
      messageClass = "bg-red-100 text-red-700";
      differenceText = `Faltan ${formatCurrency(Math.abs(difference))}`;
      questionText = "¿Por qué falta dinero? Revise posibles errores de cobro o si hubo retiros no registrados.";
    }

    return (
      <div className={`p-4 rounded-lg mb-4 ${messageClass}`}>
        <h3 className="font-bold text-lg mb-2">{messageText}</h3>
        {!isCashMatch && (
          <div className="flex flex-col space-y-2">
            <div className="text-2xl font-bold mb-3">Diferencia: {differenceText}</div>
            <div className="space-y-2 text-sm">
              <div className="justify-between">
                <div>Efectivo esperado:</div>
                <div>{formatCurrency(totalAmount)}</div>
              </div>
              <div className="justify-between">
                <div>Efectivo recibido:</div>
                <div>{formatCurrency(cashReceivedValue)}</div>
              </div>
            </div>
            <div className="mt-3 border-t pt-3 italic">{questionText}</div>
          </div>
        )}
      </div>
    );
  };

  const renderVentaInputs = () => {
    if (isVentaChecked) {
      return (
        <div>
          <div>Importe*</div>
          <Input
            onChange={(e) => handleAmountChange(e, "venta")}
            prefix="$"
            size="large"
            className="text-lg"
            placeholder="Ingrese el importe de la venta"
          />
          <CategorySelector
            selectedCategory={category}
            onCategorySelect={(value) => setCategory(value)}
            categories={categories}
          />
        </div>
      );
    }
    return null;
  };

  const handleCheckboxChange = (checkedValues) => {
    const isArqueoSelected = checkedValues.includes("arqueo");
    const isVentaSelected = checkedValues.includes("venta");
    setIsArqueoChecked(isArqueoSelected);
    setIsVentaChecked(isVentaSelected && !isArqueoSelected);
    setCategory("");
  };

  return (
    <div className="p-6 max-w-[1300px] mx-auto bg-white shadow ">
      <div className="sticky top-0 z-10 bg-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#0052CC] p-2">
            <FileTextOutlined className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#0052CC] text-sm">Ingresos /</span>
            <Title level={3}>{id ? "Editar" : "Crear"}</Title>
          </div>
        </div>
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
              className="bg-transparent border border-[#0052CC] text-[#0052CC] hover:bg-[#0052CC] hover:text-white"
              style={{ borderRadius: 2 }}
            >
              Cargar Ingresos Masivos
            </Button>
          </div>
          <Button
            onClick={handleCancel}
            className="bg-transparent border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
            style={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            type="primary"
            className="bg-[#0052CC]"
            style={{ borderRadius: 2 }}
          >
            Guardar
          </Button>
        </Space>
      </div>
      <div bordered={false} className="mt-6">
        <Radio.Group
          value={isArqueoChecked ? "arqueo" : isVentaChecked ? "venta" : null}
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
        entryId={id}
      />
    </div>
  );
};

export default AddIncome;