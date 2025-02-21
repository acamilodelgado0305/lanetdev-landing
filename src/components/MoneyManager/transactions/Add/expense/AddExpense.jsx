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
import VoucherSection from "../../components/VoucherSection";
import { useParams } from 'react-router-dom'; //
import NewExpenseTable from "./ExpenseTable";

const { Title, Text } = Typography;


const AddExpense = () => {
  const { id } = useParams(); // Obtener el ID de la URL
  const navigate = useNavigate();
  // Inicializa el hook useNavigaten
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [voucher, setVoucher] = useState("");
  const [description, setDescription] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [categories, setCategories] = useState([]);
  const [cashiers, setCashiers] = useState([]);

  const [accounts, setAccounts] = useState([]);
  const [date, setDate] = useState(dayjs());



  const [loading, setLoading] = useState(false);
  const [isCompraCheckend, setisCompraCheckend] = useState(false);
  const [isVentaChecked, setIsVentaChecked] = useState(false);


  const [proveedor, setproveedor] = useState("");
  const [facturaNumber, setFacturaNumber] = useState("");
  const [facturaProvNumber, setFacturaProvNumber] = useState("");

 

  const [isExpenseSaved, setIsExpenseSaved] = useState(false);
  const [hasPercentageDiscount, setHasPercentageDiscount] = useState(false);

  const [expenseTableData, setExpenseTableData] = useState({
    items: [],
    totals: {
      totalBruto: 0,
      descuentos: 0,
      subtotal: 0,
      reteIVA: 0,
      reteICA: 0,
      totalNeto: 0,
      reteIVAPercentage: "0",
      reteICAPercentage: "0"
    }
  });

  const handleExpenseTableDataChange = (data) => {
    setExpenseTableData(data);
  };


  const printRef = useRef();

  const handleCancel = () => {
    navigate(-1); // Navega hacia atrás en la historia del navegador
  };


  useEffect(() => {
    if (id) {
      fetchExpenseData();
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
        <div className="p-4   " ref={printRef}>
          {renderInvoiceHeader()}
          <Divider />
          <NewExpenseTable

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

      // Calculate total amount including expense table data
      const totalAmount = isCompraCheckend
        ? expenseTableData.totals.totalNeto // Use the total from expense table for purchases
        : parseFloat(amount);

      const baseRequestBody = {
        user_id: parseInt(sessionStorage.getItem('userId')),
        account_id: parseInt(account),
        category_id: parseInt(category),
        type: isCompraCheckend ? "compra" : "income",
        date: date.format("YYYY-MM-DD[T]HH:mm:ss[Z]"),
        voucher: voucher,
        description: description,
        comentarios: comentarios,
        estado: true,
        amount: totalAmount
      };

      let requestBody;
      if (isCompraCheckend) {
        requestBody = {
          ...baseRequestBody,
          // Include expense table data
          expense_items: expenseTableData.items.map(item => ({
            type: item.type,
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
            rete_iva: expenseTableData.totals.reteIVA,
            rete_ica: expenseTableData.totals.reteICA,
            total_neto: expenseTableData.totals.totalNeto,
            rete_iva_percentage: expenseTableData.totals.reteIVAPercentage,
            rete_ica_percentage: expenseTableData.totals.reteICAPercentage
          },
         
          facturaNumber: parseInt(facturaNumber),
          facturaProvNumber: parseInt(facturaProvNumber),
          
        };
      } else {
        requestBody = baseRequestBody;
      }

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
        title: id ? "Ingreso Actualizado" : "Ingreso Registrado",
        text: id ? "El ingreso se ha actualizado correctamente" : "El ingreso se ha registrado correctamente",
        confirmButtonColor: "#3085d6",
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
          <h1 className="text-3xl font-semibold text-[#007072] mb-4">Nueva Factura de Egreso</h1>

          <div className="flex items-center justify-end space-x-4">
            <span className="text-gray-600">Tipo:</span>
            <Select
              value={proveedor}
              onChange={(value, option) => {
                setproveedor(value);
                // Actualizar la comisión basada en el cajero seleccionado
                const selectedCashier = cashiers.find(c => c.nombre === value);
                if (selectedCashier) {
                  // Guardar el porcentaje de comisión del cajero seleccionado
                  setCommissionPorcentaje(parseFloat(selectedCashier.comision_porcentaje));
                }
              }}
              className="w-64"
              placeholder="Selecciona un Tipó"
            >
              <option value="Legal">Legal</option>
              <option value="Diverso">Diverso</option>


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
                value={proveedor}
                onChange={(value, option) => {
                  setproveedor(value);
                  // Actualizar la comisión basada en el cajero seleccionado
                  const selectedCashier = cashiers.find(c => c.nombre === value);
                  if (selectedCashier) {
                    
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
                value={proveedor}
                onChange={(value, option) => {
                  setproveedor(value);
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
        <div className="text-right space-y-4">
          {/* Campo para el número de factura */}
          <div className="flex items-center justify-end space-x-4">
            <span className="text-gray-600 whitespace-nowrap">No.</span>
            <input
              value={facturaNumber}
              onChange={(e) => setFacturaNumber(e.target.value)}
              placeholder="No. de Factura"
              className="w-32" // Ajusta el ancho del campo
              style={{ maxWidth: '120px' }} // Opcional: limita el ancho máximo
            />
          </div>

          {/* Campo para el número de factura del proveedor */}
          <div className="flex items-center justify-end space-x-4">
            <span className="text-gray-600 whitespace-nowrap">No. Factura Proveedor</span>
            <input
              value={facturaProvNumber}
              onChange={(e) => setFacturaProvNumber(e.target.value)}
              placeholder="No. Proveedor"
              className="w-28" // Ajusta el ancho del campo
              style={{ maxWidth: '100px' }} // Opcional: limita el ancho máximo
            />
          </div>
        </div>

      </div>

      <Row gutter={16} align="large">
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




  const handleCheckboxChange = (checkedValues) => {
    const isCompraSelected = checkedValues.includes('compra');
    const isVentaSelected = checkedValues.includes('venta');


    setisCompraCheckend(isCompraSelected);
    setIsVentaChecked(isVentaSelected && !isCompraSelected);

    // Resetear la categoría cuando cambia el tipo de ingreso
    setCategory('');
  };


  return (
    <div className="p-6 max-w-[1200px] mx-auto bg-white shadow">
      <div className="sticky top-0 z-10 bg-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#007072] p-2 ">
            <FileTextOutlined className=" text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#007072] text-sm">Egresos /</span>
            <Title level={3}>
              {id ? 'Editar' : 'Nuevo'}
            </Title>
          </div>
        </div>
        <Space>

          <Button
            disabled={!isExpenseSaved} // Deshabilitar el botón si el ingreso no ha sido guardado
            onClick={handleDownloadPDF}
            className="bg-transparent border border-[#007072] text-[#007072] hover:bg-[#007072] hover:text-white"
            style={{ borderRadius: 0 }} // Eliminar redondez de los bordes
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
              type="default" // Cambia a "default" para evitar estilos predeterminados de Ant Design
              icon={<UploadOutlined />}
              loading={loading}
              onClick={() => document.getElementById("bulkUploadInput").click()}
              className="bg-transparent border border-[#007072] text-[#007072] hover:bg-[#007072] hover:text-white"
              style={{ borderRadius: 0 }} // Eliminar redondez de los bordes
            >
              Cargar Ingresos Masivos
            </Button>
          </div>
          <Button
            onClick={handleCancel}

            className="bg-transparent border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
            style={{ borderRadius: 0 }} // Eliminar redondez de los bordes
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} type="primary" className="bg-[#007072]" style={{ borderRadius: 0 }}>
            Aceptar
          </Button>
        </Space>
      </div>

      <div bordered={false} className="mt-6">
        <Radio.Group
          value={isCompraCheckend ? 'compra' : isVentaChecked ? 'venta' : null}
          onChange={(e) => handleCheckboxChange([e.target.value])}
          className="mb-6"
        >
          <Radio value="compra">Compra</Radio>
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