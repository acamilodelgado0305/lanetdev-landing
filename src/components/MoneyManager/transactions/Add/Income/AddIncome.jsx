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
import autoTable from "jspdf-autotable";
import { format as formatDate } from "date-fns";
import { es } from "date-fns/locale";
import ArqueoInputs from "./ArqueoInputs";

import VentaInputs from "./VentaInputs"; // Add this import

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
  const [categorias, setCategorias] = useState([]);
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
  const [customAmounts, setCustomAmounts] = useState([]);
  const [customAmountsTotal, setCustomAmountsTotal] = useState(0);
  const [categoria, setCategoria] = useState(null);

  const handleCancel = () => {
    navigate("/index/moneymanager/transactions", { state: { activeTab: returnTab } });
  };

  useEffect(() => {
    if (id) {
      fetchIncomeData();
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`);
      const data = await response.json();
      const incomeCategories = data.filter(
        (category) =>
          category.type?.toLowerCase() === "income" || category.type?.toLowerCase() === "ingreso"
      );
      setCategorias(incomeCategories);

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

  const fetchCashierDetails = async (cashierId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_FINANZAS}/cajeros/${cashierId}`);
      if (!response.ok) throw new Error("Error fetching cashier details");
      const { data } = await response.json();
      const mappedCustomAmounts = (data.importes_personalizados || []).map((item) => ({
        key: item.id_importe || `${Date.now()}-${Math.random()}`,
        product: item.producto || '',
        action: item.accion || 'suma',
        value: parseFloat(item.valor) || 0,
      }));
      setCustomAmounts(mappedCustomAmounts);
      const initialTotal = mappedCustomAmounts.reduce((acc, item) => {
        const value = parseFloat(item.value) || 0;
        return item.action === 'suma' ? acc + value : acc - value;
      }, 0);
      setCustomAmountsTotal(initialTotal);
    } catch (error) {
      console.error("Error fetching cashier details:", error);
      setCustomAmounts([]);
      setCustomAmountsTotal(0);
    }
  };

  const handleCustomAmountsChange = (updatedItems) => {
    setCustomAmounts(updatedItems);
  };

  const handleCustomTotalsChange = (totals) => {
    setCustomAmountsTotal(totals.total);
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
        setCommissionPorcentaje(data.commission_porcentaje?.toString() || "0");
        setStartPeriod(data.start_period ? dayjs(data.start_period) : null);
        setEndPeriod(data.end_period ? dayjs(data.end_period) : null);

        const importesPersonalizados = Array.isArray(data.importes_personalizados) ? data.importes_personalizados : [];
        const mappedCustomAmounts = importesPersonalizados.map((item) => ({
          key: item.id_importe || `${Date.now()}-${Math.random()}`,
          product: item.producto || '',
          action: item.accion || 'suma',
          value: parseFloat(item.valor) || 0,
        }));
        setCustomAmounts(mappedCustomAmounts);
        setCustomAmountsTotal(parseFloat(data.amountcustom) || 0);
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
    const custom = parseFloat(customAmountsTotal) || 0;
    return fev + diverso + otros + custom;
  };

  const handleAmountChange = (e, field) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = rawValue ? parseFloat(rawValue) : 0;

    if (field === "fev") setFevAmount(numericValue);
    else if (field === "diverso") setDiversoAmount(numericValue);
    else if (field === "other_incomes") setOtherIncome(numericValue);
    else if (field === "cashReceived") setCashReceived(numericValue);
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

      const totalAmount = isArqueoChecked ? calculateTotalAmount() : parseFloat(amount);

      const baseRequestBody = {
        user_id: parseInt(sessionStorage.getItem("userId")),
        account_id: parseInt(account),
        category_id: parseInt(category) || null,
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
        const safeCustomAmounts = Array.isArray(customAmounts) ? customAmounts : [];
        const validCustomAmounts = safeCustomAmounts
          .filter(item => item && typeof item === 'object' && item.key && typeof item.product === 'string' && item.action && typeof item.value === 'number')
          .map(item => ({
            id_importe: item.key,
            producto: item.product,
            accion: item.action,
            valor: item.value,
          }));

        requestBody = {
          ...baseRequestBody,
          amountfev: parseFloat(fevAmount) || 0,
          amountdiverse: parseFloat(diversoAmount) || 0,
          cashier_id: cashierid,
          arqueo_number: arqueoNumber,
          other_income: parseFloat(otherIncome) || 0,
          cash_received: parseFloat(cashReceived) || 0,
          cashier_commission: parseFloat(cashierCommission) || 0,
          start_period: startPeriod?.format("YYYY-MM-DD"),
          end_period: endPeriod?.format("YYYY-MM-DD"),
          amountcustom: customAmountsTotal,
          importes_personalizados: validCustomAmounts,
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
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

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
        text: "Hubo un error al procesar el ingreso: " + error.message,
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
      if (onTransactionAdded) onTransactionAdded();
    } catch (error) {
      message.error("Error al procesar la carga masiva.");
      console.error("Error en la carga masiva:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAccountName = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : "Cuenta no encontrada";
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

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("FACTURA", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Nombre de la Empresa", 14, 30);
      doc.text("NIT: 123456789-0", 14, 36);
      doc.text("Dirección: Calle 123 #45-67, Bogotá, Colombia", 14, 42);
      doc.text("Teléfono: +57 123 456 7890", 14, 48);

      doc.text(`Fecha: ${formatDate(new Date(), "d MMMM yyyy", { locale: es })}`, 140, 30);
      doc.text(`Factura N°: ${Math.floor(Math.random() * 1000000)}`, 140, 36);

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
        item.date,
        getAccountName(item.account_id),
        item.cashier_id || "N/A",
        formatCurrency(item.amount),
        item.start_period || "N/A",
        item.end_period || "N/A",
      ]);

      autoTable(doc, {
        startY: 60,
        head: [["N° Arqueo", "Descripción", "Fecha", "Cuenta", "Cajero", "Monto", "Desde", "Hasta"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
      });

      const totalAmount = isArqueoChecked ? calculateTotalAmount() : parseFloat(amount) || 0;
      doc.setFontSize(12);
      doc.text(`Total: ${formatCurrency(totalAmount)}`, 140, doc.lastAutoTable.finalY + 10);

      if (isArqueoChecked) {
        doc.setFontSize(10);
        doc.text("Desglose de Ingresos:", 14, doc.lastAutoTable.finalY + 20);
        doc.text(`Importe FEV: ${formatCurrency(fevAmount)}`, 14, doc.lastAutoTable.finalY + 26);
        doc.text(`Importe Diverso: ${formatCurrency(diversoAmount)}`, 14, doc.lastAutoTable.finalY + 32);
        doc.text(`Otros Ingresos: ${formatCurrency(otherIncome)}`, 14, doc.lastAutoTable.finalY + 38);
        doc.text(`Importes Fijos: मुcustomAmountsTotal)}`, 14, doc.lastAutoTable.finalY + 44);
        doc.text(`Efectivo Recibido: ${formatCurrency(cashReceived)}`, 14, doc.lastAutoTable.finalY + 50);
        doc.text(`Comisión (${CommissionPorcentaje}%): ${formatCurrency(cashierCommission)}`, 14, doc.lastAutoTable.finalY + 56);
        if (comentarios) {
          doc.text("Observaciones:", 14, doc.lastAutoTable.finalY + 62);
          doc.text(comentarios, 14, doc.lastAutoTable.finalY + 68, { maxWidth: 180 });
        }
      }

      doc.setFontSize(10);
      doc.text("Este documento no tiene validez fiscal", 105, 286, { align: "center" });

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

  const renderVentaInputs = () => {
    return (
      <VentaInputs
        isVentaChecked={isVentaChecked}
        handleAmountChange={handleAmountChange}
        categoria={categoria}
        setCategoria={setCategoria}
        categorias={categorias}
        account={account}
        setAccount={setAccount}
        accounts={accounts}
        date={date}
      />
    );
  };

  const handleCheckboxChange = (checkedValues) => {
    const isArqueoSelected = checkedValues.includes("arqueo");
    const isVentaSelected = checkedValues.includes("venta");
    setIsArqueoChecked(isArqueoSelected);
    setIsVentaChecked(isVentaSelected && !isArqueoSelected);
    setCategory("");
  };

  return (
    <div className=" max-w-[1300px] mx-auto bg-white shadow-lg rounded-lg py-2">
      {/* Encabezado fijo */}
      <div className="sticky top-0 z-10 bg-white px-4 pt-4 border-b border-gray-200 flex justify-between items-center">

        <div className="flex px-2 rounded-md justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">COMPROBANTE DE INGRESO</h1>
            <p className="text-sm text-gray-500">Documento de control interno</p>
          </div>

        </div>

        <Space size="middle">
          <div>
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
            className="bg-[#0052CC] hover:bg-[#003bb3]"
            style={{ borderRadius: 2 }}
          >
            Guardar
          </Button>
        </Space>
      </div>

      {/* Contenido principal */}
      <div className=" px-4">


        <div className="flex justify-between items-end">
          <Tabs
            activeKey={isArqueoChecked ? "arqueo" : isVentaChecked ? "venta" : "arqueo"}
            onChange={(key) => handleCheckboxChange([key])}
            className=""
            items={[
              {
                key: "arqueo",
                label: "Arqueo",
              },
              {
                key: "venta",
                label: "Venta",
              },
            ]}

          />
          <div className="text-right space-y-2 pr-4">
            <p className="text-gray-600">
              <span className="font-semibold">Fecha:</span> {date?.format("DD/MM/YYYY")}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <ArqueoInputs
            isArqueoChecked={isArqueoChecked}
            arqueoNumber={arqueoNumber}
            setArqueoNumber={setArqueoNumber}
            date={date}
            cashierid={cashierid}
            setCashierid={setCashierid}
            description={description}
            setDescription={setDescription}
            startPeriod={startPeriod}
            setStartPeriod={setStartPeriod}
            endPeriod={endPeriod}
            setEndPeriod={setEndPeriod}
            account={account}
            setAccount={setAccount}
            accounts={accounts}
            fevAmount={fevAmount}
            handleAmountChange={handleAmountChange}
            diversoAmount={diversoAmount}
            otherIncome={otherIncome}
            customAmounts={customAmounts}
            handleCustomAmountsChange={handleCustomAmountsChange}
            handleCustomTotalsChange={handleCustomTotalsChange}
            customAmountsTotal={customAmountsTotal}
            cashReceived={cashReceived}
            calculateTotalAmount={calculateTotalAmount}
            CommissionPorcentaje={CommissionPorcentaje}
            setCommissionPorcentaje={setCommissionPorcentaje}
            cashierCommission={cashierCommission}
            setCashierCommission={setCashierCommission}
            comentarios={comentarios}
            setComentarios={setComentarios}
            formatCurrency={formatCurrency}
          />
          {renderVentaInputs()}
        </div>

        <div className="mt-6">
          <VoucherSection
            onVoucherChange={setVoucher}
            initialVouchers={voucher}
            entryId={id}
            type="income"
          />
        </div>
      </div>
    </div>
  );
};

export default AddIncome;