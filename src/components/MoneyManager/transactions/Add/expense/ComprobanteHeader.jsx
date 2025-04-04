import React from 'react';
import { Row, Col, Typography, Input, Select, Divider, DatePicker, Tag } from 'antd';
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
  // Función para obtener el número de identificación del proveedor
  const getProveedorIdentificacion = (provId) => {
    const prov = proveedores.find((p) => p.id === provId);
    return prov ? prov.numero_identificacion || 'N/A' : 'N/A';
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 mb-6">
      {/* Encabezado Empresarial */}
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <div className="flex items-center gap-4">
            {/* Logo (Opcional, descomentarlo si tienes uno) */}
            {/* <img src={logoPlaceholder} alt="Logo Empresa" className="h-12 w-12 object-contain" /> */}
            <div>
              <Title level={3} className="text-gray-900 font-semibold m-0">
                COMPROBANTE DE EGRESO
              </Title>
            </div>
          </div>
        </Col>
        
      </Row>

      {/* Primera Sección: Números de Factura */}
      <Row gutter={[16, 8]} className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
        <Col span={8}>
          <Text className="text-gray-700 font-medium block mb-1">No. Comprobante</Text>
          <Input
            value={facturaNumber}
            onChange={(e) => setFacturaNumber(e.target.value)}
            placeholder="Ej: CE-0001"
            className="w-full h-9 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </Col>
        <Col span={8}>
          <Text className="text-gray-700 font-medium block mb-1">No. Factura Proveedor</Text>
          <Input
            value={facturaProvNumber}
            onChange={(e) => setFacturaProvNumber(e.target.value)}
            placeholder="Ej: FP-1234"
            className="w-full h-9 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </Col>
        <Col span={8}>
          <Text className="text-gray-700 font-medium block mb-1">Fecha de Emisión</Text>
          <DatePicker
            value={date}
            onChange={(value) => setDate(value || dayjs())}
            format="DD/MM/YYYY HH:mm"
            showTime
            placeholder="Selecciona fecha y hora"
            className="w-full h-9 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </Col>
      </Row>

      {/* Segunda Sección: Detalles del Comprobante */}
      <Row gutter={[16, 8]} className="p-4 border-t border-gray-200">
        <Col xs={24} md={12}>
          <div className="mb-3">
            <Text className="text-gray-700 font-medium block mb-1">Descripción</Text>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pago de servicios públicos"
              className="w-full h-9 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>
          <div className="mb-3">
            <Text className="text-gray-700 font-medium block mb-1">Tipo de Egreso</Text>
            <Select
              value={tipo}
              onChange={(value) => setTipo(value)}
              className="w-full h-9"
              placeholder="Selecciona un tipo"
            >
              <Select.Option value="Legal">Legal</Select.Option>
              <Select.Option value="Diverso">Diverso</Select.Option>
              <Select.Option value="Operativo">Operativo</Select.Option>
              <Select.Option value="Inversión">Inversión</Select.Option>
            </Select>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className="mb-3">
            <Text className="text-gray-700 font-medium block mb-1">Proveedor</Text>
            <Select
              value={proveedor}
              onChange={handleProveedorChange}
              className="w-full h-9"
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
          </div>

          <div className="mb-3">
            <Text className="text-gray-700 font-medium block mb-1">Proveedor</Text>
            <Select
              value={proveedor}
              onChange={handleProveedorChange}
              className="w-full h-9"
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
          </div>
          <div className="mb-3">
            <Text className="text-gray-700 font-medium block mb-1">No. Identificación Proveedor</Text>
            <Input
              value={getProveedorIdentificacion(proveedor)}
              disabled
              className="w-full h-9 border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>
          {!isHiddenDetails ? (
            <div className="mb-3">
              <Text className="text-gray-700 font-medium block mb-1">Categoría Contable</Text>
              <Select
                value={categoria}
                onChange={(value) => setCategoria(value)}
                className="w-full h-9"
                placeholder="Selecciona una categoría"
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '8px',
                        cursor: 'pointer',
                      }}
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
            </div>
          ) : (
            // Placeholder invisible para mantener el tamaño
            <div className="mb-3" style={{ height: '72px' }}></div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ComprobanteEgresoHeader;