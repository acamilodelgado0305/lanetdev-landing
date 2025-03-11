import React, { useState, useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import AccountSelector from "../AccountSelector ";
import CategorySelector from '../CategorySelector';
import { DatePicker, Input, Button, Row, Col, Tabs, Card, Radio, Typography, Space, Checkbox, Divider, Select, Tooltip } from "antd";
import Swal from "sweetalert2";
import { uploadImage } from "../../../../../services/apiService";
import dayjs from "dayjs";
import { UploadOutlined, DownloadOutlined, FileTextOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
const apiUrl = import.meta.env.VITE_API_FINANZAS;
import ExpenseVoucherSection from "./ExpenseVoucherSection";
import { useParams, useLocation } from 'react-router-dom'; //
import NewExpenseTable from "./ProductsTable";
import { getCategorias } from "../../../../../services/moneymanager/moneyService";

const { Title, Text } = Typography;


const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTab = location.state?.returnTab || 'egresos';
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("");
  const [voucher, setVoucher] = useState("");
  const [description, setDescription] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [tipo, setTipo] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [date, setDate] = useState(dayjs());
  const [proveedores, setProveedores] = useState("");
  const [loading, setLoading] = useState(false);
  const [proveedor, setProveedor] = useState("");
  const [categoria, setcategoria] = useState("");
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
      iva: 0, // Cambiado de reteIVA a iva
      retencion: 0, // Cambiado de reteICA a retencion
      totalNeto: 0,
      ivaPercentage: "0", // Cambiado de reteIVAPercentage a ivaPercentage
      retencionPercentage: "0", // Cambiado de reteICAPercentage a retencionPercentage
      totalImpuestos: 0 // Nuevo campo para totalImpuestos
    }
  });

  const handleHiddenDetailsChange = (value) => {
    setIsHiddenDetails(value); // Update state when hiddenDetails changes in ProductsTable
  };

  // En AddExpense, actualiza o añade esta función:
  const handleExpenseTableDataChange = (data) => {
    // Solo actualiza el estado si hay items válidos (con datos)
    const validItems = data.items.filter(item =>
      item.product !== '' ||
      item.description !== '' ||
      item.unitPrice > 0 ||
      item.quantity > 0
    );
  
    setExpenseTableData({
      items: validItems,
      totals: data.totals // Aquí se incluye totalImpuestos
    });
  };


  const printRef = useRef();

  const handleCancel = () => {
    navigate('/index/moneymanager/transactions', { state: { activeTab: returnTab } });
  };

  useEffect(() => {
    if (id) {
      fetchExpenseData();
    }
  }, [id]);


  //------------USE EFECTS--------------------------

  useEffect(() => {

    fetchAccounts();
    fetchProveedores();
    ObtenerCategorias();

  }, []);

  const ObtenerCategorias = async () => {
    try {
      const data = await getCategorias();
      setCategorias(data); // Almacena las categorías en el estado
    } catch (err) {
      console.error("Error al cargar las categorías:", err);
    }
  };


  //---------------------------FETCH---------------------------//




  const fetchProveedores = async () => {
    try {
      const response = await fetch(`${apiUrl}/providers`);
      const data = await response.json();
      // Filtrar las cuentas, excluyendo los préstamos
      setProveedores(data);
    } catch (error) {
      console.error("Error al obtener las cuentas:", error);
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

  const handleProveedorChange = (value) => {
    setProveedor(value); // Actualiza el estado con el ID del proveedor seleccionado
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

    return (
      <div className="p-4" ref={printRef}>
        {renderInvoiceHeader()}
        <Divider />

        <NewExpenseTable
          onHiddenDetailsChange={handleHiddenDetailsChange}
          onDataChange={handleExpenseTableDataChange} // Añade esta línea
        />
      </div>
    );


  };

  //--------------------------FUNCIONES
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
        user_id: parseInt(sessionStorage.getItem('userId')),
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
  
      let requestBody;
  
      requestBody = {
        ...baseRequestBody,
        // Solo incluye items que tengan datos
        expense_items: expenseTableData.items
          .filter(item =>
            item.product !== '' ||
            item.description !== '' ||
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
            total: parseFloat(item.total)
          })),
        expense_totals: {
          total_bruto: expenseTableData.totals.totalBruto,
          descuentos: expenseTableData.totals.descuentos,
          subtotal: expenseTableData.totals.subtotal,
          iva: expenseTableData.totals.iva, // Mapeado desde reteIVA
          retencion: expenseTableData.totals.retencion, // Mapeado desde reteICA
          total_neto: expenseTableData.totals.totalNeto,
          iva_percentage: expenseTableData.totals.ivaPercentage, // Mapeado desde reteIVAPercentage
          retencion_percentage: expenseTableData.totals.retencionPercentage, // Mapeado desde reteICAPercentage
          total_impuestos: expenseTableData.totals.totalImpuestos // Nuevo campo para totalImpuestos
        }
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      await response.json();
      setIsExpenseSaved(true);
  
      Swal.fire({
        icon: "success",
        title: id ? "Egreso Actualizado" : "Egreso Registrado",
        text: id ? "El Egreso se ha actualizado correctamente" : "El Egreso se ha registrado correctamente",
        confirmButtonColor: "#3085d6",
      });
  
      navigate('/index/moneymanager/transactions', {
        state: { activeTab: 'expenses' }
      });
    } catch (error) {
      console.error("Error al guardar el Egreso:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al procesar el Egreso. Por favor, intente de nuevo.",
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
      const response = await axios.post(`${apiUrl}/expenses/bulk-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Carga masiva completada exitosamente!");
      if (onTransactionAdded) onTransactionAdded(); // Recargar la lista de Egresos
    } catch (error) {
      message.error("Error al procesar la carga masiva.");
      console.error("Error en la carga masiva:", error);
    } finally {
      setLoading(false);
    }
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
          {!isHiddenDetails && ( // Conditionally render Categoría field
            <div className="mb-4">
              <Text className="text-gray-600 block mb-1">Categoría</Text>
              <Select
                value={categoria}
                onChange={(value) => setcategoria(value)}
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
                  categorias.map((categoria) => (
                    <Select.Option key={categoria.id} value={categoria.id}>
                      {categoria.name}
                    </Select.Option>
                  ))}
              </Select>
            </div>
          )}
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
      pdf.save(`egreso_${egresoNumber || 'sin_numero'}.pdf`);

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

  return (
    <div className="p-6 max-w-[1200px] mx-auto bg-white shadow">
      <div className="sticky top-0 z-10 bg-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#0052CC] p-2">
            <FileTextOutlined className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#0052CC] text-sm">Egresos /</span>
            <Title level={3}>
              {id ? 'Editar' : 'Nuevo'}
            </Title>
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