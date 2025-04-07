import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  DatePicker,
  Input,
  Button,
  Typography,
  Divider,
  Space,
  message,
  Form,
} from "antd";
import {
  SwapOutlined,
  FileImageOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AccountSelector from "../AccountSelector";
import ImageUploader from "../ImageUploader";

// Extender dayjs con los plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;
const { TextArea } = Input;

const AddTransfer = ({ onTransactionAdded }) => {
  const apiUrl = import.meta.env.VITE_API_FINANZAS;
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const returnTab = location.state?.returnTab || "resumen";

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
    if (id) {
      fetchTransferData();
    }
  }, [id]);

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

  const fetchTransferData = async () => {
    try {
      const response = await fetch(`${apiUrl}/transfers/${id}`);
      if (!response.ok) {
        throw new Error("No se pudo cargar la transferencia");
      }
      const transferData = await response.json();
      
      setIsEditing(true);
      setVouchers(transferData.vouchers || null);
      setImageUrls(
        Array.isArray(transferData.vouchers) ? transferData.vouchers : []
      );

      const transferAmount = transferData.amount ? parseFloat(transferData.amount) : undefined;
      setAmount(transferAmount);
      setFromAccount(transferData.fromAccount?.toString() || "");
      setToAccount(transferData.toAccount?.toString() || "");
      
      form.setFieldsValue({
        fromAccount: transferData.fromAccount || undefined,
        toAccount: transferData.toAccount || undefined,
        amount: transferAmount,
        description: transferData.description || "",
        date: transferData.date ? dayjs(transferData.date) : dayjs(),
      });
    } catch (error) {
      console.error("Error al obtener la transferencia:", error);
      message.error("No se pudo cargar la información de la transferencia");
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

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
    setAmount(numericValue);
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

      const data = {
        userId: parseInt(sessionStorage.getItem("userId")) || 1,
        fromAccount: parseInt(fromAccount),
        toAccount: parseInt(toAccount),
        amount: parseFloat(amount) || 0,
        date: localDate,
        vouchers: imageUrls.length > 0 ? imageUrls : [],
        description: values.description || "",
      };

      const endpoint = `${apiUrl}/transfers${isEditing ? `/${id}` : ""}`;
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
        if (onTransactionAdded) onTransactionAdded();
        navigate("/index/moneymanager/transactions", { state: { activeTab: returnTab } });
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

  const handleCancel = () => {
    navigate("/index/moneymanager/transactions", { state: { activeTab: returnTab } });
  };

  return (
    <div className="max-w-[1300px] mx-auto bg-white shadow-lg rounded-lg">
      {/* Encabezado fijo */}
      <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#0052CC] p-2 rounded">
            <SwapOutlined className="text-white text-lg" />
          </div>
          <div>
            <span className="text-[#0052CC] text-sm">Transferencias /</span>
            <Title level={3} className="m-0">
              {isEditing ? "Editar Transferencia" : "Nueva Transferencia"}
            </Title>
          </div>
        </div>
        <Space size="middle">
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
            loading={loading}
            className="bg-[#0052CC] hover:bg-[#003bb3]"
            style={{ borderRadius: 2 }}
          >
            {isEditing ? "Actualizar Transferencia" : "Guardar Transferencia"}
          </Button>
        </Space>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
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
              marginBottom: "20px",
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

            <Form.Item name="description" label="Titúlo">
              <TextArea
                placeholder="Ingrese una descripción (ej. Transferencia por pago de factura #123)"
                autoSize={{ minRows: 2, maxRows: 5 }}
                style={{ borderRadius: "4px" }}
              />
            </Form.Item>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span>Importe:</span>
                <Input
                  value={formatCurrency(amount)}
                  onChange={handleAmountChange}
                  className="w-40"
                />
              </div>
            </div>
            
          </div>

          {/* Sección de Cuentas */}
          <div
            style={{
              background: "#FFFFFF",
              padding: "16px",
              marginBottom: "20px",
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
            <div className="mb-4">
              <div className="mb-2 font-medium">Origen</div>
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
            <div className="mb-4">
              <div className="mb-2 font-medium">Destino</div>
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
    </div>
  );
};

export default AddTransfer;