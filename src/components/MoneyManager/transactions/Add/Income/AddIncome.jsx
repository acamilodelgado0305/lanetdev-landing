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

const apiUrl = import.meta.env.VITE_API_FINANZAS;

const { Title, Text } = Typography;


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
  const renderArqueoInputs = (isArqueoChecked) => {
    if (isArqueoChecked) {

      const calculateTotalAmount = () => {
        const fev = parseFloat(fevAmount) || 0;
        const diverso = parseFloat(diversoAmount) || 0;
        const otros = parseFloat(otherIncome) || 0;
        return fev + diverso + otros;
      };


      // Calcular el importe total
      const totalAmount = calculateTotalAmount();

      // Verificar si el dinero recibido en efectivo coincide con el importe total
      const cashReceivedValue = parseFloat(cashReceived) || 0;
      const isCashMatch = cashReceivedValue === totalAmount;

      // Calcular la comisión del cajero (2% del importe total)
      const commission = totalAmount * 0.02;
      return (
        <div className="space-y-4 mt-2">

          <div className="flex items-center space-x-6">
            <div className="w-full font-medium text-gray-700 text-sm">Periodo de Arqueo</div>
            <div className="flex space-x-2">
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

          <div className="flex items-center space-x-6">
            <div className="w-full font-medium text-gray-700 text-sm">Cajero</div>
            <div>
              <select
                className="w-45 text-sm py-1 px-2 border border-gray-300 rounded"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
              >
                <option value="">Seleccione un cajero</option>
                <option value="cajero1">Seg-Rafael Urdaneta</option>
                <option value="cajero2">Seg-Ragonvalia Oficina</option>
                <option value="cajero3">Seg-Ragonvalia Casa</option>
                <option value="cajero3">Seg-AsoFranco</option>
                <option value="cajero3">Seg-Bancolombia Rocely</option>
                <option value="cajero3">Seg-Bancolombia LANET</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="w-full font-medium text-gray700 text-sm">Numero de Arqueo</div>
            <div>
              <Input
                value={arqueoNumber}
                onChange={(e) => setArqueoNumber(e.target.value)}
                prefix="#"
                size="small"
                className="w-32 text-lg px-2 text-blue-700"
                placeholder="Número de Arqueo"
              />
            </div>
          </div>
          <div className="space-y-4">
            {/* Campo Importe FEV */}
            <div className="flex items-center space-x-6">
              <div className="w-full font-medium text-gray-700 text-sm">Importe FEV</div>
              <div>
                <Input
                  value={formatCurrency(fevAmount)} // Mostrar el valor formateado
                  onChange={(e) => handleAmountChange(e, 'fev')} // Manejar cambios
                  size="small"
                  className="w-32 text-lg px-2"
                  placeholder="Ingrese importe"
                />
              </div>
            </div>

            {/* Campo Importe Diverso */}
            <div className="flex items-center space-x-6">
              <div className="w-full font-medium text-gray-700 text-sm">Importe Diverso</div>
              <div>
                <Input
                  value={formatCurrency(diversoAmount)} // Mostrar el valor formateado
                  onChange={(e) => handleAmountChange(e, 'diverso')} // Manejar cambios
                  size="small"
                  className="w-32 text-lg px-2"
                  placeholder="Ingrese importe"
                />
              </div>
            </div>

            {/* Campo Otros Ingresos */}
            <div className="flex items-center space-x-6">
              <div className="w-full font-medium text-gray-700 text-sm">Otros Ingresos</div>
              <div>
                <Input
                  value={formatCurrency(otherIncome)} // Mostrar el valor sin formato
                  onChange={(e) => handleAmountChange(e, 'other_incomes')} // Manejar cambios directamente
                  size="small"
                  className="w-32 text-lg px-2"
                  placeholder="Otros ingresos"
                />
              </div>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500 border-t border-dashed border-gray-400 pt-2"></div>

          <div className="flex justify-between space-x-6">
            {/* Importe Total */}


            {/* Dinero recibido en Efectivo */}
            <div className="flex flex-col items-center">
              <div className="font-medium text-gray-700 text-sm">Dinero recibido en Efectivo</div>
              <Input
                value={formatCurrency(cashReceived)}
                onChange={(e) => handleAmountChange(e, 'cashReceived')}
                size="small"
                className="w-40 text-lg px-2"
                placeholder="Dinero recibido"
              />
            </div>

            <div className="flex flex-col items-center">
              <div className="font-medium text-gray-700 text-sm">Importe Total</div>
              <Input
                value={formatCurrency(totalAmount)} // Mostrar el total calculado con 2 decimales

                size="small"
                className="w-40 text-lg px-2 bg-green-100 text-green-700 font-semibold border-none cursor-not-allowed"
                placeholder="Total calculado"
              />
            </div>
          </div>

          {/* Mensaje de coincidencia */}
          {isCashMatch ? (
            <div className="text-center text-green-600 font-semibold">
              Los valores coinciden.
            </div>
          ) : (
            <div className="text-center text-red-600 font-semibold">
              Ups, ha ocurrido un descuadre al momento de realizar el arqueo.
            </div>
          )}
          <div className="flex items-center space-x-6">
            <div className="w-full font-medium text-gray-700 text-sm">Comision del Cajero</div>
            <div>
              <Input
                value={formatCurrency(commission)} // Mostrar la comisión con 2 decimales
                disabled
                size="small"
                className="w-40 text-lg px-2 bg-white-50"
                placeholder="Comisión"
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };


  const renderVentaInputs = (isVentaChecked) => {

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Importe*
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

    return null;
  };

  const handleCheckboxChange = (checkedValues) => {
    setIsArqueoChecked(checkedValues.includes('arqueo'));
    setCategory(''); // Reset category when checkbox changes
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white shadow-lg w-full max-w-4xl p-6 relative self-start overflow-y-auto max-h-full">


        {/* Encabezado */}
        <div className="flex justify-between items-center mb-3">
          <Title level={3} className="mb-0">
            Crear un Ingreso
          </Title>
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

            <Button onClick={onClose} type="default" className="border-gray-300 text-gray-600">
              Cancelar
            </Button>
            <Button onClick={handleSave} type="primary" className="bg-green-500 text-white">
              Guardar
            </Button>


          </Space>
        </div>
        <Card
          className="mb-6"
          bordered={false}

        >

          <div className="flex justify-between items-start mb-4">
            {/* Descripción a la izquierda */}
            <div className="w-2/3">
              <label className="block text-sm font-medium text-gray-700">Descripción*</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Añade una descripción"
                rows={1}
                className="w-[20em] border  p-1"
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
          <Title level={5}>Tipo de Ingreso</Title>
          <Space direction="vertical" className="w-full flex justify-center">
            <Checkbox.Group
              className="w-full"
              onChange={handleCheckboxChange}
            >
              <Row gutter={[24, 16]} justify="center">
                <Col span={8} className="flex justify-center">
                  <Checkbox value="venta">
                    <div className="font-medium">Venta</div>
                  </Checkbox>
                </Col>
                <Col span={8} className="flex justify-center">
                  <Checkbox value="arqueo">
                    <div className="font-medium">Arqueo</div>
                  </Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Space>
        </Card>

        <Card
          className="mb-6"
          bordered={false}>

          {renderArqueoInputs(isArqueoChecked)}
          {renderVentaInputs(!isVentaChecked)}

        </Card>

        <div className="mt-6 text-center text-sm text-gray-500 border-t border-dashed border-gray-400 pt-2"></div>

        <Card
          className="mb-6"
          bordered={false}>
          <div className="mb-6">
            <AccountSelector

              value={account}
              onChange={(value) => setAccount(value)}
              accounts={accounts}
            />
          </div>

          <div className="mb-4">
            <CategorySelector
              value={category}
              onChange={(value) => setCategory(value)}
              categories={categories}
            />

          </div>

        </Card>

        {/* Cuerpo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna Izquierda: Detalles Básicos */}
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700">Comprobantes</label>
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                className="w-full border rounded-md p-2"
              />
              {isUploading && <p className="text-sm text-gray-500">Subiendo imágenes...</p>}
              {imageUrls.length > 0 && (
                <div className="mt-2 space-y-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt={`Comprobante ${index}`} className="w-full h-24 object-cover rounded-md" />
                      <button
                        onClick={() => {
                          setImageUrls((urls) => urls.filter((_, i) => i !== index));
                          setVoucher((voucher) => voucher.replace(url, "").trim());
                        }}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center"
                      >
                        <CloseOutlined />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500 border-t border-dashed border-gray-400 pt-2"></div></div>
    </div>
  );
};

export default AddIncome;