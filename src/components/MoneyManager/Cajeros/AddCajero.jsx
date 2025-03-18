import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, Divider, Typography, InputNumber, Space, Tooltip } from 'antd';
import { FileTextOutlined, UserOutlined, HomeOutlined, EnvironmentOutlined, CloseOutlined, ShareAltOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';

const { Text } = Typography;

const apiUrl = import.meta.env.VITE_API_FINANZAS;

const AddCajero = ({ onCashierAdded, cashierToEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (cashierToEdit) {
      setIsEditing(true);
      form.setFieldsValue(cashierToEdit);
      setIsOpen(true);
    } else {
      setIsEditing(false);
      form.resetFields();
    }
  }, [cashierToEdit, form]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    form.resetFields();
  };

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
      handleClose();
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

  return (
    <>
      <Button
        type="primary"
        onClick={handleOpen}
        className="bg-[#0052CC] hover:bg-[#003BB3]"
        style={{ padding: '0 20px', height: 36, borderRadius: 4, fontWeight: 500 }}
      >
        {isEditing ? 'Editar Cajero' : 'Nuevo Cajero'}
      </Button>

      <Drawer
        title={
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="bg-[#0052CC] text-white px-4 py-2 rounded-md font-semibold text-sm">
                {isEditing ? 'EDITAR CAJERO' : 'NUEVO CAJERO'}
              </div>
            </div>
            <div className="flex space-x-2">
              <Tooltip title="Compartir">
                <Button
                  icon={<ShareAltOutlined />}
                  className="border border-gray-300 text-gray-600 hover:text-[#0052CC] hover:border-[#0052CC]"
                  type="text"
                  disabled
                />
              </Tooltip>
              <Tooltip title="Cerrar">
                <Button
                  onClick={handleClose}
                  icon={<CloseOutlined />}
                  className="border border-gray-300 text-gray-600 hover:text-[#0052CC] hover:border-[#0052CC]"
                  type="text"
                />
              </Tooltip>
            </div>
          </div>
        }
        placement="right"
        width={600}
        onClose={handleClose}
        open={isOpen}
        closable={false}
        headerStyle={{ padding: 0, borderBottom: 'none' }}
        bodyStyle={{
          padding: '24px',
          background: '#F9FAFB',
          height: 'calc(100% - 120px)',
          overflow: 'auto',
        }}
        footerStyle={{
          padding: '16px 24px',
          borderTop: '1px solid #DFE1E6',
          background: '#FFFFFF',
        }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <Button
              onClick={handleClose}
              style={{
                borderRadius: '4px',
                borderColor: '#DFE1E6',
                color: '#172B4D',
                height: 40,
                width: 120,
              }}
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              loading={loading}
              style={{
                background: '#0052CC',
                borderColor: '#0052CC',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0, 82, 204, 0.2)',
                height: 40,
                width: 120,
              }}
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        }
        maskStyle={{ background: 'rgba(9, 30, 66, 0.54)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Form form={form} layout="vertical" style={{ width: '100%' }}>
            {/* Sección Información Básica */}
            <div
              style={{
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Text
                strong
                style={{
                  fontSize: '14px',
                  color: '#172B4D',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                  display: 'block',
                }}
              >
                <FileTextOutlined style={{ marginRight: '8px', color: '#0052CC' }} />
                Información Básica
              </Text>
              <Form.Item
                name="nombre"
                label="Nombre del Cajero"
                rules={[{ required: true, message: 'Requerido' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-[#0052CC]" />}
                  placeholder="Ingrese el nombre"
                  style={{ borderRadius: '4px' }}
                />
              </Form.Item>
              <Form.Item
                name="responsable"
                label="Responsable"
                rules={[{ required: true, message: 'Requerido' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-[#0052CC]" />}
                  placeholder="Ingrese el responsable"
                  style={{ borderRadius: '4px' }}
                />
              </Form.Item>
              <Form.Item
                name="municipio"
                label="Municipio"
                rules={[{ required: true, message: 'Requerido' }]}
              >
                <Input
                  prefix={<EnvironmentOutlined className="text-[#0052CC]" />}
                  placeholder="Ingrese el municipio"
                  style={{ borderRadius: '4px' }}
                />
              </Form.Item>
            </div>

            {/* Sección Detalles Adicionales */}
            <div
              style={{
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Text
                strong
                style={{
                  fontSize: '14px',
                  color: '#172B4D',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                  display: 'block',
                }}
              >
                <HomeOutlined style={{ marginRight: '8px', color: '#0052CC' }} />
                Detalles Adicionales
              </Text>
              <Form.Item
                name="direccion"
                label="Dirección"
                rules={[{ required: true, message: 'Requerido' }]}
              >
                <Input.TextArea
                  prefix={<HomeOutlined className="text-[#0052CC]" />}
                  placeholder="Ingrese la dirección completa"
                  autoSize={{ minRows: 3, maxRows: 5 }}
                  style={{ borderRadius: '4px' }}
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
                  style={{ width: '100%', borderRadius: '4px' }}
                />
              </Form.Item>
            </div>

            {/* Sección Observaciones */}
            <div
              style={{
                background: '#FFFFFF',
                padding: '16px',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Text
                strong
                style={{
                  fontSize: '14px',
                  color: '#172B4D',
                  textTransform: 'uppercase',
                  marginBottom: '16px',
                  display: 'block',
                }}
              >
                <FileTextOutlined style={{ marginRight: '8px', color: '#0052CC' }} />
                Observaciones
              </Text>
              <Form.Item name="observaciones" label="Observaciones">
                <Input.TextArea
                  placeholder="Ingrese observaciones"
                  autoSize={{ minRows: 4, maxRows: 6 }}
                  style={{ borderRadius: '4px' }}
                />
              </Form.Item>
            </div>
          </Form>
        </div>
      </Drawer>
    </>
  );
};

export default AddCajero;