import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, Plus, X } from 'lucide-react';
import { Button, message, Card, Input, Select, Radio, Space, Row, Col, Typography } from 'antd';
import { RedoOutlined, SaveOutlined, FileTextOutlined } from '@ant-design/icons';
import Swal from "sweetalert2";


const Terceros = () => {
   const navigate = useNavigate();
 
  const [formData, setFormData] = useState({
    tipoPersona: 'natural',
    tipoIdentificacion: 'cc',
    identificacion: '',
    nombreComercial: '',
    codigoSucursal: '',
    nombresContacto: '',
    apellidosContacto: '',
    ciudad: '',
    direccion: '',
    nombresContactoFacturacion: '',
    apellidosContactoFacturacion: '',
    correoElectronicoFacturacion: '',
    tipoRegimen: 'regimenComún',
    telefonoFacturacion: '',
    codigoPostal: '',
    nit: '',
    dv: '',
  });


  const apiUrl = import.meta.env.VITE_API_FINANZAS;
  const { Title, Text } = Typography;
  const { Option } = Select;

  useEffect(() => {
    if (formData.tipoPersona === 'juridica') {
      setFormData((prevState) => ({
        ...prevState,
        tipoIdentificacion: 'nit',
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        tipoIdentificacion: 'cc',
      }));
    }
  }, [formData.tipoPersona]);

  const handleInputChange = (field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

 

  const handleTipoPersonaChange = (value) => {
    setFormData((prevState) => ({
      ...prevState,
      tipoPersona: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${apiUrl}/providers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("No se pudo guardar el proveedor.");

      Swal.fire({
        icon: "success",
        title: "Proveedor Registrado",
        text: "El proveedor se ha guardado correctamente.",
        confirmButtonColor: "#3085d6",
      });
      setFormData({
        tipoPersona: 'natural',
        tipoIdentificacion: 'cc',
        identificacion: '',
        nombreComercial: '',
        codigoSucursal: '',
        nombresContacto: '',
        apellidosContacto: '',
        ciudad: '',
        direccion: '',
        nombresContactoFacturacion: '',
        apellidosContactoFacturacion: '',
        correoElectronicoFacturacion: '',
        tipoRegimen: 'regimenComún',
        telefonoFacturacion: '',
        codigoPostal: '',
        nit: '',
        dv: '',
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Inténtalo de nuevo.",
        confirmButtonColor: "#d33",
      });
    }
  };


  // Función para cancelar y limpiar los datos
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto bg-white shadow">
      <div className="sticky top-0 z-10 bg-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#0052CC] p-2 ">
            <FileTextOutlined className=" text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#0052CC] text-sm">Proveedor /</span>
            <Title level={3}>
              Crear
            </Title>
          </div>
        </div>
        <Space>
          
          <Button onClick={handleCancel}
            className="bg-transparent border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
            style={{ borderRadius: 2 }} >
            Cancelar
          </Button>
          <Button onClick={handleSave} type="primary" className="bg-[#0052CC]" style={{ borderRadius: 2 }}>
            Guardar
          </Button>
        </Space>
      </div>     
        <Card>
          <Title level={4}> <span style={{ color: 'red' }}>*</span>Datos básicos</Title>
          <Space direction="vertical" size="middle" className="w-full">
            <Row gutter={[24, 16]}>
              {/* Columna 1 (Datos básicos) */}
              <Col span={8}>
                <div>
                  <Text strong className="block mb-1" style={{ color: '#0052CC' }}>
                    Tipo de persona
                  </Text>
                  <Select
                    className="w-full"
                    value={formData.tipoPersona}
                    onChange={(value) => handleTipoPersonaChange(value)}
                  >
                    <Option value="natural">Es persona</Option>
                    <Option value="juridica">Es empresa</Option>
                  </Select>
                </div>


                {/* Tipo de identificación se ajusta según el tipo de persona */}
                <div>
                  <Text strong className="block mb-1" style={{ color: '#0052CC' }}>
                    Tipo de identificación
                  </Text>
                  <Select
                    className="w-full"
                    value={formData.tipoIdentificacion}
                    onChange={(value) => handleInputChange('tipoIdentificacion', value)}
                  >
                    {formData.tipoPersona === 'natural' ? (
                      <Option value="cc">Cédula de ciudadanía</Option>
                    ) : (
                      <Option value="nit">NIT</Option>
                    )}
                  </Select>
                </div>

                {/* Identificación: un solo campo para persona, dos para empresa */}
                {formData.tipoPersona === 'natural' ? (
                  <div>
                    <Text strong className="block mb-1" style={{ color: '#0052CC' }}>
                      <span style={{ color: 'red' }}>*</span>Identificación
                    </Text>
                    <Input
                      placeholder="Numero de Cédula"
                      value={formData.identificacion}
                      onChange={(e) => handleInputChange('identificacion', e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <Text strong className="block mb-1">
                      NIT
                    </Text>
                    <Row gutter={8}>
                      <Col span={16}>
                        <Input
                          placeholder="Número de NIT"
                          value={formData.nit}
                          onChange={(e) => handleInputChange('nit', e.target.value)}
                        />
                      </Col>
                      <Col span={8}>
                        <Input
                          placeholder="DV"
                          value={formData.dv}
                          onChange={(e) => handleInputChange('dv', e.target.value)}
                        />
                      </Col>
                    </Row>
                  </div>
                )}

                <div>
                  <Text strong className="block mb-1" style={{ color: '#0052CC' }}>
                    Código de la sucursal
                  </Text>
                  <Input
                    placeholder="Código de la sucursal"
                    value={formData.codigoSucursal}
                    onChange={(e) => handleInputChange('codigoSucursal', e.target.value)}
                  />
                </div>
              </Col>
              {/* Columna 2 (Datos de contacto) */}
              <Col span={8}>
                <div>
                  <Input
                    placeholder="* Nombres"
                    value={formData.nombresContacto}
                    onChange={(e) => handleInputChange('nombresContacto', e.target.value)}
                    style={{ paddingLeft: '10px' }} // Opcional: para ajustar el padding
                  />
                </div>
                <div>
                  <Input
                    placeholder="* Apellidos"
                    value={formData.apellidosContacto}
                    onChange={(e) => handleInputChange('apellidosContacto', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Nombre comercial"
                    value={formData.nombreComercial}
                    onChange={(e) => handleInputChange('nombreComercial', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Ciudad"
                    value={formData.ciudad}
                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Dirección"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                  />
                </div>
              </Col>

              {/* Columna 3 (Datos para facturación y envío) */}
              <Col span={8}>
                <Title level={4}>Datos para facturación y envio</Title>
                <div>
                  <Input
                    placeholder="Nombres del contacto"
                    value={formData.nombresContactoFacturacion}
                    onChange={(e) => handleInputChange('nombresContactoFacturacion', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Apellidos del contacto"
                    value={formData.apellidosContactoFacturacion}
                    onChange={(e) => handleInputChange('apellidosContactoFacturacion', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Correo electrónico"
                    value={formData.correoElectronicoFacturacion}
                    onChange={(e) => handleInputChange('correoElectronicoFacturacion', e.target.value)}
                    type="email"
                  />
                </div>
                <div>
                  <Text strong className="block mb-1" style={{ color: '#0052CC' }}>
                    Tipo de régimen IVA
                  </Text>
                  <Select
                    className="w-full"
                    value={formData.tipoRegimen}
                    onChange={(value) => handleInputChange('tipoRegimen', value)}
                  >
                    <Option value="regimenComún">Régimen Común</Option>
                    <Option value="regimenSimplificado">Régimen Simplificado</Option>
                  </Select>
                </div>
                <div>
                  <Input
                    placeholder="Número de teléfono"
                    value={formData.telefonoFacturacion}
                    onChange={(e) => handleInputChange('telefonoFacturacion', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Código postal"
                    value={formData.codigoPostal}
                    onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                  />
                </div>
              </Col>
            </Row>
          </Space>
        </Card>
    </div>
  );
};

export default Terceros;