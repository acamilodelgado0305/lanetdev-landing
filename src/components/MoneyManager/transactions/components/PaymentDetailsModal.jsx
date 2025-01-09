import React from 'react';
import { Modal, Button, Descriptions, message, Divider, Typography } from 'antd';
import { DollarSign, Calendar, FileText, Building2, Receipt, AlertCircle } from 'lucide-react';
import axios from 'axios';

const { Title, Text } = Typography;

const PaymentDetailsModal = ({ isOpen, onClose, payment }) => {
  if (!payment) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePayment = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_FINANZAS}/expenses/${payment.id}/status`, {
        estado: true
      });
      
      message.success('Pago procesado exitosamente');
      onClose(true);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      message.error('Error al procesar el pago. Por favor, intente nuevamente.');
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 border-b pb-3">
          <Receipt className="w-5 h-5 text-blue-600" />
          <Title level={4} style={{ margin: 0 }}>Comprobante de Pago Recurrente</Title>
        </div>
      }
      open={isOpen}
      onCancel={() => onClose(false)}
      footer={[
        <div key="footer" className="flex justify-between items-center px-4">
          <div>
            <Text type="secondary">ID: {payment.id}</Text>
          </div>
          <div>
            <Button key="cancel" onClick={() => onClose(false)}>
              Cancelar
            </Button>
            <Button 
              key="pay" 
              type="primary" 
              onClick={handlePayment}
              className="ml-3"
              icon={<DollarSign className="w-4 h-4" />}
            >
              Procesar Pago
            </Button>
          </div>
        </div>
      ]}
      width={800}
      centered
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-600" />
          <Text className="text-lg">Fecha de Emisión: {formatDate(payment.date)}</Text>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <Title level={5} className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-blue-600" />
              Información del Proveedor
            </Title>
            <Text strong>Proveedor:</Text> {payment.provider_id}<br />
            <Text strong>Tipo de Gasto:</Text> {payment.type} - {payment.sub_type}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <Title level={5} className="flex items-center gap-2 mb-3">
              <Receipt className="w-4 h-4 text-blue-600" />
              Detalles del Pago
            </Title>
            <Text strong>Descripción:</Text> {payment.description}<br />
            <Text strong>Pago Recurrente:</Text> {payment.recurrent ? 'Sí' : 'No'}
          </div>
        </div>

        <Divider />

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <Title level={5} className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-blue-600" />
            Detalle Monetario
          </Title>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text strong>Monto Base:</Text>
              <div className="text-lg">{formatCurrency(payment.base_amount)}</div>
            </div>
            {payment.tax_type && (
              <div>
                <Text strong>{payment.tax_type}:</Text>
                <div className="text-lg">{formatCurrency(payment.tax_amount)}</div>
              </div>
            )}
            {payment.retention_type && (
              <div>
                <Text strong>Retención ({payment.retention_type}):</Text>
                <div className="text-lg text-red-500">
                  -{formatCurrency(payment.retention_amount)}
                </div>
              </div>
            )}
            <div className="col-span-2 mt-4 pt-4 border-t">
              <Text strong className="text-xl">Total a Pagar:</Text>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(payment.amount)}
              </div>
            </div>
          </div>
        </div>

        {!payment.estado && (
          <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <Text type="warning">
              Este pago está pendiente de procesamiento. Por favor, verifique los detalles antes de proceder.
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PaymentDetailsModal;