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
  Tag
} from "antd";
import {
  DollarCircleOutlined,
  SwapOutlined,
  FileImageOutlined,
  CloseOutlined,
  LeftOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  FormOutlined
} from '@ant-design/icons';
import Swal from "sweetalert2";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AccountSelector from "./Add/AccountSelector ";
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

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (transactionToEdit) {
      setIsEditing(!!transactionToEdit.isEditing);
      setVouchers(transactionToEdit.vouchers || null);
      setImageUrls(Array.isArray(transactionToEdit.vouchers) ? transactionToEdit.vouchers : []);

      form.setFieldsValue({
        fromAccount: transactionToEdit.fromAccountId || undefined,
        toAccount: transactionToEdit.toAccountId || undefined,
        amount: transactionToEdit.amount ? parseFloat(transactionToEdit.amount) : undefined,
        description: transactionToEdit.description || "",
        date: transactionToEdit.date ? dayjs(transactionToEdit.date) : dayjs(),
      });
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
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
        userId: 1,
        fromAccountId: parseInt(values.fromAccount, 10),
        toAccountId: parseInt(values.toAccount, 10),
        amount: parseFloat(values.amount),
        date: localDate,
        vouchers: imageUrls,
        description: values.description,
      };

      const endpoint = `${apiUrl}/transfers${isEditing ? `/${transactionToEdit.id}` : ''}`;
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
          text: isEditing ? "La transferencia se ha actualizado correctamente." : "La transferencia se ha realizado correctamente.",
          confirmButtonColor: "#0052CC", // Color azul de Jira
        });
        resetForm();
        onClose();
        onTransactionAdded();
      } else {
        throw new Error(isEditing ? "Error al actualizar la transferencia" : "Error al realizar la transferencia");
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Por favor complete todos los campos requeridos");
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message,
          confirmButtonColor: "#DE350B", // Color rojo de Jira
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
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            icon={<LeftOutlined />}
            onClick={onClose}
            type="text"
            style={{ marginRight: '8px', padding: '4px 8px' }}
          />
          <DollarCircleOutlined style={{ color: '#0052CC', fontSize: '18px' }} />
          <span style={{ fontWeight: 500 }}>{isEditing ? "Editar Transferencia" : "Nueva Transferencia"}</span>
          <Tag
            color={isEditing ? "orange" : "blue"}
            style={{ marginLeft: '8px', border: 'none', borderRadius: '2px' }}
          >
            {isEditing ? "En Edición" : "Nueva"}
          </Tag>
        </div>
      }
      placement="right"
      width={500}
      onClose={onClose}
      open={isOpen}
      closable={false}
      headerStyle={{
        padding: '12px 24px',
        borderBottom: '1px solid #DFE1E6',
        background: '#FAFBFC'
      }}
      bodyStyle={{
        padding: '16px 24px',
        background: '#FFFFFF',
        height: 'calc(100% - 120px)',
        overflow: 'auto'
      }}
      style={{
        borderRadius: '0px',
        top: '100px'  // Ajusta este valor para que comience más abajo
      }}
      footerStyle={{
        padding: '16px 24px',
        borderTop: '1px solid #DFE1E6',
        background: '#FAFBFC'
      }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button onClick={onClose} style={{ borderRadius: '3px' }}>
            Cancelar
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            loading={loading}
            style={{
              background: '#0052CC',
              borderRadius: '3px',
              boxShadow: 'none'
            }}
          >
            {isEditing ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      }
      maskStyle={{
        background: 'rgba(9, 30, 66, 0.54)' // Estilo de oscurecimiento Jira
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            date: dayjs(),
          }}
          style={{ width: '100%' }}
        >
          <div style={{ marginBottom: '24px' }}>
            <Text style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#6B778C',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              <InfoCircleOutlined style={{ marginRight: '8px' }} />
              Detalles de la Transacción
            </Text>

            <div style={{ background: '#F4F5F7', padding: '16px', borderRadius: '3px' }}>
              <Form.Item
                name="date"
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CalendarOutlined />
                    <span>Fecha</span>
                  </div>
                }
                rules={[{ required: true, message: 'Por favor seleccione una fecha' }]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: '100%', borderRadius: '3px' }}
                  placeholder="Seleccione fecha"
                />
              </Form.Item>

              <Form.Item
                name="amount"
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarCircleOutlined />
                    <span>Importe</span>
                  </div>
                }
                rules={[
                  { required: true, message: 'Por favor ingrese el importe' },
                  { type: 'number', min: 1, message: 'El importe debe ser mayor a 0' }
                ]}
              >
                <Input
                  prefix="$"
                  type="number"
                  placeholder="0"
                  style={{ width: '100%', borderRadius: '3px' }}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FormOutlined />
                    <span>Descripción</span>
                  </div>
                }
              >
                <TextArea
                  placeholder="Añade una descripción"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ borderRadius: '3px' }}
                />
              </Form.Item>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Text style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#6B778C',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              <FileImageOutlined style={{ marginRight: '8px' }} />
              Comprobantes
            </Text>

            <div style={{ background: '#F4F5F7', padding: '16px', borderRadius: '3px' }}>
              <ImageUploader
                imageUrls={imageUrls}
                setImageUrls={setImageUrls}
                voucher={vouchers}
                setVoucher={setVouchers}
              />
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Text style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              color: '#6B778C',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              <SwapOutlined style={{ marginRight: '8px' }} />
              Cuentas
            </Text>

            <div style={{ background: '#F4F5F7', padding: '16px', borderRadius: '3px' }}>
              <Form.Item
                name="fromAccount"
                label={
                  <div style={{ fontWeight: 500, color: '#172B4D' }}>Cuenta de Origen</div>
                }
                rules={[{ required: true, message: 'Por favor seleccione la cuenta de origen' }]}
              >
                <AccountSelector
                  accounts={accounts}
                  selectedAccount={form.getFieldValue('fromAccount')}
                  onAccountSelect={(value) => form.setFieldsValue({ fromAccount: value })}
                  formatCurrency={formatCurrency}
                />
              </Form.Item>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '16px 0',
                position: 'relative'
              }}>
                <div style={{
                  borderBottom: '1px solid #DFE1E6',
                  width: '100%',
                  position: 'absolute',
                  zIndex: 0
                }} />
                <div style={{
                  background: '#0052CC',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <SwapOutlined style={{ color: 'white', fontSize: '14px' }} />
                </div>
              </div>

              <Form.Item
                name="toAccount"
                label={
                  <div style={{ fontWeight: 500, color: '#172B4D' }}>Cuenta de Destino</div>
                }
                rules={[
                  { required: true, message: 'Por favor seleccione la cuenta de destino' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('fromAccount') !== value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('La cuenta de origen y destino no pueden ser iguales'));
                    },
                  }),
                ]}
              >
                
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </Drawer>
  );
};

export default TransferModal;