import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Typography, Select, Switch, Tooltip
} from 'antd';
import {
  FileTextOutlined, UserOutlined, HomeOutlined, EnvironmentOutlined, PhoneOutlined, MailOutlined, BarcodeOutlined, CloseOutlined, ShareAltOutlined, EditOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';

const { Text } = Typography;
const { Option } = Select;
const apiUrl = import.meta.env.VITE_API_FINANZAS;

const AddProvider = ({ onProviderAdded, providerToEdit, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tipoIdentificacion, setTipoIdentificacion] = useState('NIT');

  useEffect(() => {
    if (providerToEdit) {
      setIsEditing(true);
      setEditMode(false); // Start in view-only mode
      setTipoIdentificacion(providerToEdit.tipoIdentificacion || 'NIT');
      form.setFieldsValue({
        ...providerToEdit,
        estado: providerToEdit.estado === 'activo'
      });
    } else {
      setIsEditing(false);
      setEditMode(true); // New provider starts in edit mode
      form.resetFields();
      setTipoIdentificacion('NIT');
      form.setFieldsValue({ estado: true });
    }
  }, [providerToEdit, form]);

  const resetForm = () => {
    form.resetFields();
    setTipoIdentificacion('NIT');
    form.setFieldsValue({ estado: true });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing
        ? `${apiUrl}/providers/${providerToEdit.id}`
        : `${apiUrl}/providers`;

      const payload = {
        tipoIdentificacion: values.tipoIdentificacion,
        numeroIdentificacion: values.numeroIdentificacion,
        nombreComercial: values.nombreComercial || '',
        nombresContacto: values.nombresContacto || '',
        apellidosContacto: values.apellidosContacto || '',
        ciudad: values.ciudad,
        direccion: values.direccion,
        correoContactoFacturacion: values.correoContactoFacturacion,
        telefonoFacturacion: values.telefonoFacturacion,
        estado: values.estado ? 'activo' : 'inactivo',
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      await response.json();

      Swal.fire({
        icon: 'success',
        title: isEditing ? 'Proveedor Actualizado' : 'Proveedor Registrado',
        text: 'El proveedor se ha guardado correctamente.',
        confirmButtonColor: '#0052CC',
      }).then(() => {
        resetForm();
        onClose();
        if (onProviderAdded) onProviderAdded();
      });
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

  const handleTipoIdentificacionChange = (value) => {
    setTipoIdentificacion(value);
    form.setFieldsValue({ nombreComercial: '', nombresContacto: '', apellidosContacto: '' });
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-6"
seven      onClick={onClose}
    >
      <div
        className="w-full max-w-[800px] bg-white shadow-lg rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
          <Text strong className="text-xl text-gray-900">
            {isEditing ? (editMode ? 'Editar Proveedor' : 'Ver Proveedor') : 'Nuevo Proveedor'}
          </Text>
          <div className="flex space-x-2">
            <Tooltip title="Compartir">
              <Button
                icon={<ShareAltOutlined />}
                className="text-gray-500 hover:text-gray-700 bg-transparent border-none p-2"
                disabled
              />
            </Tooltip>
            {isEditing && !editMode && (
              <Tooltip title="Editar">
                <Button
                  onClick={handleEditClick}
                  icon={<EditOutlined />}
                  className="text-gray-500 hover:text-gray-700 bg-transparent border-none p-2"
                />
              </Tooltip>
            )}
            <Tooltip title="Cerrar">
              <Button
                onClick={onClose}
                icon={<CloseOutlined />}
                className="text-gray-500 hover:text-gray-700 bg-transparent border-none p-2"
              />
            </Tooltip>
          </div>
        </div>
        <div className="p-6" style={{ maxHeight: '75vh', overflow: 'auto' }}>
          <Form form={form} layout="vertical" style={{ width: '100%' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <Text strong className="text-base text-gray-700 mb-2 block">
                  <FileTextOutlined className="mr-2 text-gray-500" />
                  Identificación
                </Text>
                <Form.Item
                  name="tipoIdentificacion"
                  label={<span className="text-gray-600 text-sm">Tipo de Identificación</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Select
                    placeholder="Seleccione"
                    onChange={handleTipoIdentificacionChange}
                    className="rounded-md text-base"
                    disabled={!editMode}
                  >
                    <Option value="NIT">NIT</Option>
                    <Option value="CC">Cédula de Ciudadanía</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="numeroIdentificacion"
                  label={<span className="text-gray-600 text-sm">Número de Identificación</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    prefix={<BarcodeOutlined className="text-gray-400" />}
                    placeholder="Ingrese número"
                    className="rounded-md text-base"
                    disabled={!editMode}
                  />
                </Form.Item>
                {tipoIdentificacion === 'NIT' ? (
                  <Form.Item
                    name="nombreComercial"
                    label={<span className="text-gray-600 text-sm">Nombre Comercial</span>}
                    rules={[{ required: true, message: 'Requerido para NIT' }]}
                  >
                    <Input
                      placeholder="Ingrese nombre comercial"
                      className="rounded-md text-base"
                      disabled={!editMode}
                    />
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item
                      name="nombresContacto"
                      label={<span className="text-gray-600 text-sm">Nombres</span>}
                      rules={[{ required: true, message: 'Requerido para CC' }]}
                    >
                      <Input
                        prefix={<UserOutlined className="text-gray-400" />}
                        placeholder="Ingrese nombres"
                        className="rounded-md text-base"
                        disabled={!editMode}
                      />
                    </Form.Item>
                    <Form.Item
                      name="apellidosContacto"
                      label={<span className="text-gray-600 text-sm">Apellidos</span>}
                      rules={[{ required: true, message: 'Requerido para CC' }]}
                    >
                      <Input
                        placeholder="Ingrese apellidos"
                        className="rounded-md text-base"
                        disabled={!editMode}
                      />
                    </Form.Item>
                  </>
                )}
              </div>
              <div className="col-span-1">
                <Text strong className="text-base text-gray-700 mb-2 block">
                  <HomeOutlined className="mr-2 text-gray-500" />
                  Ubicación y Contacto
                </Text>
                <Form.Item
                  name="direccion"
                  label={<span className="text-gray-600 text-sm">Dirección</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input.TextArea
                    prefix={<HomeOutlined className="text-gray-400" />}
                    placeholder="Ingrese dirección"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className="rounded-md text-base"
                    disabled={!editMode}
                  />
                </Form.Item>
                <Form.Item
                  name="ciudad"
                  label={<span className="text-gray-600 text-sm">Ciudad</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    prefix={<EnvironmentOutlined className="text-gray-400" />}
                    placeholder="Ingrese ciudad"
                    className="rounded-md text-base"
                    disabled={!editMode}
                  />
                </Form.Item>
                <Form.Item
                  name="telefonoFacturacion"
                  label={<span className="text-gray-600 text-sm">Teléfono de Facturación</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="Ingrese teléfono"
                    className="rounded-md text-base"
                    disabled={!editMode}
                  />
                </Form.Item>
                <Form.Item
                  name="correoContactoFacturacion"
                  label={<span className="text-gray-600 text-sm">Correo de Facturación</span>}
                  rules={[{ required: true, message: 'Requerido' }, { type: 'email', message: 'Email inválido' }]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="Ingrese email"
                    className="rounded-md text-base"
                    disabled={!editMode}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="mt-4">
              <Text strong className="text-base text-gray-700 mb-2 block">
                <FileTextOutlined className="mr-2 text-gray-500" />
                Detalles Adicionales
              </Text>
              {tipoIdentificacion === 'NIT' && (
                <>
                  <Form.Item
                    name="nombresContacto"
                    label={<span className="text-gray-600 text-sm">Nombres Contacto (Opcional)</span>}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Ingrese nombres del contacto"
                      className="rounded-md text-base"
                      disabled={!editMode}
                    />
                  </Form.Item>
                  <Form.Item
                    name="apellidosContacto"
                    label={<span className="text-gray-600 text-sm">Apellidos Contacto (Opcional)</span>}
                  >
                    <Input
                      placeholder="Ingrese apellidos del contacto"
                      className="rounded-md text-base"
                      disabled={!editMode}
                    />
                  </Form.Item>
                </>
              )}
              {tipoIdentificacion === 'CC' && (
                <Form.Item
                  name="nombreComercial"
                  label={<span className="text-gray-600 text-sm">Nombre Comercial (Opcional)</span>}
                >
                  <Input
                    placeholder="Ingrese nombre comercial"
                    className="rounded-md text-base"
                    disabled={!editMode}
                  />
                </Form.Item>
              )}
              <Form.Item
                name="estado"
                label={<span className="text-gray-600 text-sm">Estado</span>}
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Activo"
                  unCheckedChildren="Inactivo"
                  disabled={!editMode}
                />
              </Form.Item>
            </div>
          </Form>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="rounded-md border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 transition-all"
            style={{ height: 40, fontSize: '16px', padding: '0 20px' }}
          >
            Cancelar
          </Button>
          {editMode && (
            <Button
              type="primary"
              onClick={handleSave}
              loading={loading}
              className="rounded-md bg-[#0052CC] hover:bg-[#003BB3] border-none transition-all"
              style={{ height: 40, fontSize: '16px', padding: '0 20px' }}
            >
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProvider;