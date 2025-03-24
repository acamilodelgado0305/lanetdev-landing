import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, InputNumber, Tooltip } from 'antd';
import { FileTextOutlined, UserOutlined, HomeOutlined, EnvironmentOutlined, CloseOutlined, ShareAltOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';

const { Text } = Typography;

const apiUrl = import.meta.env.VITE_API_FINANZAS;

const AddCajero = ({ onCashierAdded, cashierToEdit, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (cashierToEdit) {
      setIsEditing(true);
      form.setFieldsValue(cashierToEdit);
    } else {
      setIsEditing(false);
      form.resetFields();
    }
  }, [cashierToEdit, form]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing
        ? `${apiUrl}/cajeros/${cashierToEdit.id}`
        : `${apiUrl}/cajeros`;

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      await response.json();

      Swal.fire({
        icon: 'success',
        title: isEditing ? 'Cajero Actualizado' : 'Cajero Registrado',
        text: 'El cajero se ha guardado correctamente.',
        confirmButtonColor: '#0052CC',
      });

      if (onCashierAdded) onCashierAdded();
      if (onClose) onClose(); // Cerrar el modal desde el padre
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al guardar el cajero.',
        confirmButtonColor: '#DE350B',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null; // No renderizar nada si no está visible

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[800px] bg-white shadow-lg rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="p-6 bg-gray-100 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1
                className="text-xl font-semibold text-gray-900"
                style={{ fontFamily: 'SF Pro Display, sans-serif' }}
              >
                {isEditing ? 'Editar Cajero' : 'Nuevo Cajero'}
              </h1>
            </div>
            <div className="flex space-x-2">
              <Tooltip title="Compartir">
                <Button
                  icon={<ShareAltOutlined />}
                  className="text-gray-500 hover:text-gray-700 bg-transparent border-none"
                  disabled
                />
              </Tooltip>
              <Tooltip title="Cerrar">
                <Button
                  onClick={onClose}
                  icon={<CloseOutlined />}
                  className="text-gray-500 hover:text-gray-700 bg-transparent border-none"
                />
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6" style={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Form form={form} layout="vertical" style={{ width: '100%' }}>
            {/* Sección Información Básica */}
            <div className="mb-6">
              <Text
                strong
                className="text-base font-semibold text-gray-900 mb-2 block"
                style={{ fontFamily: 'SF Pro Display, sans-serif' }}
              >
                <FileTextOutlined className="mr-2 text-gray-700" />
                Información Básica
              </Text>
              <div className="grid grid-cols-1 gap-4 text-sm text-gray-600" style={{ fontFamily: 'SF Pro Text, sans-serif' }}>
                <Form.Item
                  name="nombre"
                  label="Nombre del Cajero"
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-500" />}
                    placeholder="Ingrese el nombre"
                    className="rounded-md"
                  />
                </Form.Item>
                <Form.Item
                  name="responsable"
                  label="Responsable"
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-500" />}
                    placeholder="Ingrese el responsable"
                    className="rounded-md"
                  />
                </Form.Item>
                <Form.Item
                  name="municipio"
                  label="Municipio"
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    prefix={<EnvironmentOutlined className="text-gray-500" />}
                    placeholder="Ingrese el municipio"
                    className="rounded-md"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Sección Detalles Adicionales */}
            <div className="mb-6">
              <Text
                strong
                className="text-base font-semibold text-gray-900 mb-2 block"
                style={{ fontFamily: 'SF Pro Display, sans-serif' }}
              >
                <HomeOutlined className="mr-2 text-gray-700" />
                Detalles Adicionales
              </Text>
              <div className="grid grid-cols-1 gap-4 text-sm text-gray-600" style={{ fontFamily: 'SF Pro Text, sans-serif' }}>
                <Form.Item
                  name="direccion"
                  label="Dirección"
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input.TextArea
                    placeholder="Ingrese la dirección completa"
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    className="rounded-md"
                  />
                </Form.Item>
                <Form.Item
                  name="comision_porcentaje"
                  label="Porcentaje de Comisión"
                  rules={[{ required: true, message: 'Requerido' }]}
                  initialValue={0}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace('%', '')}
                    style={{ width: '100%' }}
                    className="rounded-md"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Sección Observaciones */}
            <div>
              <Text
                strong
                className="text-base font-semibold text-gray-900 mb-2 block"
                style={{ fontFamily: 'SF Pro Display, sans-serif' }}
              >
                <FileTextOutlined className="mr-2 text-gray-700" />
                Observaciones
              </Text>
              <Form.Item name="observaciones" label="Observaciones">
                <Input.TextArea
                  placeholder="Ingrese observaciones"
                  autoSize={{ minRows: 4, maxRows: 6 }}
                  className="rounded-md bg-gray-50 p-4 border border-gray-200"
                />
              </Form.Item>
            </div>
          </Form>
        </div>

        {/* Pie de página */}
        <div className="p-4 bg-gray-100 border-t border-gray-200">
          <div className="flex justify-between gap-2">
            <Button
              onClick={onClose}
              className="rounded-md border-gray-300 text-gray-700 hover:text-gray-900"
              style={{ height: 40, width: 120, fontFamily: 'SF Pro Text, sans-serif' }}
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={loading}
              className="rounded-md bg-[#0052CC] hover:bg-[#003BB3] border-none"
              style={{ height: 40, width: 120, fontFamily: 'SF Pro Text, sans-serif' }}
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCajero;
