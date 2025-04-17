import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Typography, Select, Switch, Tooltip, DatePicker, Upload, Space, Row, Col
} from 'antd';
import { FileTextOutlined, UserOutlined, HomeOutlined, UploadOutlined, BarcodeOutlined, ShareAltOutlined, PlusOutlined } from '@ant-design/icons';
import { PhoneOutlined, MailOutlined, CloseOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import departamentos from './departamentos';
import ciudades from './ciudades';
const { Text } = Typography;
const { Option } = Select;
const apiUrl = import.meta.env.VITE_API_FINANZAS;

const AddProvider = ({ onProviderAdded, providerToEdit, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tipoIdentificacion, setTipoIdentificacion] = useState('NIT');
  const [telefonos, setTelefonos] = useState([{ numero: '', tipo: 'Personal' }]);
  const [correos, setCorreos] = useState([{ email: '', tipo: 'Contacto General' }]);
  const navigate = useNavigate();


  const [paises, setPaises] = useState([]);

  const [selectedPais, setSelectedPais] = useState(null);
  const [selectedDepartamento, setSelectedDepartamento] = useState(null);

  const handleCancel = () => {
    navigate("/index/terceros/cajeros");
  };

  const handlePaisChange = (pais) => {
    setSelectedPais(pais);
    setSelectedDepartamento(null);  // Reset departamento

  };
  // Lista de departamentos de Colombia


  useEffect(() => {
    const fetchPaises = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        setPaises(response.data);
      } catch (error) {
        console.error('Error al cargar países:', error);
      }
    };
    fetchPaises();
  }, []);


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
  // Función para agregar un nuevo teléfono
  const handleAddTelefono = () => {
    setTelefonos([...telefonos, { numero: '', tipo: 'Personal' }]);
  };

  const handleDeleteTelefono = (index) => {
    const updatedTelefonos = telefonos.filter((_, i) => i !== index);
    setTelefonos(updatedTelefonos);
  };

  // Función para agregar un nuevo correo
  const handleAddCorreo = () => {
    setCorreos([...correos, { email: '', tipo: 'Contacto General' }]);
  };
  const handleDeleteCorreo = (index) => {
    const updatedCorreos = correos.filter((_, i) => i !== index);
    setCorreos(updatedCorreos);
  };

  // Manejar cambios en el teléfono
  const handleTelefonoChange = (index, field, value) => {
    const updatedTelefonos = [...telefonos];
    updatedTelefonos[index][field] = value;
    setTelefonos(updatedTelefonos);
  };

  // Manejar cambios en el correo
  const handleCorreoChange = (index, field, value) => {
    const updatedCorreos = [...correos];
    updatedCorreos[index][field] = value;
    setCorreos(updatedCorreos);
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
        telefono: telefonos.map(telefono => ({
          numero: telefono.numero,
          tipo: telefono.tipo,
        })),
        correo: correos.map(correo => ({
          email: correo.email,
          tipo: correo.tipo,
        })),
        adjuntos: values.adjuntos || [],
        departamento: values.departamento || 'No disponible',
        sitioweb: values.sitioweb || '',
        medioPago: values.medioPago || 'Banco',
        estado: 'activo',
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${apiUrl}/incomes/bulk-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Carga masiva completada exitosamente!");
      if (onTransactionAdded) onTransactionAdded();
    } catch (error) {
      message.error("Error al procesar la carga masiva.");
      console.error("Error en la carga masiva:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" max-w-[1300px] mx-auto bg-white shadow-lg rounded-lg py-2">
      {/* Encabezado fijo */}
      <div className="sticky top-0 z-10 bg-white px-4 pt-4 border-b border-gray-200 flex justify-between items-center">

        <div className="flex px-2 rounded-md justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">COMPROBANTE DE PROVEEDOR</h1>
            <p className="text-sm text-gray-500">Documento de control interno</p>
          </div>

        </div>

        <Space size="middle">
          <div>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{ display: "none" }}
              id="bulkUploadInput"
            />
            <Button
              type="primary"
              icon={<UploadOutlined />}
              loading={loading}
              onClick={() => document.getElementById("bulkUploadInput").click()}
              className="bg-transparent border border-[#0052CC] text-[#0052CC] hover:bg-[#0052CC] hover:text-white"
              style={{ borderRadius: 2 }}
            >
              Cargar Proveedores Masivos
            </Button>
          </div>
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
            className="bg-[#0052CC] hover:bg-[#003bb3]"
            style={{ borderRadius: 2 }}
          >
            Guardar
          </Button>
        </Space>
      </div>

      {/* Contenido principal */}
      <div className=" px-4">
        {/*  <Text strong className="text-xl text-gray-900">
          {isEditing ? (editMode ? 'Editar Proveedor' : 'Ver Proveedor') : 'Nuevo Proveedor'}
        </Text> */}

      </div>
      <div className="p-6" style={{ maxHeight: '75vh', overflow: 'auto' }}>
        <Form form={form} layout="vertical" style={{ width: '100%' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Columna 1: Identificación */}
            <div className="col-span-1">
              {/* Sección de Identificación */}
              <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 flex flex-col items-start">
                <Text strong className="text-lg text-gray-800 mb-4 block">
                  <FileTextOutlined className="mr-2 text-gray-500" />
                  Identificación
                </Text>

                {/* Tipo de Identificación */}
                <Form.Item
                  name="tipoIdentificacion"
                  label={<span className="text-gray-600 text-sm">Tipo de Identificación</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Select
                    placeholder="Seleccione"
                    onChange={handleTipoIdentificacionChange}
                    className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    disabled={!editMode}
                  >
                    <Option value="NIT">NIT</Option>
                    <Option value="CC">Cédula de Ciudadanía</Option>
                  </Select>
                </Form.Item>

                {/* Número de Identificación */}
                <Form.Item
                  name="numeroIdentificacion"
                  label={<span className="text-gray-600 text-sm">Número de Identificación</span>}
                  rules={[{ required: true, message: 'Requerido' }]}
                >
                  <Input
                    prefix={<BarcodeOutlined className="text-gray-400" />}
                    placeholder="Ingrese número"
                    className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    disabled={!editMode}
                  />
                </Form.Item>

                {/* Nombre Comercial o Nombres y Apellidos dependiendo del tipo de identificación */}
                {tipoIdentificacion === 'NIT' ? (
                  <Form.Item
                    name="nombreComercial"
                    label={<span className="text-gray-600 text-sm">Nombre Comercial</span>}
                  >
                    <Input
                      placeholder="Ingrese nombre comercial"
                      className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      disabled={!editMode}
                    />
                  </Form.Item>
                ) : (
                  <>
                    {/* Nombres del contacto */}
                    <Form.Item
                      name="nombresContacto"
                      label={<span className="text-gray-600 text-sm">Nombres</span>}
                      rules={[{ required: true, message: 'Requerido para CC' }]}
                    >
                      <Input
                        prefix={<UserOutlined className="text-gray-400" />}
                        placeholder="Ingrese nombres"
                        className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        disabled={!editMode}
                      />
                    </Form.Item>

                    {/* Apellidos del contacto */}
                    <Form.Item
                      name="apellidosContacto"
                      label={<span className="text-gray-600 text-sm">Apellidos</span>}
                      rules={[{ required: true, message: 'Requerido para CC' }]}
                    >
                      <Input
                        placeholder="Ingrese apellidos"
                        className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        disabled={!editMode}
                      />
                    </Form.Item>
                  </>
                )}
              </div>
            </div>


            {/* Columna 2: Subir Archivos */}
            <div className="col-span-1 my-auto">
              {/* Caja para Documentos con bordes y fondo */}
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-100 flex flex-col ">
                <Text strong className="text-lg text-gray-800 mb-4 block">
                  <UploadOutlined className="mr-2 text-gray-500" />
                  Documentos
                </Text>

                <Form.Item
                  name="camaraComercio"
                  label={<span className="text-gray-600 text-sm">Cámara de Comercio</span>}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e && e.fileList}
                  extra="Sube el archivo de la Cámara de Comercio."
                >
                  <Upload
                    name="file"
                    action="/upload" // Cambiar la URL según sea necesario
                    listType="picture"
                    className="upload-list-inline"
                    disabled={!editMode}
                  >
                    <Button icon={<UploadOutlined />} disabled={!editMode}>Subir Archivo</Button>
                  </Upload>
                </Form.Item>

                <Form.Item
                  name="rut"
                  label={<span className="text-gray-600 text-sm">RUT</span>}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e && e.fileList}
                  extra="Sube el archivo del RUT."
                >
                  <Upload
                    name="file"
                    action="/upload" // Cambiar la URL según sea necesario
                    listType="picture"
                    className="upload-list-inline"
                    disabled={!editMode}
                  >
                    <Button icon={<UploadOutlined />} disabled={!editMode}>Subir Archivo</Button>
                  </Upload>
                </Form.Item>
              </div>
            </div>

            {/* Columna 3: Otros Documentos */}
            <div className="col-span-1 my-auto">
              {/* Caja para Otros Documentos con bordes y fondo */}
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-100 flex flex-col">
                <Text strong className="text-lg text-gray-800 mb-4 block">
                  <ShareAltOutlined className="mr-2 text-gray-500" />
                  Otros Documentos
                </Text>

                <Form.Item
                  name="otrosDocumentos"
                  label={<span className="text-gray-600 text-sm">Otros Documentos</span>}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e && e.fileList}
                  extra="Sube cualquier otro documento relacionado."
                >
                  <Upload
                    name="file"
                    action="/upload" // Cambiar la URL según sea necesario
                    listType="picture"
                    className="upload-list-inline"
                    disabled={!editMode}
                  >
                    <Button icon={<UploadOutlined />} disabled={!editMode}>Subir Archivo</Button>
                  </Upload>
                </Form.Item>
              </div>
            </div>

            {/* Columna 2: Ubicación y Contacto */}
            <div className="col-span-3">
              <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
                <Text strong className="text-lg text-gray-800 mb-4 block">
                  <HomeOutlined className="mr-2 text-gray-500" />
                  Ubicación y Contacto
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Columna 1: País, Departamento, Ciudad */}
                  <div>
                    <Form.Item
                      name="pais"
                      label={<span className="text-gray-600 text-sm">País</span>}
                      rules={[{ required: true, message: 'Requerido' }]}>
                      <Select
                        onChange={handlePaisChange}
                        placeholder="Seleccione un país"
                        className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500">
                        {paises.map((pais) => (
                          <Option key={pais.cca3} value={pais.cca3}>
                            {pais.name.common}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    {/* Departamento */}
                    <Form.Item
                      name="departamento"
                      label={<span className="text-gray-600 text-sm">Departamento / Estados</span>}>
                      <Select
                        className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        disabled={!editMode}
                        placeholder="Seleccione un departamento">
                        {departamentos.map((departamento) => (
                          <Option key={departamento} value={departamento}>
                            {departamento}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                  {/* Columna 2: Dirección y Teléfonos */}
                  <div>
                    {/* Ciudad */}
                    <Form.Item
                      name="ciudad"
                      label={<span className="text-gray-600 text-sm">Ciudad</span>}
                      rules={[{ required: true, message: 'Requerido' }]}>
                      <Select
                        className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        disabled={!editMode}
                        placeholder="Seleccione una ciudad">
                        {ciudades.map((ciudad) => (
                          <Option key={ciudad} value={ciudad}>
                            {ciudad}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {/* Dirección */}
                    <Form.Item
                      name="direccion"
                      label={<span className="text-gray-600 text-sm">Dirección</span>}
                      rules={[{ required: true, message: 'Requerido' }]}>
                      <Input.TextArea
                        prefix={<HomeOutlined className="text-gray-400" />}
                        placeholder="Ingrese dirección"
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        disabled={!editMode}
                      />
                    </Form.Item>

                  </div>

                  {/* Columna 3: Detalles Adicionales */}
                  <div>
                    <Text strong className="text-lg text-gray-800 mb-4 block">
                      <FileTextOutlined className="mr-2 text-gray-500" />
                      Detalles Adicionales
                    </Text>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      {/* Sitio Web */}
                      <div>
                        <Form.Item
                          name="sitioweb"
                          label={<span className="text-gray-600 text-sm">Sitio Web</span>}>
                          <Input
                            placeholder="Ingrese sitio web"
                            className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
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

                      {/* Información Bancaria */}
                      <div>
                        <Form.Item
                          name="medioPago"
                          label={<span className="text-gray-600 text-sm">Información Bancaria</span>}
                          rules={[{ required: true, message: 'Requerido' }]}>
                          <Input
                            placeholder="Ingrese método de pago"
                            className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
                            disabled={!editMode}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Teléfonos */}
          <div className="col-span-2 mx-20 mt-8">
            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <Text strong className="text-lg text-gray-800 mb-4 block">
                <PhoneOutlined className="mr-2 text-gray-500" />
                Teléfonos
              </Text>
              {telefonos.map((telefono, index) => (
                <Row gutter={16} key={index} className="mb-4">
                  <Col span={10}>
                    <Form.Item
                      name={['telefono', index, 'numero']}
                      label="Número"
                      required
                      className="mb-4"
                    >
                      <Input
                        value={telefono.numero}
                        onChange={(e) => handleTelefonoChange(index, 'numero', e.target.value)}
                        className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      name={['telefono', index, 'tipo']}
                      label="Tipo"
                      required
                      className="mb-4"
                    >
                      <Select
                        value={telefono.tipo}
                        onChange={(value) => handleTelefonoChange(index, 'tipo', value)}
                        className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      >
                        <Option value="Personal">Personal</Option>
                        <Option value="Oficina">Oficina</Option>
                        <Option value="Soporte">Soporte</Option>
                        <Option value="Facturación">Facturación</Option>
                        <Option value="Otro">Otro</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4} className="flex items-center justify-end">
                    {index === telefonos.length - 1 ? (
                      <Button
                        icon={<PlusOutlined />}
                        type="dashed"
                        onClick={handleAddTelefono}
                        block
                        className="text-sm rounded-md border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                      >
                        Agregar Teléfono
                      </Button>
                    ) : (
                      <Button
                        icon={<CloseOutlined />}
                        type="dashed"
                        onClick={() => handleDeleteTelefono(index)}
                        block
                        className="text-sm rounded-md border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Eliminar
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
            </div>
          </div>

          {/* Correos */}
          <div className="col-span-2 mx-20 mt-8">
            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <Text strong className="text-lg text-gray-800 mb-4 block">
                <MailOutlined className="mr-2 text-gray-500" />
                Correos
              </Text>
              {correos.map((correo, index) => (
                <Row gutter={16} key={index} className="mb-4">
                  <Col span={10}>
                    <Form.Item
                      name={['correo', index, 'email']}
                      label="Correo"
                      required
                      className="mb-4"
                    >
                      <Input
                        value={correo.email}
                        onChange={(e) => handleCorreoChange(index, 'email', e.target.value)}
                        className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 p-2"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={10}>
                    <Form.Item
                      name={['correo', index, 'tipo']}
                      label="Tipo"
                      required
                      className="mb-4"
                    >
                      <Select
                        value={correo.tipo}
                        onChange={(value) => handleCorreoChange(index, 'tipo', value)}
                        className="rounded-md text-base border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      >
                        <Option value="Contacto General">Contacto General</Option>
                        <Option value="Soporte">Soporte</Option>
                        <Option value="Facturación">Facturación</Option>
                        <Option value="Otro">Otro</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4} className="flex items-center justify-end">
                    {index === correos.length - 1 ? (
                      <Button
                        icon={<PlusOutlined />}
                        type="dashed"
                        onClick={handleAddCorreo}
                        block
                        className="text-sm rounded-md border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                      >
                        Agregar Correo
                      </Button>
                    ) : (
                      <Button
                        icon={<CloseOutlined />}
                        type="dashed"
                        onClick={() => handleDeleteCorreo(index)}
                        block
                        className="text-sm rounded-md border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Eliminar
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
            </div>
          </div>

        </Form>
      </div >
    </div >
  );
};

export default AddProvider;
