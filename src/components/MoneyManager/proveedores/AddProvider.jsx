import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, Divider, Typography, Select, Switch, Space, Tooltip } from 'antd';
import { FileTextOutlined, UserOutlined, HomeOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, BarcodeOutlined, GlobalOutlined, CloseOutlined, ShareAltOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;
const { Option } = Select;

const apiUrl = import.meta.env.VITE_API_FINANZAS;

const AddProvider = ({ onProviderAdded, providerToEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (providerToEdit) {
      setIsEditing(true);
      form.setFieldsValue(providerToEdit);
      setIsOpen(true);
    } else {
      setIsEditing(false);
      form.resetFields();
    }
  }, [providerToEdit, form]);

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
        ? `${apiUrl}/providers/${providerToEdit.id}`
        : `${apiUrl}/providers`;

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      await response.json();

      Swal.fire({
        icon: 'success',
        title: isEditing ? 'Proveedor Actualizado' : 'Proveedor Registrado',
        text: 'El proveedor se ha guardado correctamente.',
        confirmButtonColor: '#0052CC',
      });

      if (onProviderAdded) onProviderAdded();
      handleClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al guardar el proveedor.',
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
        {isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      </Button>

      <Drawer
        title={
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="bg-[#0052CC] text-white px-4 py-2 rounded-md font-semibold text-sm">
                {isEditing ? 'EDITAR PROVEEDOR' : 'NUEVO PROVEEDOR'}
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
            {/* Sección Identificación */}
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
                Identificación
              </Text>
              <Form.Item name="tipo_identificacion" label="Tipo de Identificación" rules={[{ required: true, message: 'Requerido' }]}>
                <Select placeholder="Seleccione" style={{ borderRadius: '4px' }}>
                  <Option value="NIT">NIT</Option>
                  <Option value="CC">Cédula de Ciudadanía</Option>
                </Select>
              </Form.Item>
              <Form.Item name="numero_identificacion" label="Número de Identificación" rules={[{ required: true, message: 'Requerido' }]}>
                <Input prefix={<BarcodeOutlined className="text-[#0052CC]" />} placeholder="Ingrese número" style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item name="dv" label="DV">
                <Input prefix={<FileTextOutlined className="text-[#0052CC]" />} placeholder="Ingrese DV" style={{ borderRadius: '4px' }} />
              </Form.Item>
            </div>

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
                <UserOutlined style={{ marginRight: '8px', color: '#0052CC' }} />
                Información Básica
              </Text>
              <Form.Item name="tipo_persona" label="Tipo de Persona" rules={[{ required: true, message: 'Requerido' }]}>
                <Select placeholder="Seleccione" style={{ borderRadius: '4px' }}>
                  <Option value="Jurídica">Jurídica</Option>
                  <Option value="Natural">Natural</Option>
                </Select>
              </Form.Item>
              <Form.Item name="razon_social" label="Razón Social" rules={[{ required: true, message: 'Requerido' }]}>
                <Input prefix={<UserOutlined className="text-[#0052CC]" />} placeholder="Ingrese razón social" style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item name="nombre_comercial" label="Nombre Comercial">
                <Input placeholder="Ingrese nombre comercial" style={{ borderRadius: '4px' }} />
              </Form.Item>
            </div>

            {/* Sección Ubicación */}
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
                Ubicación
              </Text>
              <Form.Item name="direccion" label="Dirección">
                <Input prefix={<HomeOutlined className="text-[#0052CC]" />} placeholder="Ingrese dirección" style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item name="ciudad" label="Ciudad">
                <Input prefix={<EnvironmentOutlined className="text-[#0052CC]" />} placeholder="Ingrese ciudad" style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item name="departamento" label="Departamento">
                <Input placeholder="Ingrese departamento" style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item name="pais" label="País" initialValue="Colombia">
                <Input prefix={<GlobalOutlined className="text-[#0052CC]" />} placeholder="Ingrese país" style={{ borderRadius: '4px' }} />
              </Form.Item>
            </div>

            {/* Sección Contacto y Detalles */}
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
                <PhoneOutlined style={{ marginRight: '8px', color: '#0052CC' }} />
                Contacto y Detalles
              </Text>
              <Form.Item name="telefono" label="Teléfono">
                <Input prefix={<PhoneOutlined className="text-[#0052CC]" />} placeholder="Ingrese teléfono" style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Requerido' }, { type: 'email', message: 'Email inválido' }]}>
                <Input prefix={<MailOutlined className="text-[#0052CC]" />} placeholder="Ingrese email" style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item name="tipo_regimen" label="Tipo de Régimen" rules={[{ required: true, message: 'Requerido' }]}>
                <Select placeholder="Seleccione" style={{ borderRadius: '4px' }}>
                  <Option value="Simplificado">Simplificado</Option>
                  <Option value="Común">Común</Option>
                </Select>
              </Form.Item>
              <Form.Item name="responsabilidad_fiscal" label="Responsabilidad Fiscal" rules={[{ required: true, message: 'Requerido' }]}>
                <Select placeholder="Seleccione" style={{ borderRadius: '4px' }}>
                  <Option value="R-99-NG">R-99-NG</Option>
                  <Option value="R-99-PN">R-99-PN</Option>
                </Select>
              </Form.Item>
              <Form.Item name="codigo_postal" label="Código Postal">
                <Input placeholder="Ingrese código postal" style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item name="matricula_mercantil" label="Matrícula Mercantil">
                <Input placeholder="Ingrese matrícula" style={{ borderRadius: '4px' }} />
              </Form.Item>
              <Form.Item name="estado" label="Estado" valuePropName="checked">
                <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" className="bg-[#B0BEC5]" />
              </Form.Item>
            </div>
          </Form>
        </div>
      </Drawer>
    </>
  );
};

export default AddProvider;