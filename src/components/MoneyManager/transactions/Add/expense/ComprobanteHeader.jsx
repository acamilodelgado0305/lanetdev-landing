import React from 'react';
import { Row, Col, Typography, Input, Select, DatePicker, Tag } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ComprobanteEgresoHeader = ({
  facturaNumber,
  setFacturaNumber,
  facturaProvNumber,
  setFacturaProvNumber,
  facturaProvPrefix, // Nuevo prop para el prefijo
  setFacturaProvPrefix, // Nuevo prop para manejar el prefijo
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
  handleCategoriaChange,
}) => {
  // Función para obtener el número de identificación del proveedor
  const getProveedorIdentificacion = (provId) => {
    const prov = proveedores.find((p) => p.id === provId);
    return prov ? prov.numero_identificacion || 'N/A' : 'N/A';
  };

  return (
    <div className="bg-white shadow-sm px-6 py-2 mb-6">


      {/* Primera Sección: Números de Factura */}
      <Row gutter={[16, 8]} className="px-4 rounded-md mb-4">

        
      <Col span={8}>
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
      </Col>
        


        
        <Col span={8}>
          <Text className="text-gray-700 font-medium block mb-1">No. Factura Proveedor</Text>
          <div className="flex items-center">
            <Input
              value={facturaProvPrefix}
              onChange={(e) => setFacturaProvPrefix(e.target.value)}
              placeholder="Prefijo"
              className="w-1/3 h-9 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 mr-2"
              maxLength={5} // Opcional: limita la longitud del prefijo
            />
            <span className="text-gray-500 mx-1">-</span>
            <Input
              value={facturaProvNumber}
              onChange={(e) => setFacturaProvNumber(e.target.value)}
              placeholder="Ej: 1234"
              className="w-2/3 h-9 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>

          
        </Col>

        <Col span={8}>
          <Text className="text-gray-700 font-medium block mb-1">No. Comprobante</Text>
          <Input
            value={facturaNumber}
            onChange={(e) => setFacturaNumber(e.target.value)}
            placeholder="Ej: CE-0001"
            className="w-full h-9 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
        </Col>
        <div className="mb-3">
            <Text className="text-gray-700 font-medium block mb-1">No. Identificación Proveedor</Text>
            <Input
              value={getProveedorIdentificacion(proveedor)}
              disabled
              className="w-full h-9 border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>

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

      {/* Resto del código sigue igual */}
      <Row gutter={[16, 8]} className="p-4 border-t border-gray-200">
        <Col xs={24} md={12}>
          <div className="">
            <Text className="text-gray-700 font-medium block mb-1">Titúlo</Text>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Pago de servicios públicos"
              className="w-full h-9 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>
         
        </Col>
        <Col xs={24} md={12}>


    

          <div className="mb-3">
            <Text className="text-gray-700 font-medium block ">Tipo de Egreso</Text>
            <Select
              value={tipo}
              onChange={(value) => setTipo(value)}
              className="w-full h-9"
              placeholder="Selecciona un tipo"
            >
              <Select.Option value="Legal">Legal</Select.Option>
              <Select.Option value="Diverso">Diverso</Select.Option>
            </Select>

            {!isHiddenDetails ? (
              <div className="mb-3">
                <Text className="text-gray-700 font-medium block ">Categoría Contable</Text>
                <Select
                  value={categoria}
                  onChange={(value) => setCategoria(value)}
                  className="w-full h-9"
                  placeholder="Selecciona una categoría"
                  showSearch
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                    
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
              <div className="mb-3" style={{ height: '72px' }}></div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ComprobanteEgresoHeader;