import React, { useState } from 'react';
import { Info, Plus, X } from 'lucide-react';
import { Card, Form, Input, Select, Radio, Checkbox, Button, Space, Divider, Typography, Row, Col } from 'antd';
import { PlusOutlined, InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const Terceros = () => {
  const [tipoTercero, setTipoTercero] = useState({
    clientes: false,
    proveedores: false,
    otros: false,
  });

  return (
    <div className="p-6 max-w-[1200px] mx-auto bg-white  shadow">
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
       <Card 
            className="mb-6" 
            bordered={false} 
         
          >
            <Title level={5}>Tipo de tercero</Title>
            <Space direction="vertical" className="w-full">
              <Checkbox.Group className="w-full">
                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <Checkbox value="clientes" style={{display: 'flex', alignItems: 'flex-start'}}>
                      <div>
                        <div className="font-medium">Clientes</div>
                        <Text type="secondary" className="text-sm">
                          Personas o empresas a las cuales necesitas generarles una cotización y/o una factura de venta
                        </Text>
                      </div>
                    </Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="proveedores" style={{display: 'flex', alignItems: 'flex-start'}}>
                      <div>
                        <div className="font-medium">Proveedores</div>
                        <Text type="secondary" className="text-sm">
                          Todas las personas o empresas a las cuales les compras bienes o servicios
                        </Text>
                      </div>
                    </Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox value="otros" style={{display: 'flex', alignItems: 'flex-start'}}>
                      <div>
                        <div className="font-medium">Otros</div>
                        <Text type="secondary" className="text-sm">
                          Por ejemplo: Fondos de salud y pensión, bancos, etc.
                        </Text>
                      </div>
                    </Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Space>
          </Card>

      <div className="grid grid-cols-2 gap-8">
        {/* Datos básicos */}
        <Card>
          <Title level={4} className="flex items-center gap-2">
            Datos básicos <Text type="danger">*</Text>
          </Title>
          <Space direction="vertical" size="middle" className="w-full">
            <div>
              <Text strong className="block mb-1">
                Tipo
              </Text>
              <Select className="w-full">
                <Option value="persona">Es persona</Option>
                <Option value="empresa">Es empresa</Option>
              </Select>
            </div>

            <div>
              <Text strong className="block mb-1">
                Tipo de identificación
              </Text>
              <Select className="w-full">
                <Option value="cc">Cédula de ciudadanía</Option>
                <Option value="nit">NIT</Option>
                <Option value="pasaporte">Pasaporte</Option>
              </Select>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Text strong className="block mb-1">
                  Identificación <Text type="danger">*</Text>
                </Text>
                <Input placeholder="Identificación" />
              </div>
              <div>
                <Text strong className="block mb-1">
                  DV
                </Text>
                <Input placeholder="DV" style={{ width: '80px' }} />
              </div>
            </div>

            <div>
              <Text strong className="block mb-1">
                Nombres <Text type="danger">*</Text>
              </Text>
              <Input placeholder="Nombres" />
            </div>

            <div>
              <Text strong className="block mb-1">
                Apellidos <Text type="danger">*</Text>
              </Text>
              <Input placeholder="Apellidos" />
            </div>

            <div>
              <Text strong className="block mb-1">
                Nombre comercial
              </Text>
              <Input placeholder="Nombre comercial" />
            </div>

            <div>
              <Text strong className="block mb-1">
                Dirección
              </Text>
              <Input placeholder="Dirección" />
            </div>

            <div>
              <Text strong className="block mb-1">
                Teléfono
              </Text>
              <Space>
                <Input placeholder="Indicativo" style={{ width: '80px' }} />
                <Input placeholder="# de Teléfono" />
                <Input placeholder="Extensión" style={{ width: '100px' }} />
                <Button type="text" danger icon={<X className="w-4 h-4" />} />
              </Space>
            </div>

            <Button type="link" icon={<Plus className="w-4 h-4" />} className="text-green-500">
              Agregar otro Teléfono
            </Button>
          </Space>
        </Card>

        {/* Datos para facturación y envío */}
        <Card>
          <Title level={4} className="flex items-center gap-2">
            Datos para facturación y envío <Info className="w-4 h-4 text-gray-400" />
          </Title>
          <Space direction="vertical" size="middle" className="w-full">
            <div>
              <Text strong className="block mb-1">
                Nombres del contacto
              </Text>
              <Input placeholder="Nombres del contacto" />
            </div>

            <div>
              <Text strong className="block mb-1">
                Apellidos del contacto
              </Text>
              <Input placeholder="Apellidos del contacto" />
            </div>

            <div>
              <Text strong className="block mb-1">
                Correo electrónico cuando aplique
              </Text>
              <Input placeholder="Correo electrónico" type="email" />
            </div>

            <div>
              <Text strong className="block mb-1">
                Tipo de régimen IVA
              </Text>
              <Select className="w-full" placeholder="Seleccione...">
                <Option value="1">Régimen 1</Option>
                <Option value="2">Régimen 2</Option>
              </Select>
            </div>

            <div>
              <Text strong className="block mb-1">
                Responsabilidad fiscal
              </Text>
              <Radio.Group>
                <Space direction="vertical">
                  {[
                    'O-13 Gran contribuyente',
                    'O-15 Autorretenedor',
                    'O-23 Agente de retención IVA',
                    'O-47 Régimen simple de tributación',
                    'R-99-PN No aplica - Otros',
                  ].map((option) => (
                    <Radio key={option} value={option}>
                      {option}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Terceros;