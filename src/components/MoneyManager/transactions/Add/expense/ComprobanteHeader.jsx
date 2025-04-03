import React from 'react';
import { Row, Col, Typography, Input, Select, Divider, DatePicker, Space } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ComprobanteEgresoHeader = ({
  facturaNumber,
  setFacturaNumber,
  facturaProvNumber,
  setFacturaProvNumber,
  description,
  setDescription,
  tipo,
  setTipo,
  date,
  setDate,
  proveedor,
  handleProveedorChange,
  proveedores,
  categoria,
  setCategoria,
  categorias,
  isHiddenDetails,
}) => {
  const [prefix, setPrefix] = React.useState('');
  const [number, setNumber] = React.useState('');

  React.useEffect(() => {
    setFacturaProvNumber(`${prefix}-${number}`);
  }, [prefix, number, setFacturaProvNumber]);

  const getProveedorIdentificacion = (provId) => {
    const prov = proveedores.find((p) => p.id === provId);
    return prov ? prov.numero_identificacion || 'N/A' : 'N/A';
  };

  return (
    <div className="bg-white  border-gray-200  p-8 mb-6 font-sans">
      {/* Header Section */}
      <Row justify="space-between" align="middle" className="mb-6 pb-4 border-b border-gray-200">
        <Col>
          <Title level={3} className="text-gray-800 font-bold uppercase m-0 tracking-wide">
            Comprobante de Egreso
          </Title>
          <Text className="text-gray-500 text-sm">Documento de Registro de Pagos</Text>
        </Col>
        <Col>
          <div className="text-right">
            <Text className="text-gray-700 font-semibold block mb-2">Fecha de Emisión</Text>
            <DatePicker
              value={date}
              onChange={(value) => setDate(value || dayjs())}
              format="DD/MM/YYYY HH:mm"
              showTime={{ format: 'HH:mm' }}
              className="w-64 h-10 px-3 text-gray-700 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-500"
            />
          </div>
        </Col>
      </Row>

      {/* Main Content */}
      <Row justify="space-between" align="top">
        {/* Left Column: Description and Details */}
        <Col span={18}>
          <div className="mb-4 bg-gray-50 p-4 rounded-md border border-gray-100">
            <Text className="text-gray-700 font-semibold block mb-2">Descripción del Egreso</Text>
            <Input.TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pago de servicios públicos, especificar detalles del egreso"
              className="w-full h-20 px-3 py-2 text-gray-700 border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-500 
                         transition-all duration-200 resize-y"
              rows={3}
            />
          </div>
          <Row gutter={[16, 16]}>
            <Col style={{ width: '12em' }}>
              <Text className="text-gray-700 font-semibold block mb-2">Tipo de Egreso</Text>
              <Select
                value={tipo}
                onChange={(value) => setTipo(value)}
                className="w-full h-10"
                placeholder="Selecciona un tipo"
              >
                <Select.Option value="Legal">Legal</Select.Option>
                <Select.Option value="Diverso">Diverso</Select.Option>
              </Select>
            </Col>
            {!isHiddenDetails && (
              <Col style={{ width: '18em' }}>
                <Text className="text-gray-700 font-semibold block mb-2">Categoría Contable</Text>
                <Select
                  value={categoria}
                  onChange={(value) => setCategoria(value)}
                  className="w-full h-10"
                  placeholder="Selecciona una categoría"
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <Divider style={{ margin: '4px 0' }} />
                      <div
                        style={{ padding: '8px', textAlign: 'center', cursor: 'pointer' }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => console.log('Redirigiendo a crear categoría...')}
                      >
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          + Nueva Categoría
                        </Text>
                      </div>
                    </div>
                  )}
                >
                  {Array.isArray(categorias) &&
                    categorias.map((cat) => (
                      <Select.Option key={cat.id} value={cat.name}>
                        {cat.name}
                      </Select.Option>
                    ))}
                </Select>
              </Col>
            )}
            <Col style={{ width: isHiddenDetails ? '32em' : '20em' }}>
              <Text className="text-gray-700 font-semibold block mb-2">Proveedor</Text>
              <Select
                value={proveedor}
                onChange={handleProveedorChange}
                className="w-full h-10"
                placeholder="Selecciona un proveedor"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {Array.isArray(proveedores) &&
                  proveedores.map((provider) => (
                    <Select.Option key={provider.id} value={provider.id}>
                      {provider.nombre_comercial}
                    </Select.Option>
                  ))}
              </Select>
              <div className="mt-2">
                <Text className="text-gray-600 font-medium block mb-1">No. Identificación</Text>
                <Input
                  value={getProveedorIdentificacion(proveedor)}
                  disabled
                  className="w-40 h-10 bg-gray-100 text-gray-600 border border-gray-300 rounded-md"
                />
              </div>
            </Col>
          </Row>
        </Col>

        {/* Right Column: Numbers */}
        <Col span={5} offset={1}>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-100 h-full">
            <Space direction="vertical" size={12}>
              <div>
                <Text className="text-gray-700 font-semibold block mb-2">No. Comprobante</Text>
                <Input
                  value={facturaNumber}
                  onChange={(e) => setFacturaNumber(e.target.value)}
                  placeholder="CE-0001"
                  className="w-full h-10 px-3 text-gray-700 border border-gray-300 rounded-md 
                             focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-500"
                />
              </div>
              <div>
                <Text className="text-gray-700 font-semibold block mb-2">No. Factura Proveedor</Text>
                <Space size={4}>
                  <Input
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="Pref"
                    className="w-[1em] h-10 px-2 text-gray-700 border border-gray-300 rounded-md 
                               focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-500"
                  />
                  <Input
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Num"
                    className="w-14 h-10 px-2 text-gray-700 border border-gray-300 rounded-md 
                               focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-500"
                  />
                </Space>
              </div>
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ComprobanteEgresoHeader;