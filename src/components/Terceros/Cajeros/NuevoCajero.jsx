import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Typography, InputNumber, Tooltip, Switch
} from 'antd';
import {
  FileTextOutlined, UserOutlined, HomeOutlined, EnvironmentOutlined, CloseOutlined, ShareAltOutlined, EditOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import ImportePersonalizado from './ImportePersonalizado';

const { Text } = Typography;
const apiUrl = import.meta.env.VITE_API_FINANZAS;

const AddCajero = ({ onCashierAdded, cashierToEdit, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false); // Tracks if we're editing an existing cashier
  const [editMode, setEditMode] = useState(false); // Tracks if the form is editable
  const [enableCustomImport, setEnableCustomImport] = useState(false);
  const [items, setItems] = useState([{ key: '1', product: '', action: 'suma', value: 0 }]);
  const [customTotal, setCustomTotal] = useState(0);

  useEffect(() => {
    if (cashierToEdit) {
      setIsEditing(true);
      setEditMode(false); // Start in view-only mode
      form.setFieldsValue(cashierToEdit);
      if (cashierToEdit.importes_personalizados && cashierToEdit.importes_personalizados.length > 0) {
        setEnableCustomImport(true);
        setItems(
          cashierToEdit.importes_personalizados.map((item, index) => ({
            key: item.id_importe || `${index}`,
            product: item.producto,
            action: item.accion,
            value: item.valor,
          }))
        );
      } else {
        setEnableCustomImport(false);
        setItems([{ key: '1', product: '', action: 'suma', value: 0 }]);
      }
    } else {
      setIsEditing(false);
      setEditMode(true); // New cashier starts in edit mode
      form.resetFields();
      setEnableCustomImport(false);
      setItems([{ key: '1', product: '', action: 'suma', value: 0 }]);
      setCustomTotal(0);
    }
  }, [cashierToEdit, form]);

  const resetForm = () => {
    form.resetFields();
    setEnableCustomImport(false);
    setItems([{ key: '1', product: '', action: 'suma', value: 0 }]);
    setCustomTotal(0);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing
        ? `${apiUrl}/cajeros/${cashierToEdit.id_cajero}`
        : `${apiUrl}/cajeros`;

      const body = {
        ...values,
        ...(enableCustomImport && {
          importesPersonalizados: items.map(item => ({
            product: item.product,
            action: item.action,
            value: item.value,
          })),
        }),
      };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      await response.json();

      Swal.fire({
        icon: 'success',
        title: isEditing ? 'Cajero Actualizado' : 'Cajero Registrado',
        text: 'El cajero se ha guardado correctamente.',
        confirmButtonColor: '#0052CC',
      }).then(() => {
        resetForm();
        onClose();
        if (onCashierAdded) onCashierAdded();
      });
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

  const handleItemsChange = (newItems) => {
    setItems(newItems);
  };

  const handleTotalsChange = ({ total }) => {
    setCustomTotal(total);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[800px] bg-white shadow-lg rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
          <Text strong className="text-xl text-gray-900">
            {isEditing ? (editMode ? 'Editar Cajero' : 'Ver Cajero') : 'Nuevo Cajero'}
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
                  Información Básica
                </Text>
                <Form.Item
                  name="nombre"
                  label={<span className="text-gray-600 text-sm">Nombre del Cajero</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Nombre"
                    className="rounded-md text-base"
                    size="middle"
                    disabled={!editMode}
                  />
                </Form.Item>
                <Form.Item
                  name="responsable"
                  label={<span className="text-gray-600 text-sm">Responsable</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Responsable"
                    className="rounded-md text-base"
                    size="middle"
                    disabled={!editMode}
                  />
                </Form.Item>
                <Form.Item
                  name="municipio"
                  label={<span className="text-gray-600 text-sm">Municipio</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    prefix={<EnvironmentOutlined className="text-gray-400" />}
                    placeholder="Municipio"
                    className="rounded-md text-base"
                    size="middle"
                    disabled={!editMode}
                  />
                </Form.Item>
              </div>
              <div className="col-span-1">
                <Text strong className="text-base text-gray-700 mb-2 block">
                  <HomeOutlined className="mr-2 text-gray-500" />
                  Detalles Adicionales
                </Text>
                <Form.Item
                  name="direccion"
                  label={<span className="text-gray-600 text-sm">Dirección</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input.TextArea
                    placeholder="Dirección completa"
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    className="rounded-md text-base"
                    disabled={!editMode}
                  />
                </Form.Item>
                <Form.Item
                  name="comision_porcentaje"
                  label={<span className="text-gray-600 text-sm">Porcentaje de Comisión</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                  initialValue={0}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value.replace('%', '')}
                    className="w-full rounded-md text-base"
                    size="middle"
                    disabled={!editMode}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Switch
                  checked={enableCustomImport}
                  onChange={(checked) => setEnableCustomImport(checked)}
                  disabled={!editMode}
                />
                <Text className="text-gray-600 text-sm">
                  Agregar importe personalizado
                </Text>
              </div>
              {enableCustomImport && (
                <div className="mb-4">
                  <ImportePersonalizado
                    items={items}
                    onItemsChange={handleItemsChange}
                    onTotalsChange={handleTotalsChange}
                    disabled={!editMode} // Pass disabled prop to ImportePersonalizado
                  />
                </div>
              )}
              <Text strong className="text-base text-gray-700 mb-2 block">
                <FileTextOutlined className="mr-2 text-gray-500" />
                Observaciones
              </Text>
              <Form.Item
                name="observaciones"
                label={<span className="text-gray-600 text-sm">Notas adicionales</span>}
              >
                <Input.TextArea
                  placeholder="Observaciones"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  className="rounded-md text-base border-gray-300 focus:border-blue-500"
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

export default AddCajero;