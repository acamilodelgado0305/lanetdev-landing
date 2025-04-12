import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Input, Select, DatePicker, Button, message } from 'antd';
import { CheckCircleOutlined, CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const { Text } = Typography;

const apiUrl = import.meta.env.VITE_API_FINANZAS;

const ComprobanteEgresoHeader = ({
  facturaNumber,
  setFacturaNumber,
  facturaProvNumber,
  setFacturaProvNumber,
  facturaProvPrefix,
  setFacturaProvPrefix,
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
  onEtiquetaChange,
  etiqueta, // Nueva prop para recibir la etiqueta inicial
}) => {
  const [creandoEtiqueta, setCreandoEtiqueta] = useState(false);
  const [etiquetaVerificada, setEtiquetaVerificada] = useState(false);
  const [etiquetasExistentes, setEtiquetasExistentes] = useState([]);
  const [etiquetaSeguimientoNombre, setEtiquetaSeguimientoNombre] = useState(etiqueta || '');
  const [etiquetaSeguimientoCategoria, setEtiquetaSeguimientoCategoria] = useState(null);
  const [etiquetaPrevia, setEtiquetaPrevia] = useState(null);

  const getProveedorIdentificacion = (provId) => {
    const prov = proveedores.find((p) => p.id === provId);
    return prov ? prov.numero_identificacion || 'N/A' : 'N/A';
  };

  const categoriasSeguimiento = [
    'Flota de Vehículos',
    'Proyectos',
   
  ];

  // Sincronizar etiquetaSeguimientoNombre con la prop etiqueta
  useEffect(() => {
    setEtiquetaSeguimientoNombre(etiqueta || '');
  }, [etiqueta]);

  useEffect(() => {
    const fetchEtiquetas = async () => {
      try {
        const response = await axios.get(`${apiUrl}/etiquetas`);
        setEtiquetasExistentes(response.data || []);
      } catch (error) {
        message.error('Error al obtener las etiquetas.');
        console.error('Error en fetchEtiquetas:', error.message, error.response?.data);
      }
    };
    fetchEtiquetas();
  }, []);

  const crearEtiqueta = async () => {
    if (!etiquetaSeguimientoNombre || !etiquetaSeguimientoCategoria) {
      message.error('Por favor, completa el nombre y la categoría de la etiqueta.');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/etiquetas`, {
        nombre: etiquetaSeguimientoNombre,
        categoria: etiquetaSeguimientoCategoria,
      });

      if (response.status === 201) {
        message.success('Etiqueta creada exitosamente.');
        setEtiquetaVerificada(true);
        setEtiquetasExistentes([...etiquetasExistentes, response.data]);
        setCreandoEtiqueta(false);
        setEtiquetaSeguimientoNombre(response.data.nombre);
        setEtiquetaPrevia(null);
        onEtiquetaChange(response.data.nombre);
      }
    } catch (error) {
      console.error('Error en crearEtiqueta:', error.message, error.response?.data);
      if (error.response?.status === 409) {
        message.error('La etiqueta ya existe.');
      } else {
        message.error('Error al conectar con la API de etiquetas.');
      }
    }
  };

  const cancelarCreacion = () => {
    setCreandoEtiqueta(false);
    setEtiquetaVerificada(false);
    setEtiquetaSeguimientoNombre(etiquetaPrevia || etiqueta || '');
    setEtiquetaSeguimientoCategoria(null);
    onEtiquetaChange(etiquetaPrevia || etiqueta || '');
  };

  const handleEtiquetaChange = (value) => {
    if (value === 'crear') {
      setCreandoEtiqueta(true);
      setEtiquetaVerificada(false);
      setEtiquetaPrevia(etiquetaSeguimientoNombre);
      setEtiquetaSeguimientoNombre('');
      setEtiquetaSeguimientoCategoria(null);
    } else {
      setCreandoEtiqueta(false);
      setEtiquetaVerificada(false);
      setEtiquetaSeguimientoNombre(value);
      setEtiquetaSeguimientoCategoria(null);
      onEtiquetaChange(value);
    }
  };

  return (
    <div className="bg-white shadow-sm px-6 py-2 mb-6">
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
              maxLength={5}
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

        <Col span={8}>
          <Text className="text-gray-700 font-medium block mb-1">No. Identificación Proveedor</Text>
          <Input
            value={getProveedorIdentificacion(proveedor)}
            disabled
            className="w-full h-9 border-gray-300 rounded-md bg-gray-100 text-gray-600"
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

        <Col span={8}>
          <Text className="text-gray-700 font-medium block mb-1">Etiqueta de Seguimiento</Text>
          {creandoEtiqueta ? (
            <div className="flex items-center">
              <Input
                value={etiquetaSeguimientoNombre}
                onChange={(e) => {
                  setEtiquetaSeguimientoNombre(e.target.value);
                  setEtiquetaVerificada(false);
                }}
                placeholder="Ej: Suzuki Jimmy"
                className="w-4/12 h-9 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 mr-2"
              />
              <Select
                value={etiquetaSeguimientoCategoria}
                onChange={(value) => {
                  setEtiquetaSeguimientoCategoria(value);
                  setEtiquetaVerificada(false);
                }}
                placeholder="Categoría"
                className="w-4/12 h-9 mr-2"
                allowClear
              >
                {categoriasSeguimiento.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    {cat}
                  </Select.Option>
                ))}
              </Select>
              <Button
                icon={
                  etiquetaVerificada ? (
                    <CheckCircleFilled style={{ color: '#52c41a' }} />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
                onClick={crearEtiqueta}
                disabled={etiquetaVerificada}
                className="h-9 mr-2"
              />
              <Button
                icon={<CloseCircleOutlined />}
                onClick={cancelarCreacion}
                className="h-9"
              />
            </div>
          ) : (
            <Select
              value={etiquetaSeguimientoNombre || undefined}
              onChange={handleEtiquetaChange}
              placeholder="Selecciona una etiqueta"
              className="w-full h-9"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {etiquetasExistentes.map((etiqueta) => (
                <Select.Option key={etiqueta.nombre} value={etiqueta.nombre}>
                  {etiqueta.nombre}
                </Select.Option>
              ))}
              <Select.Option key="crear" value="crear">
                + Crear Etiqueta
              </Select.Option>
            </Select>
          )}
        </Col>
      </Row>

      <Row gutter={[16, 8]} className="p-4 border-t border-gray-200">
        <Col xs={24} md={12}>
          <div className="">
            <Text className="text-gray-700 font-medium block mb-1">Título</Text>
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
            <Text className="text-gray-700 font-medium block">Tipo de Egreso</Text>
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
                <Text className="text-gray-700 font-medium block">Categoría Contable</Text>
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