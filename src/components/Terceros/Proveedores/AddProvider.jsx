import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Typography, Select, Switch, Tooltip, DatePicker, Upload, Row, Col
} from 'antd';
import {
  FileTextOutlined, UserOutlined, HomeOutlined, EnvironmentOutlined, BarcodeOutlined, CloseOutlined, ShareAltOutlined, EditOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const apiUrl = import.meta.env.VITE_API_FINANZAS;

const AddProvider = ({ onProviderAdded, providerToEdit, visible, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tipoIdentificacion, setTipoIdentificacion] = useState('NIT');

  // Lista de departamentos de Colombia
  const departamentos = [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare',
    'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
    'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés',
    'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
  ];
  const ciudadesColombia = [
    'Leticia', 'Medellín', 'Envigado', 'Rionegro', 'Itagüí', 'Bello',
    'Arauca', 'Tame', 'Arauquita', 'Barranquilla', 'Soledad', 'Malambo',
    'Cartagena', 'Magangué', 'Turbaná', 'Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá',
    'Manizales', 'Villamaría', 'La Dorada', 'Florencia', 'San Vicente del Caguán', 'Puerto Rico',
    'Yopal', 'Villanueva', 'Hato Corozal', 'Popayán', 'Santander de Quilichao', 'Cajibío',
    'Valledupar', 'Aguachica', 'Codazzi', 'Quibdó', 'Riosucio', 'Condoto',
    'Montería', 'Lorica', 'Cereté', 'Bogotá', 'Soacha', 'Fusagasugá',
    'Inírida', 'San José del Guaviare', 'Neiva', 'Pitalito', 'La Plata',
    'Riohacha', 'Maicao', 'Fonseca', 'Santa Marta', 'Ciénaga', 'El Rodadero',
    'Villavicencio', 'Acacías', 'Puerto López', 'Pasto', 'Tumaco', 'Ipiales',
    'Cúcuta', 'Villa del Rosario', 'Los Patios', 'Mocoa', 'Puerto Asís', 'La Hormiga',
    'Armenia', 'Montenegro', 'Circasia', 'Pereira', 'Dosquebradas', 'La Virginia',
    'San Andrés', 'Bucaramanga', 'Barrancabermeja', 'Girón', 'Sincelejo', 'Corozal', 'Sampués',
    'Ibagué', 'Espinal', 'Honda', 'Cali', 'Buenaventura', 'Palmira', 'Mitú', 'Puerto Carreño'
  ];

  useEffect(() => {
    if (providerToEdit) {
      setIsEditing(true);
      setEditMode(false); // Iniciar en modo solo lectura
      setTipoIdentificacion(providerToEdit.tipoIdentificacion || 'NIT');
      form.setFieldsValue({
        ...providerToEdit,
        estado: providerToEdit.estado === 'activo',
        fechaVencimiento: providerToEdit.fechaVencimiento ? dayjs(providerToEdit.fechaVencimiento) : null,
        telefono: providerToEdit.telefono || [],
        correo: providerToEdit.correo || [],
        adjuntos: providerToEdit.adjuntos || [],
        nombreComercial: providerToEdit.nombre_comercial || '', // Asegúrate de que `nombreComercial` se inicialice aquí
      });
    } else {
      setIsEditing(false);
      setEditMode(true); // Nuevo proveedor comienza en modo edición
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
      const values = await form.validateFields(); // Valida los campos
      // Si el tipoIdentificacion es 'CC' y nombreComercial está vacío, eliminamos nombreComercial
      if (values.tipoIdentificacion === 'CC' && !values.nombreComercial) {
        delete values.nombreComercial; // Eliminar el campo nombreComercial si es una cédula
      }

      const payload = {
        tipoIdentificacion: values.tipoIdentificacion,
        numeroIdentificacion: values.numeroIdentificacion || 'No disponible',
        nombreComercial: values.nombreComercial || '',
        nombre: values.nombre || undefined,
        nombresContacto: values.nombresContacto || '',
        apellidosContacto: values.apellidosContacto || '',
        prefijo: values.prefijo || 'No disponible',
        pais: values.pais || 'Colombia',
        ciudad: values.ciudad,
        direccion: values.direccion,
        telefono: values.telefono.map(telefono => ({
          numero: telefono,
          tipo: 'Personal',
        })),
        correo: values.correo.map(correo => ({
          email: correo,
          tipo: 'Contacto General',
        })),
        adjuntos: values.adjuntos || [],
        departamento: values.departamento || 'No disponible',
        sitioweb: values.sitioweb || '',
        medioPago: values.medioPago || 'Banco',
        estado: values.estado ? 'activo' : 'inactivo',
        fechaVencimiento: values.fechaVencimiento ? values.fechaVencimiento.format('YYYY-MM-DD') : null,
      };

      const endpoint = isEditing
        ? `${apiUrl}/providers/${providerToEdit.id}`
        : `${apiUrl}/providers`;

      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const responseData = await response.json();

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
      console.log("Payload que se enviará:", JSON.stringify(payload)); // Verifica que nombreComercial esté incluido

    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Hubo un error al guardar el proveedor: ${error.message}`,
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
      onClick={onClose}
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
                  rules={[{ required: true, message: 'Requerido' }]}>
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
                  rules={[{ required: true, message: 'Requerido' }]}>
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
                <Form.Item
                  name="prefijo"
                  label={<span className="text-gray-600 text-sm">Prefijo</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    placeholder="Ingrese Prefijo"
                    className="rounded-md text-base"
                    disabled={!editMode}
                  />
                </Form.Item>
              </div>
              <div className="col-span-1">
                <Text strong className="text-base text-gray-700 mb-2 block">
                  <HomeOutlined className="mr-2 text-gray-500" />
                  Ubicación y Contacto
                </Text>
                <Form.Item
                  name="direccion"
                  label={<span className="text-gray-600 text-sm">Dirección</span>}
                  rules={[{ required: true, message: 'Requerido' }]}>
                  <Input.TextArea
                    prefix={<HomeOutlined className="text-gray-400" />}
                    placeholder="Ingrese dirección"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className="rounded-md text-base"
                    disabled={!editMode}
                  />
                </Form.Item>
                <Form.Item
                  name="pais"
                  label={<span className="text-gray-600 text-sm">Pais</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    placeholder="Ingrese su país"
                    className="rounded-md text-base"
                    disabled={!editMode}
                  />
                </Form.Item>
                <Form.Item
                  name="departamento"
                  label={<span className="text-gray-600 text-sm">Departamento</span>}>
                  <Select
                    className="rounded-md text-base"
                    disabled={!editMode}
                    placeholder="Seleccione un departamento">
                    {departamentos.map(departamento => (
                      <Option key={departamento} value={departamento}>
                        {departamento}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="ciudad"
                  label={<span className="text-gray-600 text-sm">Ciudad</span>}
                  rules={[{ required: true, message: 'Requerido' }]}>
                  <Select
                    className="rounded-md text-base"
                    disabled={!editMode}
                    placeholder="Seleccione una ciudad">
                    {ciudadesColombia.map(ciudadesColombia => (
                      <Option key={ciudadesColombia} value={ciudadesColombia}>
                        {ciudadesColombia}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="telefono"
                  label={<span className="text-gray-600 text-sm">Teléfonos</span>}
                  rules={[{ required: true, message: 'Requerido' }]}>
                  <Select
                    mode="tags"
                    placeholder="Agregar teléfono"
                    className="rounded-md text-base"
                    disabled={!editMode}
                    onChange={(value) => {
                      form.setFieldsValue({ telefono: value });  // Aquí asignamos un array de correos directamente
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="correo"
                  label={<span className="text-gray-600 text-sm">Correos</span>}
                  rules={[{ required: true, message: 'Requerido' }]}>
                  <Select
                    mode="tags"  // Permitir múltiples entradas
                    placeholder="Ingrese correos"
                    className="rounded-md text-base"
                    disabled={!editMode}
                    onChange={(value) => {
                      form.setFieldsValue({ correo: value });  // Aquí asignamos un array de correos directamente
                    }}
                  />
                </Form.Item>


              </div>
            </div>

            <div className="mt-4">
              <Text strong className="text-base text-gray-700 mb-2 block">
                <FileTextOutlined className="mr-2 text-gray-500" />
                Detalles Adicionales
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  {/* Añadido grid con dos columnas */}
                <div className="col-span-1">
                  <Form.Item
                    name="estado"
                    label={<span className="text-gray-600 text-sm">Estado</span>}
                    valuePropName="checked">
                    <Switch
                      checkedChildren="Activo"
                      unCheckedChildren="Inactivo"
                      disabled={!editMode}
                    />
                  </Form.Item>
                </div>
                <div className="col-span-1">
                  <Form.Item
                    name="fechaVencimiento"
                    label={<span className="text-gray-600 text-sm">Fecha de Creación</span>}>
                    <DatePicker
                      className="w-full rounded-md text-base"
                      disabled={!editMode}
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </div>

                <div className="col-span-1">
                  <Form.Item
                    name="sitioweb"
                    label={<span className="text-gray-600 text-sm">Sitio Web</span>}>
                    <Input
                      placeholder="Ingrese sitio web"
                      className="rounded-md text-base"
                      value={form.getFieldValue('sitioweb') || ''}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value && !/^https?:\/\//i.test(value)) {
                          value = `https://${value}`; // Agregar 'https://' si no tiene protocolo
                        }
                        form.setFieldsValue({ sitioweb: value });
                      }}
                    />
                  </Form.Item>
                </div>

                <div className="col-span-1">
                  <Form.Item
                    name="medioPago"
                    label={<span className="text-gray-600 text-sm">Medio de Pago</span>}
                    rules={[{ required: true, message: 'Requerido' }]}>
                    <Input
                      placeholder="Ingrese método de pago"
                      className="rounded-md text-base"
                      disabled={!editMode}
                    />
                  </Form.Item>
                </div>

                <div className="col-span-1">
                  <Form.Item
                    name="adjuntos"
                    label={<span className="text-gray-600 text-sm">Adjuntos</span>}>
                    <Upload
                      disabled={!editMode}
                      beforeUpload={() => false} // Prevent automatic upload
                      fileList={[]}>
                      <Button>Subir Archivos</Button>
                    </Upload>
                  </Form.Item>
                </div>
              </div>  {/* Cierre de grid */}
            </div>

          </Form>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="rounded-md border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 transition-all"
            style={{ height: 40, fontSize: '16px', padding: '0 20px' }}>
            Cancelar
          </Button>
          {editMode && (
            <Button
              type="primary"
              onClick={handleSave}
              loading={loading}
              className="rounded-md bg-[#0052CC] hover:bg-[#003BB3] border-none transition-all"
              style={{ height: 40, fontSize: '16px', padding: '0 20px' }}>
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddProvider;
