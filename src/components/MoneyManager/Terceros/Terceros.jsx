import React, { useState, useEffect } from 'react';
import { Info, Plus, X } from 'lucide-react';
import { Button, message, Card, Input, Select, Radio, Space, Row, Col, Typography } from 'antd';
import { RedoOutlined, SaveOutlined } from '@ant-design/icons';
import Swal from "sweetalert2";


const Terceros = () => {
  const [tipoTercero, setTipoTercero] = useState('clientes');
  const [formData, setFormData] = useState({
    tipoTercero: 'clientes',
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

  const handleTipoTerceroChange = (value) => {
    setTipoTercero(value);
    setFormData((prevState) => ({
      ...prevState,
      tipoTercero: value,
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
    setFormData({});
    message.info('La acción ha sido cancelada.');
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto bg-white shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 mr-10">
        <Title level={3} className="mb-0">
          Crear un tercero
        </Title>
        {/* Botones */}
        <Space>
          <Button
            onClick={handleCancel}
            className="bg-transparent border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"

          >
            Cancelar
          </Button>
          <Button onClick={handleSave} type="primary" className="bg-[#007072]" >
            Aceptar
          </Button>
        </Space>

      </div>

      {/* Tipo de tercero */}
      <Card className="mb-6" bordered={false}>
        <Title level={5}>Tipo de tercero</Title>
        <Radio.Group
          value={tipoTercero}
          onChange={(e) => handleTipoTerceroChange(e.target.value)}
          className="w-full"
        >
          <Row gutter={[24, 16]}>
            <Col span={8}>
              <Radio value="clientes" style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div>
                  <div className="font-medium">Clientes</div>
                  <Text type="secondary" className="text-sm">
                    Personas o empresas a las cuales necesitas generarles una cotización y/o una factura de venta
                  </Text>
                </div>
              </Radio>
            </Col>
            <Col span={8}>
              <Radio value="proveedores" style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div>
                  <div className="font-medium">Proveedores</div>
                  <Text type="secondary" className="text-sm">
                    Todas las personas o empresas a las cuales les compras bienes o servicios
                  </Text>
                </div>
              </Radio>
            </Col>
            <Col span={8}>
              <Radio value="cajero" style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div>
                  <div className="font-medium">Cajero</div>
                  <Text type="secondary" className="text-sm">
                    Información específica para cajeros
                  </Text>
                </div>
              </Radio>
            </Col>
          </Row>
        </Radio.Group>
      </Card>

      {/* Renderizado condicional según el tipo de tercero */}
      {tipoTercero === 'clientes' && (
        <Card>
          <Title level={4}>Información para Clientes</Title>
          <Space direction="vertical" size="middle" className="w-full">
            <div>
              <Text strong className="block mb-1">
                Nombre comercial
              </Text>
              <Input
                placeholder="Nombre comercial"
                value={formData.nombreComercial}
                onChange={(e) => handleInputChange('nombreComercial', e.target.value)}
              />
            </div>
            <div>
              <Text strong className="block mb-1">
                Correo electrónico
              </Text>
              <Input
                placeholder="Correo electrónico"
                value={formData.correoElectronico}
                onChange={(e) => handleInputChange('correoElectronico', e.target.value)}
                type="email"
              />
            </div>
          </Space>
        </Card>
      )}

      {tipoTercero === 'proveedores' && (
        <Card>
          <Title level={4}>Datos básicos</Title>
          <Space direction="vertical" size="middle" className="w-full">
            <Row gutter={[24, 16]}>
              {/* Columna 1 (Datos básicos) */}
              <Col span={8}>
                <div>
                  <Text strong className="block mb-1">
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
                  <Text strong className="block mb-1">
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
                    <Text strong className="block mb-1">
                      Identificación
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
                  <Text strong className="block mb-1">
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
                    placeholder="Nombres"
                    value={formData.nombresContacto}
                    onChange={(e) => handleInputChange('nombresContacto', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Apellidos"
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
                  <Text strong className="block mb-1">
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
      )}


      {tipoTercero === 'cajero' && (
        <Card>
          <Title level={4}>Información para Cajeros</Title>
          <Space direction="vertical" size="middle" className="w-full">
            <div>
              <Text strong className="block mb-1">
                Número de caja
              </Text>
              <Input
                placeholder="Número de caja"
                value={formData.numeroCaja}
                onChange={(e) => handleInputChange('numeroCaja', e.target.value)}
              />
            </div>
            <div>
              <Text strong className="block mb-1">
                Turno asignado
              </Text>
              <Select
                className="w-full"
                value={formData.turnoAsignado}
                onChange={(value) => handleInputChange('turnoAsignado', value)}
              >
                <Option value="mañana">Mañana</Option>
                <Option value="tarde">Tarde</Option>
                <Option value="noche">Noche</Option>
              </Select>
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default Terceros;
