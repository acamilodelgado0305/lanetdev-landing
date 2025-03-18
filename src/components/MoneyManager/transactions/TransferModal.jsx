import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  DatePicker,
  Button,
  Divider,
  Typography,
  message,
  Space,
  Tag,
  Descriptions,
  Tooltip,
} from "antd";
import {
  DollarCircleOutlined,
  SwapOutlined,
  FileImageOutlined,
  CloseOutlined,
  LeftOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  FormOutlined,
  BankOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AccountSelector from "./Add/AccountSelector";
import ImageUploader from "./Add/ImageUploader";

// Extender dayjs con los plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;
const { TextArea } = Input;

const TransferModal = ({
  isOpen,
  onClose,
  onTransactionAdded,
  transactionToEdit,
}) => {
  const apiUrl = import.meta.env.VITE_API_FINANZAS;
  const [form] = Form.useForm();

  // Estado
  const [accounts, setAccounts] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [vouchers, setVouchers] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(""); 
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (transactionToEdit) {
      setIsEditing(!!transactionToEdit.isEditing);
      setVouchers(transactionToEdit.vouchers || null);
      setImageUrls(
        Array.isArray(transactionToEdit.vouchers) ? transactionToEdit.vouchers : []
      );

      const amount = transactionToEdit.amount ? parseFloat(transactionToEdit.amount) : undefined;
      form.setFieldsValue({
        fromAccount: transactionToEdit.fromAccountId || undefined,
        toAccount: transactionToEdit.toAccountId || undefined,
        amount: amount, // Valor numérico
        description: transactionToEdit.description || "",
        date: transactionToEdit.date ? dayjs(transactionToEdit.date) : dayjs(),
      });
      // Actualizar el valor formateado para la visualización
    
    } else {
      resetForm();
    }
  }, [transactionToEdit, form]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${apiUrl}/accounts`);
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error("Error al obtener las cuentas:", error);
      message.error("No se pudieron cargar las cuentas");
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Función para parsear el valor formateado y devolver el número sin formato
  const parseCurrency = (value) => {
    if (!value) return undefined;
    // Eliminar símbolos de moneda, puntos y otros caracteres no numéricos
    const cleanedValue = value.replace(/[^\d]/g, "");
    return cleanedValue ? parseFloat(cleanedValue) : undefined;
  };

  const handleAmountChange = (e, field) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;

    if (field === "amount") setAmount(numericValue);
 
  };




  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const localDate = dayjs(values.date)
        .set("hour", dayjs().hour())
        .set("minute", dayjs().minute())
        .set("second", 0)
        .format("YYYY-MM-DDTHH:mm:ss");

      // Asegurarse de que fromAccount y toAccount sean números enteros
    

      const data = {
        userId: 1, // TODO: Obtener dinámicamente el userId (por ejemplo, desde un contexto de autenticación)
        fromAccount: parseInt(fromAccount),
        toAccount: parseInt(toAccount),
        amount: parseFloat(amount) || 0,
        date: localDate,
        vouchers: imageUrls.length > 0 ? imageUrls : [], // Asegurarse de enviar un array vacío si no hay vouchers
        description: values.description || "", // Asegurarse de enviar una cadena vacía si no hay descripción
      };

      const endpoint = `${apiUrl}/transfers${isEditing ? `/${transactionToEdit.id}` : ""}`;
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: isEditing ? "Transferencia actualizada" : "Transferencia realizada",
          text: isEditing
            ? "La transferencia se ha actualizado correctamente."
            : "La transferencia se ha realizado correctamente.",
          confirmButtonColor: "#0052CC",
        });
        resetForm();
        onClose();
        onTransactionAdded();
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.error || (isEditing ? "Error al actualizar la transferencia" : "Error al realizar la transferencia")
        );
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Por favor complete todos los campos requeridos");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          confirmButtonColor: "#DE350B",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setImageUrls([]);
    setVouchers(null);
    setIsEditing(false);
 // Limpiar el valor formateado
  };

  // Obtener valores dinámicos para el resumen
  

  return (
    <Drawer
      title={
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm">
              <>NUEVO COMPROBANTE DE TRANSFERENCIA</>
            </div>
          </div>
          <div className="flex space-x-2">
            <Tooltip title="Compartir">
              <Button
                icon={<ShareAltOutlined />}
                className="border border-gray-300 text-gray-600 hover:text-blue-700 hover:border-blue-700"
                type="text"
                disabled
              />
            </Tooltip>

            <Tooltip title="Cerrar">
              <Button
                onClick={onClose}
                icon={<CloseOutlined />}
                className="border border-gray-300 text-gray-600 hover:text-blue-700 hover:border-blue-700"
                type="text"
              />
            </Tooltip>
          </div>
        </div>
      }
      placement="right"
      width={600}
      onClose={onClose}
      open={isOpen}
      closable={false}
      headerStyle={{ padding: 0, borderBottom: "none" }}
      bodyStyle={{
        padding: "24px",
        background: "#F9FAFB",
        height: "calc(100% - 120px)",
        overflow: "auto",
      }}
      footerStyle={{
        padding: "16px 24px",
        borderTop: "1px solid #DFE1E6",
        background: "#FFFFFF",
      }}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
          <Button
            onClick={onClose}
            style={{
              borderRadius: "4px",
              borderColor: "#DFE1E6",
              color: "#172B4D",
            }}
          >
            Cancelar
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            loading={loading}
            style={{
              background: "#0052CC",
              borderColor: "#0052CC",
              borderRadius: "4px",
              boxShadow: "0 2px 4px rgba(0, 82, 204, 0.2)",
            }}
          >
            {isEditing ? "Actualizar Transferencia" : "Confirmar Transferencia"}
          </Button>
        </div>
      }
      maskStyle={{ background: "rgba(9, 30, 66, 0.54)" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ date: dayjs() }}
          style={{ width: "100%" }}
        >
          {/* Sección de Detalles */}
          <div
            style={{
              background: "#FFFFFF",
              padding: "16px",
              borderRadius: "4px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Text
              strong
              style={{
                fontSize: "14px",
                color: "#172B4D",
                textTransform: "uppercase",
                marginBottom: "16px",
                display: "block",
              }}
            >
              <InfoCircleOutlined style={{ marginRight: "8px", color: "#0052CC" }} />
              Detalles de la Transferencia
            </Text>
            <Form.Item
              name="date"
              label="Fecha"
              rules={[{ required: true, message: "Seleccione la fecha de la transferencia" }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                style={{ width: "100%", borderRadius: "4px" }}
                prefix={<CalendarOutlined />}
                placeholder="Seleccione fecha"
              />
            </Form.Item>
            <div className="flex justify-between">
                    <span>Importe:</span>
                    <Input
                      value={formatCurrency(amount)}
                      onChange={(e) => handleAmountChange(e, "amount")}
                      className="w-40"
                    />
                  </div>
            <Form.Item name="description" label="Descripción">
              <TextArea
                placeholder="Ingrese una descripción (ej. Transferencia por pago de factura #123)"
                autoSize={{ minRows: 3, maxRows: 5 }}
                style={{ borderRadius: "4px" }}
              />
            </Form.Item>
          </div>

          {/* Sección de Cuentas */}
          <div
            style={{
              background: "#FFFFFF",
              padding: "16px",
              borderRadius: "4px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Text
              strong
              style={{
                fontSize: "14px",
                color: "#172B4D",
                textTransform: "uppercase",
                marginBottom: "16px",
                display: "block",
              }}
            >
              <SwapOutlined style={{ marginRight: "8px", color: "#0052CC" }} />
              Movimiento entre Cuentas
            </Text>
            <div
              name="fromAccount"
             
             
            >
              <AccountSelector
                selectedAccount={fromAccount}
                onAccountSelect={(value) => setFromAccount(value)}
                accounts={accounts}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "16px 0",
              }}
            >
              <Divider style={{ borderColor: "#DFE1E6" }}>
                <SwapOutlined style={{ color: "#0052CC", fontSize: "18px" }} />
              </Divider>
            </div>
            <div
            
              label="Destino"
              
            >
              <AccountSelector
               selectedAccount={toAccount}
               onAccountSelect={(value) => setToAccount(value)}
               accounts={accounts}
              />
            </div>
          </div>

          {/* Sección de Comprobantes */}
          <div
            style={{
              background: "#FFFFFF",
              padding: "16px",
              borderRadius: "4px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Text
              strong
              style={{
                fontSize: "14px",
                color: "#172B4D",
                textTransform: "uppercase",
                marginBottom: "16px",
                display: "block",
              }}
            >
              <FileImageOutlined style={{ marginRight: "8px", color: "#0052CC" }} />
              Comprobantes
            </Text>
            <ImageUploader
              imageUrls={imageUrls}
              setImageUrls={setImageUrls}
              voucher={vouchers}
              setVoucher={setVouchers}
            />
          </div>
        </Form>
      </div>
    </Drawer>
  );
};

export default TransferModal;