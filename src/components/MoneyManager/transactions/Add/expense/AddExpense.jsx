import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import AccountSelector from "../AccountSelector";
import CategorySelector from "../CategorySelector";
import { DatePicker, Input, Button, Row, Col, Tabs, Card, Radio, Typography, Space, Checkbox, Divider, Select, Tooltip } from "antd";
import Swal from "sweetalert2";
import { uploadImage } from "../../../../../services/apiService";
import dayjs from "dayjs";
import { UploadOutlined, DownloadOutlined, FileTextOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import VoucherSection from "../../components/VoucherSection";
import ProductsTable from "./ProductsTable";
import { getCategorias } from "../../../../../services/moneymanager/moneyService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format as formatDate } from "date-fns";
import { es } from "date-fns/locale";
import ComprobanteEgresoHeader from "./ComprobanteHeader";

const apiUrl = import.meta.env.VITE_API_FINANZAS;
const { Title, Text } = Typography;

const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTab = location.state?.returnTab || "egresos";

  // Estados
  const [account, setAccount] = useState("");
  const [voucher, setVoucher] = useState([]);
  const [description, setDescription] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [tipo, setTipo] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [date, setDate] = useState(dayjs());
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [proveedor, setProveedor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [facturaNumber, setFacturaNumber] = useState("");
  const [facturaProvNumber, setFacturaProvNumber] = useState("");
  const [facturaProvPrefix, setFacturaProvPrefix] = useState("");
  const [isExpenseSaved, setIsExpenseSaved] = useState(false);
  const [etiqueta, setEtiqueta] = useState("");
  const [isHiddenDetails, setIsHiddenDetails] = useState(false);
  const [expenseTableData, setExpenseTableData] = useState({
    items: [],
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

  // Cargar datos iniciales
  useEffect(() => {
    if (id) {
      fetchExpenseData();
    }
    fetchAccounts();
    fetchProveedores();
    ObtenerCategorias();
  }, [id]);

  // Funciones auxiliares
  const parseNumber = (value) => parseFloat(value) || 0;

  const fetchExpenseData = async () => {
    try {
      const response = await fetch(`${apiUrl}/expenses/${id}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`No se pudo obtener la información del egreso: ${response.status} - ${errorText}`);
      }
      const data = await response.json();

      // Mapear los datos básicos del egreso
      setAccount(data.account_id?.toString() || "");
      setVoucher(data.voucher || []);
      setDescription(data.description || "");
      setComentarios(data.comments || "");
      setDate(data.date ? dayjs(data.date) : dayjs());
      setProveedor(data.provider_id || "");
      setCategoria(data.category || "");
      setFacturaNumber(data.invoice_number || "");
      setFacturaProvNumber(data.provider_invoice_number || "");
      setFacturaProvPrefix(data.provider_invoice_prefix || "");
      setTipo(data.type || "");
      setEtiqueta(data.etiqueta || ""); // Añadir mapeo de etiqueta
      setIsHiddenDetails(false);

      // Mapear los ítems del gasto (expense_items) a expenseTableData.items
      const mappedItems = (data.items || []).map((item) => ({
        key: item.id,
        id: item.id,
        categoria: item.category || "",
        product: item.product_name || "",
        quantity: item.quantity || 0,
        unitPrice: item.unit_price || 0,
        discount: item.discount || 0,
        taxCharge: item.tax_charge || 0,
        taxWithholding: item.tax_withholding || 0,
        total: item.total || 0,
      }));

      // Mapear los totales (expense_totals) a expenseTableData.totals
      const totals = {
        totalBruto: parseNumber(data.total_gross),
        descuentos: parseNumber(data.discounts),
        subtotal: parseNumber(data.subtotal),
        iva: parseNumber(data.ret_vat),
        retencion: parseNumber(data.ret_ica),
        totalNeto: parseNumber(data.total_net),
        ivaPercentage: data.ret_vat_percentage?.toString() || "0",
        retencionPercentage: data.ret_ica_percentage?.toString() || "0",
        totalImpuestos: parseNumber(data.total_impuestos),
      };

      // Actualizar expenseTableData con ítems y totales
      setExpenseTableData({
        items: mappedItems,
        totals: totals,
      });
    } catch (error) {
      console.error("Error al obtener los datos del egreso:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la información del egreso. " + error.message,
      });
    }
  };
 

  // Funciones para cargar datos de cuentas, proveedores y categorías
  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${apiUrl}/accounts`);
      const data = await response.json();
      const filteredAccounts = data.filter(account =>
        !account.type?.toLowerCase().includes("loan") &&
        !account.type?.toLowerCase().includes("prestamo") &&
        !account.type?.toLowerCase().includes("préstamo")
      );
      setAccounts(filteredAccounts);
    } catch (error) {
      console.error("Error al obtener las cuentas:", error);
    }
  };

  const fetchProveedores = async () => {
    try {
      const response = await fetch(`${apiUrl}/providers`);
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
    }
  };

  const ObtenerCategorias = async () => {
    try {
      const data = await getCategorias();
      // Filtrar solo las categorías con type "expense"
      const expenseCategories = data.filter((category) => category.type === "expense");
      setCategorias(expenseCategories);
    } catch (err) {
      console.error("Error al cargar las categorías:", err);
      setCategorias([]); // En caso de error, establecer un array vacío
    }
  };

  const handleProveedorChange = (value) => {
    setProveedor(value);
  };

  const handleCategoriaChange = (value) => {
    setCategoria(value);
  };

  const handleHiddenDetailsChange = (value) => {
    setIsHiddenDetails(value);
  };

  const handleItemsChange = (updatedItems) => {
    setExpenseTableData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleTotalsChange = (updatedTotals) => {
    setExpenseTableData(prev => ({
      ...prev,
      totals: updatedTotals
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProviderName = (providerId) => {
    const provider = proveedores.find(p => p.id === providerId);
    return provider ? provider.nombre_comercial : "Proveedor no encontrado";
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : "Cuenta no encontrada";
  };

  const renderDate = (date) => {
    return date ? date.format("D MMM YYYY") : "N/A";
  };

  // Función para guardar o actualizar el egreso
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

      const baseRequestBody = {
        user_id: parseInt(sessionStorage.getItem("userId")),
        tipo: tipo,
        date: date.format("YYYY-MM-DD[T]HH:mm:ss[Z]"),
        proveedor: proveedor,
        categoria: categoria,
        facturaNumber: facturaNumber,
        facturaProvNumber: facturaProvNumber,
        facturaProvPrefix: facturaProvPrefix,
        account_id: account,
        voucher: voucher,
        description: description,
        comentarios: comentarios,
        estado: true,
        etiqueta: etiqueta || null, // Incluir el nombre de la etiqueta
      };

      const requestBody = {
        ...baseRequestBody,
        expense_items: expenseTableData.items
          .filter(item =>
            item.product !== "" ||
            item.description !== "" ||
            item.unitPrice > 0 ||
            item.quantity > 0
          )
          .map(item => ({
            id: item.id,
            categoria: item.categoria,
            product: item.product,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unitPrice),
            discount: parseFloat(item.discount || 0),
            tax_charge: parseFloat(item.taxCharge || 0),
            tax_withholding: parseFloat(item.taxWithholding || 0),
            total: parseFloat(item.total),
          })),
        expense_totals: {
          total_bruto: parseFloat(expenseTableData.totals.totalBruto),
          descuentos: parseFloat(expenseTableData.totals.descuentos),
          subtotal: parseFloat(expenseTableData.totals.subtotal),
          iva: parseFloat(expenseTableData.totals.iva),
          retencion: parseFloat(expenseTableData.totals.retencion),
          total_neto: parseFloat(expenseTableData.totals.totalNeto),
          iva_percentage: parseFloat(expenseTableData.totals.ivaPercentage),
          retencion_percentage: parseFloat(expenseTableData.totals.retencionPercentage),
          total_impuestos: parseFloat(expenseTableData.totals.totalImpuestos),
        },
      };

      const url = id ? `${apiUrl}/expenses/${id}` : `${apiUrl}/expenses`;
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
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      setIsExpenseSaved(true);

      Swal.fire({
        icon: "success",
        title: id ? "Egreso Actualizado" : "Egreso Registrado",
        text: id ? "El egreso se ha actualizado correctamente" : "El egreso se ha registrado correctamente",
        showCancelButton: true,
        confirmButtonText: "Aceptar",
        cancelButtonText: "Descargar PDF",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#5cb85c",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/index/moneymanager/transactions", { state: { activeTab: "expenses" } });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          handleDownloadPDF(responseData.data);
          navigate("/index/moneymanager/transactions", { state: { activeTab: "expenses" } });
        }
      });
    } catch (error) {
      console.error("Error al guardar el egreso:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Hubo un error al procesar el egreso: ${error.message}`,
        confirmButtonColor: "#d33",
      });
    }
  };

  // Función para descargar el PDF
  const handleDownloadPDF = (expenseData) => {
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
      doc.text("FACTURA DE EGRESO", 105, 20, { align: "center" });

      // Company Info (customize as needed)
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Nombre de la Empresa", 14, 30);
      doc.text("NIT: 123456789-0", 14, 36);
      doc.text("Dirección: Calle 123 #45-67, Bogotá, Colombia", 14, 42);
      doc.text("Teléfono: +57 123 456 7890", 14, 48);

      // Invoice Info
      doc.text(`Fecha: ${formatDate(new Date(), "d MMMM yyyy", { locale: es })}`, 140, 30);
      doc.text(`Factura N°: ${facturaNumber || Math.floor(Math.random() * 1000000)}`, 140, 36);
      doc.text(`Factura Proveedor N°: ${facturaProvNumber || "N/A"}`, 140, 42);

      // Expense Data as a Single Entry
      const expenseDataForPDF = [
        {
          facturaNumber: facturaNumber || "N/A",
          description: description || "Sin descripción",
          date: date ? date.format("YYYY-MM-DD") : new Date().toISOString().split("T")[0],
          account_id: account,
          proveedor_id: proveedor,
          total_gross: expenseTableData.totals.totalBruto,
          discounts: expenseTableData.totals.descuentos,
          total_net: expenseTableData.totals.totalNeto,
        },
      ];

      const tableData = expenseDataForPDF.map(item => [
        item.facturaNumber,
        item.description,
        renderDate(date),
        getAccountName(item.account_id),
        getProviderName(item.proveedor_id),
        formatCurrency(item.total_gross),
        formatCurrency(item.discounts),
        formatCurrency(item.total_net),
      ]);

      autoTable(doc, {
        startY: 60,
        head: [["N° Factura", "Descripción", "Fecha", "Cuenta", "Proveedor", "Base", "Descuentos", "Total Neto"]],
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

      // Detailed Items Table
      if (expenseTableData.items.length > 0) {
        doc.setFontSize(12);
        doc.text("Detalles de los Ítems", 14, doc.lastAutoTable.finalY + 10);

        const itemsTableData = expenseTableData.items.map(item => [
          item.product || "N/A",
          item.description || "Sin descripción",
          item.quantity || 0,
          formatCurrency(item.unitPrice || 0),
          formatCurrency(item.discount || 0),
          formatCurrency(item.taxCharge || 0),
          formatCurrency(item.taxWithholding || 0),
          formatCurrency(item.total || 0),
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 20,
          head: [["Producto", "Descripción", "Cantidad", "Precio Unitario", "Descuento", "IVA", "Retención", "Total"]],
          body: itemsTableData,
          theme: "grid",
          styles: { fontSize: 10, cellPadding: 2 },
          headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 40 },
            2: { cellWidth: 15 },
            3: { cellWidth: 20 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 },
            6: { cellWidth: 20 },
            7: { cellWidth: 20 },
          },
        });
      }

      // Totals Summary
      doc.setFontSize(12);
      doc.text("Resumen de Totales", 14, doc.lastAutoTable.finalY + 10);
      doc.setFontSize(10);
      doc.text(`Total Bruto: ${formatCurrency(expenseTableData.totals.totalBruto)}`, 14, doc.lastAutoTable.finalY + 20);
      doc.text(`Descuentos: ${formatCurrency(expenseTableData.totals.descuentos)}`, 14, doc.lastAutoTable.finalY + 26);
      doc.text(`Subtotal: ${formatCurrency(expenseTableData.totals.subtotal)}`, 14, doc.lastAutoTable.finalY + 32);
      doc.text(`IVA (${expenseTableData.totals.ivaPercentage}%): ${formatCurrency(expenseTableData.totals.iva)}`, 14, doc.lastAutoTable.finalY + 38);
      doc.text(`Retención (${expenseTableData.totals.retencionPercentage}%): ${formatCurrency(expenseTableData.totals.retencion)}`, 14, doc.lastAutoTable.finalY + 44);
      doc.text(`Total Impuestos: ${formatCurrency(expenseTableData.totals.totalImpuestos)}`, 14, doc.lastAutoTable.finalY + 50);
      doc.text(`Total Neto: ${formatCurrency(expenseTableData.totals.totalNeto)}`, 14, doc.lastAutoTable.finalY + 56);

      // Comments (if any)
      if (comentarios) {
        doc.text("Observaciones:", 14, doc.lastAutoTable.finalY + 66);
        doc.text(comentarios, 14, doc.lastAutoTable.finalY + 72, { maxWidth: 180 });
      }

      // Footer
      doc.setFontSize(10);
      doc.text("Gracias por su negocio", 105, 280, { align: "center" });
      doc.text("Este documento no tiene validez fiscal", 105, 286, { align: "center" });

      // Save the PDF
      doc.save(`Factura_Egreso_${facturaNumber || "sin_numero"}_${formatDate(new Date(), "yyyy-MM-dd")}.pdf`);

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

  const renderCompraInputs = () => {
    return (
      <div className="p-4">
       <ComprobanteEgresoHeader
          facturaNumber={facturaNumber}
          setFacturaNumber={setFacturaNumber}
          facturaProvNumber={facturaProvNumber}
          setFacturaProvNumber={setFacturaProvNumber}
          facturaProvPrefix={facturaProvPrefix}
          setFacturaProvPrefix={setFacturaProvPrefix}
          description={description}
          setDescription={setDescription}
          tipo={tipo}
          setTipo={setTipo}
          date={date}
          setDate={setDate}
          proveedor={proveedor}
          handleProveedorChange={handleProveedorChange}
          handleCategoriaChange={handleCategoriaChange}
          proveedores={proveedores}
          categoria={categoria}
          setCategoria={setCategoria}
          categorias={categorias}
          isHiddenDetails={isHiddenDetails}
          onEtiquetaChange={setEtiqueta}
          etiqueta={etiqueta} // Pasar etiqueta explícitamente
        />
    
        <ProductsTable
          items={expenseTableData.items}
          onItemsChange={handleItemsChange}
          onTotalsChange={handleTotalsChange}
          onHiddenDetailsChange={handleHiddenDetailsChange}
          accounts={accounts}
          selectedAccount={account}
          onAccountSelect={(value) => setAccount(value)}
        />
      </div>
    );
  };

  
  const handleCancel = () => {
    navigate("/index/moneymanager/transactions", { state: { activeTab: returnTab } });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${apiUrl}/expenses/bulk-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Carga Exitosa",
        text: "Carga masiva completada exitosamente!",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al procesar la carga masiva.",
      });
      console.error("Error en la carga masiva:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto bg-white  ">
      <div className="sticky top-0 z-10 bg-white px-4 pt-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex px-2 rounded-md justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">COMPROBANTE DE EGRESO</h1>
            <p className="text-sm text-gray-500">Documento de control interno</p>
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
              type="default"
              icon={<UploadOutlined />}
              loading={loading}
              onClick={() => document.getElementById("bulkUploadInput").click()}
              className="bg-transparent border border-[#0052CC] text-[#0052CC] hover:bg-[#0052CC] hover:text-white"
              style={{ borderRadius: 2 }}
            >
              Cargar Egresos Masivos
            </Button>
          </div>
          <Button
            onClick={handleCancel}
            className="bg-transparent border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
            style={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} type="primary" className="bg-[#0052CC]" style={{ borderRadius: 2 }}>
            Aceptar
          </Button>
        </Space>
      </div>

      {renderCompraInputs()}

      <div className="space-y-4 p-6">
        <div className="mt-[-4em]">
          <Title level={4}>Observaciones</Title>
          <textarea
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            placeholder="Añade comentarios adicionales"
            rows={3}
            className="w-full border p-2"
          />

        </div>

        <VoucherSection
          onVoucherChange={setVoucher}
          initialVouchers={voucher}
          entryId={id}
          type="expense"
        />

      </div>

    </div>
  );
};

export default AddExpense;