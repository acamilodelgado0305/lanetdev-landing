import React, { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import AccountSelector from "../AccountSelector ";
import CategorySelector from "../CategorySelector";
import { DatePicker, Input, Button, Row, Col, Tabs, Card, Radio, Typography, Space, Checkbox, Divider, Select, Tooltip } from "antd";
import Swal from "sweetalert2";
import { uploadImage } from "../../../../../services/apiService";
import dayjs from "dayjs";
import { UploadOutlined, DownloadOutlined, FileTextOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ExpenseVoucherSection from "./ExpenseVoucherSection";
import NewExpenseTable from "./ProductsTable";
import { getCategorias } from "../../../../../services/moneymanager/moneyService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format as formatDate } from "date-fns";
import { es } from "date-fns/locale";

const apiUrl = import.meta.env.VITE_API_FINANZAS;
const { Title, Text } = Typography;

const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTab = location.state?.returnTab || "egresos";
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [voucher, setVoucher] = useState("");
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
  const [isExpenseSaved, setIsExpenseSaved] = useState(false);
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

  useEffect(() => {
    if (id) {
      fetchExpenseData();
    }
    fetchAccounts();
    fetchProveedores();
    ObtenerCategorias();
  }, [id]);

  const fetchExpenseData = async () => {
    try {
      const response = await fetch(`${apiUrl}/expenses/${id}`);
      if (!response.ok) throw new Error("No se pudo obtener la información del egreso");
      const data = await response.json();

      setAmount(data.amount?.toString() || "");
      setAccount(data.account_id?.toString() || "");
      setDescription(data.description || "");
      setComentarios(data.comentarios || "");
      setDate(data.date ? dayjs(data.date) : dayjs());
      setProveedor(data.proveedor || "");
      setCategoria(data.categoria || "");
      setFacturaNumber(data.facturaNumber || "");
      setFacturaProvNumber(data.facturaProvNumber || "");
      setTipo(data.tipo || "");
      setVoucher(data.voucher || "");

      if (data.expense_items && data.expense_totals) {
        setExpenseTableData({
          items: data.expense_items.map(item => ({
            type: item.type,
            categoria: item.categoria,
            product: item.product,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            discount: item.discount,
            taxCharge: item.tax_charge,
            taxWithholding: item.tax_withholding,
            total: item.total,
          })),
          totals: {
            totalBruto: data.expense_totals.total_bruto,
            descuentos: data.expense_totals.descuentos,
            subtotal: data.expense_totals.subtotal,
            iva: data.expense_totals.iva,
            retencion: data.expense_totals.retencion,
            totalNeto: data.expense_totals.total_neto,
            ivaPercentage: data.expense_totals.iva_percentage,
            retencionPercentage: data.expense_totals.retencion_percentage,
            totalImpuestos: data.expense_totals.total_impuestos,
          },
        });
      }
    } catch (error) {
      console.error("Error al obtener los datos del egreso:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo cargar la información del egreso. " + error.message,
      });
    }
  };

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
      setCategorias(data);
    } catch (err) {
      console.error("Error al cargar las categorías:", err);
    }
  };

  const handleProveedorChange = (value) => {
    setProveedor(value);
  };

  const handleHiddenDetailsChange = (value) => {
    setIsHiddenDetails(value);
  };

  const handleExpenseTableDataChange = (data) => {
    const validItems = data.items.filter(item =>
      item.product !== "" ||
      item.description !== "" ||
      item.unitPrice > 0 ||
      item.quantity > 0
    );
    setExpenseTableData({
      items: validItems,
      totals: data.totals,
    });
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
        account_id: parseInt(account),
        voucher: voucher,
        description: description,
        comentarios: comentarios,
        estado: true,
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
            type: item.type,
            categoria: item.categoria,
            product: item.product,
            description: item.description,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unitPrice),
            discount: parseFloat(item.discount),
            tax_charge: parseFloat(item.taxCharge),
            tax_withholding: parseFloat(item.taxWithholding),
            total: parseFloat(item.total),
          })),
        expense_totals: {
          total_bruto: expenseTableData.totals.totalBruto,
          descuentos: expenseTableData.totals.descuentos,
          subtotal: expenseTableData.totals.subtotal,
          iva: expenseTableData.totals.iva,
          retencion: expenseTableData.totals.retencion,
          total_neto: expenseTableData.totals.totalNeto,
          iva_percentage: expenseTableData.totals.ivaPercentage,
          retencion_percentage: expenseTableData.totals.retencionPercentage,
          total_impuestos: expenseTableData.totals.totalImpuestos,
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

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      await response.json();
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
          handleDownloadPDF();
          navigate("/index/moneymanager/transactions", { state: { activeTab: "expenses" } });
        }
      });
    } catch (error) {
      console.error("Error al guardar el egreso:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al procesar el egreso. Por favor, intente de nuevo.",
        confirmButtonColor: "#d33",
      });
    }
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
      const expenseData = [
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

      const tableData = expenseData.map(item => [
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
        {renderInvoiceHeader()}
        <Divider />
        <NewExpenseTable
          onHiddenDetailsChange={handleHiddenDetailsChange}
          onDataChange={handleExpenseTableDataChange}
        />
      </div>
    );
  };

  const renderInvoiceHeader = () => (
    <div className="border-b-2 border-gray-200 pb-6 mb-6">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Title level={2} className="text-gray-800 font-bold">
            COMPROBANTE DE EGRESO
          </Title>
        </Col>
        <Col>
          <div className="text-right">
            <Text className="text-gray-600 block">No.</Text>
            <Input
              value={facturaNumber}
              onChange={(e) => setFacturaNumber(e.target.value)}
              placeholder="No. de Factura"
              className="w-32 border-gray-300 rounded-md"
            />
          </div>
          <div className="text-right mt-2">
            <Text className="text-gray-600 block">No. Factura Proveedor</Text>
            <Input
              value={facturaProvNumber}
              onChange={(e) => setFacturaProvNumber(e.target.value)}
              placeholder="No. Proveedor"
              className="w-32 border-gray-300 rounded-md"
            />
          </div>
        </Col>
      </Row>

      <Divider className="my-4" />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <div className="mb-4">
            <Text className="text-gray-600 block mb-1">Título</Text>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade un título descriptivo"
              className="w-full border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <Text className="text-gray-600 block mb-1">Tipo</Text>
            <Select
              value={tipo}
              onChange={(value) => setTipo(value)}
              className="w-full"
              placeholder="Selecciona un Tipo"
            >
              <Select.Option value="Legal">Legal</Select.Option>
              <Select.Option value="Diverso">Diverso</Select.Option>
            </Select>
          </div>
        </Col>

        <Col xs={24} md={12}>
          <div className="mb-4">
            <Text className="text-gray-600 block mb-1">Fecha de Elaboración</Text>
            <DatePicker
              value={date}
              onChange={(value) => setDate(value)}
              format="DD/MM/YYYY"
              placeholder="Selecciona una fecha"
              className="w-full border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <Text className="text-gray-600 block mb-1">Proveedor</Text>
            <Select
              value={proveedor}
              onChange={handleProveedorChange}
              className="w-full"
              placeholder="Selecciona un proveedor"
            >
              {Array.isArray(proveedores) &&
                proveedores.map((provider) => (
                  <Select.Option key={provider.id} value={provider.id}>
                    {provider.nombre_comercial}
                  </Select.Option>
                ))}
            </Select>
          </div>
          {!isHiddenDetails && (
            <div className="mb-4">
              <Text className="text-gray-600 block mb-1">Categoría</Text>
              <Select
                value={categoria}
                onChange={(value) => setCategoria(value)}
                className="w-full"
                placeholder="Selecciona una categoría"
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <Divider style={{ margin: "8px 0" }} />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "8px",
                        cursor: "pointer",
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        console.log("Redirigiendo a crear categoría...");
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Nueva Categoría
                      </Text>
                    </div>
                  </div>
                )}
              >
                {Array.isArray(categorias) &&
                  categorias.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
              </Select>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );

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
    <div className="p-6 max-w-[1200px] mx-auto bg-white shadow">
      <div className="sticky top-0 z-10 bg-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#0052CC] p-2">
            <FileTextOutlined className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#0052CC] text-sm">Egresos /</span>
            <Title level={3}>{id ? "Editar" : "Nuevo"}</Title>
          </div>
        </div>
        <Space>
          <Button
            disabled={!isExpenseSaved}
            onClick={handleDownloadPDF}
            className="bg-transparent border border-[#0052CC] text-[#0052CC] hover:bg-[#0052CC] hover:text-white"
            style={{ borderRadius: 2 }}
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

      <div className="space-y-4 mb-8">
        <AccountSelector
          selectedAccount={account}
          onAccountSelect={(value) => setAccount(value)}
          accounts={accounts}
        />
      </div>

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
      <ExpenseVoucherSection
        onVoucherChange={setVoucher}
        initialVouchers={voucher ? JSON.parse(voucher) : []}
        entryId={id}
      />
    </div>
  );
};

export default AddExpense;