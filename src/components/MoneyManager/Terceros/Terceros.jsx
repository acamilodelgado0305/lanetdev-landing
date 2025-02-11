import React, { useState } from 'react';
import { Info, Plus, X } from 'lucide-react';
import { Card, Form, Input, Select, Radio, Checkbox, Button, Space, Divider, Typography, Row, Col } from 'antd';
import { PlusOutlined, InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Terceros = () => {
  const [tipoTercero, setTipoTercero] = useState(null); // Estado para el tipo de tercero seleccionado

  // Función para manejar la selección del tipo de tercero
  const handleTipoTerceroChange = (value) => {
    setTipoTercero(value);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto bg-white shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="mb-0">
          Crear un tercero
        </Title>
        <Space>
          <Button type="default" className="border-gray-300 text-gray-600">
            Cancelar
          </Button>
          <Button type="primary" className="bg-green-500 text-white">
            Guardar
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
              <Input placeholder="Nombre comercial" />
            </div>
            <div>
              <Text strong className="block mb-1">
                Correo electrónico
              </Text>
              <Input placeholder="Correo electrónico" type="email" />
            </div>
          </Space>
        </Card>
      )}

      {tipoTercero === 'proveedores' && (
        <Card>
          <Title level={4}>Información para Proveedores</Title>
          <Space direction="vertical" size="middle" className="w-full">
            <div>
              <Text strong className="block mb-1">
                RUT del proveedor
              </Text>
              <Input placeholder="RUT" />
            </div>
            <div>
              <Text strong className="block mb-1">
                Producto o servicio ofrecido
              </Text>
              <Input placeholder="Producto o servicio" />
            </div>
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
              <Input placeholder="Número de caja" />
            </div>
            <div>
              <Text strong className="block mb-1">
                Turno asignado
              </Text>
              <Select className="w-full">
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