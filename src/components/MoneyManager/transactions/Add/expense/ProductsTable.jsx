import React, { useState, useEffect, useRef } from 'react';
import { Table, Select, Input, Button, Divider, Checkbox } from 'antd';
import { getCategorias } from "../../../../../services/moneymanager/moneyService";

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const ProductsTable = ({ onDataChange, onHiddenDetailsChange, initialData = [] }) => {
  const [hasPercentageDiscount, setHasPercentageDiscount] = useState(false);
  const [hiddenDetails, setHiddenDetails] = useState(false);
  const [hiddenImpuestos, setHiddenImpuestos] = useState(false);
  const [categorias, setCategorias] = useState([]);

  // Usar useRef para rastrear si los datos iniciales ya fueron cargados
  const isInitialDataLoaded = useRef(false);
  // Usar useRef para almacenar la última versión de initialData y evitar actualizaciones innecesarias
  const prevInitialData = useRef(initialData);

  // Estado inicial de los ítems basado en initialData
  const [items, setItems] = useState(() => {
    if (initialData.length > 0) {
      isInitialDataLoaded.current = true;
      return initialData.map(item => ({
        ...item,
        key: item.id || `${Date.now()}-${Math.random()}`,
      }));
    }
    return [{
      key: '1',
      type: 'Gasto',
      provider: '',
      product: '',
      description: '',
      quantity: 1.00,
      unitPrice: 0.00,
      purchaseValue: 0.00,
      discount: 0.00,
      taxCharge: 0.00,
      taxWithholding: 0.00,
      total: 0.00,
      categoria: "",
    }];
  });

  const [totals, setTotals] = useState({
    totalBruto: 0,
    descuentos: 0,
    subtotal: 0,
    iva: 0,
    retencion: 0,
    totalNeto: 0,
    ivaPercentage: "0",
    retencionPercentage: "0",
    totalImpuestos: 0
  });

  // Cargar categorías al montar el componente
  useEffect(() => {
    const ObtenerCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (err) {
        console.error("Error al cargar las categorías:", err);
      }
    };
    ObtenerCategorias();
  }, []);

  // Sincronizar ítems con initialData cuando cambie, pero solo si no se han hecho cambios locales
  useEffect(() => {
    // Comparar profundamente initialData con prevInitialData para evitar actualizaciones innecesarias
    if (JSON.stringify(initialData) !== JSON.stringify(prevInitialData.current)) {
      // Actualizar ítems solo si no se han hecho cambios locales (es decir, si es la carga inicial)
      if (!isInitialDataLoaded.current || initialData.length > 0) {
        setItems(initialData.map(item => ({
          ...item,
          key: item.id || `${Date.now()}-${Math.random()}`,
        })));
        isInitialDataLoaded.current = true;
      }
      prevInitialData.current = initialData;
    }
  }, [initialData]);

  // Notificar cambios al componente padre
  useEffect(() => {
    if (onDataChange) {
      const validItems = items.filter(item =>
        item.product !== '' ||
        item.description !== '' ||
        item.unitPrice > 0 ||
        item.quantity > 0
      );
      onDataChange({
        items: validItems,
        totals
      });
    }
  }, [items, totals, onDataChange]);

  // Notificar cambios en hiddenDetails
  useEffect(() => {
    if (onHiddenDetailsChange) {
      onHiddenDetailsChange(hiddenDetails);
    }
  }, [hiddenDetails, onHiddenDetailsChange]);

  // Calcular el total de un ítem
  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const discount = parseFloat(item.discount) || 0;
    const taxCharge = hiddenImpuestos ? 0 : parseFloat(item.taxCharge) || 0;
    const taxWithholding = hiddenImpuestos ? 0 : parseFloat(item.taxWithholding) || 0;

    const itemBruto = quantity * unitPrice;
    const discountAmount = hasPercentageDiscount
      ? itemBruto * (discount / 100)
      : discount;
    const itemSubtotal = itemBruto - discountAmount;
    const taxChargeAmount = itemSubtotal * (taxCharge / 100);
    const taxWithholdingAmount = itemSubtotal * (taxWithholding / 100);

    return itemSubtotal + taxChargeAmount - taxWithholdingAmount;
  };

  // Calcular totales generales
  useEffect(() => {
    const newTotals = items.reduce((acc, item) => {
      const totalItem = calculateItemTotal(item);
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const discount = parseFloat(item.discount) || 0;

      const itemBruto = quantity * unitPrice;
      const itemDiscount = hasPercentageDiscount
        ? itemBruto * (discount / 100)
        : discount;

      acc.totalBruto += itemBruto;
      acc.descuentos += itemDiscount;

      return acc;
    }, {
      totalBruto: 0,
      descuentos: 0
    });

    const subtotal = newTotals.totalBruto - newTotals.descuentos;
    const iva = hiddenImpuestos ? subtotal * (parseFloat(totals.ivaPercentage) / 100) : items.reduce((acc, item) => acc + (parseFloat(item.taxCharge) || 0) * (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0) / 100, 0);
    const retencion = hiddenImpuestos ? subtotal * (parseFloat(totals.retencionPercentage) / 100) : items.reduce((acc, item) => acc + (parseFloat(item.taxWithholding) || 0) * (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0) / 100, 0);
    const totalNeto = subtotal + iva - retencion;
    const totalImpuestos = iva - retencion;

    setTotals({
      ...totals,
      totalBruto: newTotals.totalBruto,
      descuentos: newTotals.descuentos,
      subtotal: subtotal,
      iva: iva,
      retencion: retencion,
      totalNeto: totalNeto,
      totalImpuestos: totalImpuestos
    });
  }, [items, hasPercentageDiscount, totals.ivaPercentage, totals.retencionPercentage, hiddenImpuestos]);

  const handleAddRow = () => {
    const newKey = `${Date.now()}-${Math.random()}`;
    setItems([...items, {
      key: newKey,
      type: 'Gasto',
      provider: '',
      product: '',
      description: '',
      quantity: 1.00,
      unitPrice: 0.00,
      purchaseValue: 0.00,
      discount: 0.00,
      taxCharge: 0.00,
      taxWithholding: 0.00,
      total: 0.00,
      categoria: "",
    }]);
  };

  const handleDeleteRow = (key) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.key !== key));
    }
  };

  const handleValueChange = (key, field, value) => {
    setItems(items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.total = calculateItemTotal(updatedItem);
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRetentionChange = (type, value) => {
    setTotals(prev => ({
      ...prev,
      [`${type}Percentage`]: value
    }));
  };

  const columns = [
    {
      title: '# Tipo',
      dataIndex: 'type',
      width: 120,
      render: (text, record) => (
        <Select
          value={text}
          style={{ width: '100%' }}
          onChange={(value) => handleValueChange(record.key, 'type', value)}
        >
          <Select.Option value="Producto">Producto</Select.Option>
          <Select.Option value="Activo">Activo</Select.Option>
          <Select.Option value="Gasto">Gasto</Select.Option>
        </Select>
      )
    },
    ...(hiddenDetails
      ? [
          {
            title: 'Categoría',
            dataIndex: 'categoria',
            width: 120,
            render: (text, record) => {
              const usedCategories = items
                .filter(item => item.key !== record.key)
                .map(item => item.categoria);
              const availableCategorias = categorias.filter(cat =>
                !usedCategories.includes(cat.id)
              );

              return (
                <Select
                  value={record.categoria}
                  onChange={(value) => handleValueChange(record.key, 'categoria', value)}
                  className="w-[8em]"
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
                        onClick={() => {
                          console.log("Redirigiendo a crear categoría...");
                        }}
                      >
                        Crear categoría
                      </div>
                    </div>
                  )}
                >
                  {availableCategorias.map((cat) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Select.Option>
                  ))}
                </Select>
              );
            },
          }
        ]
      : []),
    {
      title: 'Producto',
      dataIndex: 'product',
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'product', e.target.value)}
          placeholder="Buscar"
        />
      )
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      render: (text, record) => (
        <Input
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'description', e.target.value)}
        />
      )
    },
    {
      title: 'Cant',
      dataIndex: 'quantity',
      width: 100,
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'quantity', e.target.value)}
        />
      )
    },
    {
      title: 'Valor Unitario',
      dataIndex: 'unitPrice',
      width: 120,
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'unitPrice', e.target.value)}
        />
      )
    },
    {
      title: 'Descuento',
      dataIndex: 'discount',
      width: 120,
      render: (text, record) => (
        <Input
          type="number"
          value={text}
          style={{ width: '100%' }}
          onChange={(e) => handleValueChange(record.key, 'discount', e.target.value)}
          suffix={hasPercentageDiscount ? '%' : ''}
        />
      )
    },
    ...(!hiddenImpuestos
      ? [
          {
            title: 'Impuesto Cargo',
            dataIndex: 'taxCharge',
            width: 120,
            render: (text, record) => (
              <Select
                value={text}
                style={{ width: '100%' }}
                onChange={(value) => handleValueChange(record.key, 'taxCharge', value)}
              >
                <Select.Option value="19">IVA 19%</Select.Option>
                <Select.Option value="5">IVA 5%</Select.Option>
                <Select.Option value="0">IVA 0%</Select.Option>
                <Select.Option value="8">Ipoconsumo 8%</Select.Option>
              </Select>
            )
          },
          {
            title: 'Impuesto Retención',
            dataIndex: 'taxWithholding',
            width: 120,
            render: (text, record) => (
              <Select
                value={text}
                style={{ width: '100%' }}
                onChange={(value) => handleValueChange(record.key, 'taxWithholding', value)}
              >
                <Select.Option value="11">Rete 11%</Select.Option>
                <Select.Option value="10">Rete 10%</Select.Option>
                <Select.Option value="7">Rete 7%</Select.Option>
                <Select.Option value="6">Rete 6%</Select.Option>
                <Select.Option value="4">Rete 4%</Select.Option>
                <Select.Option value="3.5">Rete 3.5%</Select.Option>
                <Select.Option value="2.5">Rete 2.5%</Select.Option>
                <Select.Option value="2">Rete 2%</Select.Option>
                <Select.Option value="1">Rete 1%</Select.Option>
                <Select.Option value="0">Rete 0%</Select.Option>
              </Select>
            )
          }
        ]
      : []),
    {
      title: 'Valor Total',
      dataIndex: 'total',
      width: 120,
      render: (text) => formatCurrency(text)
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          danger
          style={{ width: '100%' }}
          onClick={() => handleDeleteRow(record.key)}
        >
          Eliminar
        </Button>
      )
    }
  ];

  const renderSummary = () => {
    return (
      <div style={{ marginTop: '16px', width: '100%', maxWidth: '400px', marginLeft: 'auto' }}>
        <div style={{ border: '1px solid #f0f0f0', padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Total Bruto:</div>
            <div style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(totals.totalBruto)}</div>
  
            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Descuentos:</div>
            <div style={{ textAlign: 'right', color: '#ff4d4f' }}>-{formatCurrency(totals.descuentos)}</div>
  
            <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Subtotal:</div>
            <div style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(totals.subtotal)}</div>
  
            {hiddenImpuestos && (
              <>
                <div style={{ textAlign: 'right', fontWeight: 500, color: '#666', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px' }}>IVA:</span>
                  <Select
                    value={totals.ivaPercentage}
                    style={{ width: '120px' }}
                    onChange={(value) => handleRetentionChange('iva', value)}
                  >
                    <Select.Option value="19">IVA 19%</Select.Option>
                    <Select.Option value="5">IVA 5%</Select.Option>
                    <Select.Option value="0">IVA 0%</Select.Option>
                    <Select.Option value="8">Ipoconsumo 8%</Select.Option>
                  </Select>
                </div>
                <div style={{ textAlign: 'right', color: '#ff4d4f' }}>{formatCurrency(totals.iva)}</div>
  
                <div style={{ textAlign: 'right', fontWeight: 500, color: '#666', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px' }}>Retención:</span>
                  <Select
                    value={totals.retencionPercentage}
                    style={{ width: '120px' }}
                    onChange={(value) => handleRetentionChange('retencion', value)}
                  >
                    <Select.Option value="11">Rete 11%</Select.Option>
                    <Select.Option value="10">Rete 10%</Select.Option>
                    <Select.Option value="7">Rete 7%</Select.Option>
                    <Select.Option value="6">Rete 6%</Select.Option>
                    <Select.Option value="4">Rete 4%</Select.Option>
                    <Select.Option value="3.5">Rete 3.5%</Select.Option>
                    <Select.Option value="2.5">Rete 2.5%</Select.Option>
                    <Select.Option value="2">Rete 2%</Select.Option>
                    <Select.Option value="1">Rete 1%</Select.Option>
                    <Select.Option value="0">Rete 0%</Select.Option>
                  </Select>
                </div>
                <div style={{ textAlign: 'right', color: '#ff4d4f' }}>-{formatCurrency(totals.retencion)}</div>
              </>
            )}
          </div>
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '8px' }}>
            <div className="bg-[#0052CC] text-white rounded-md py-2 px-4 flex justify-between items-center">
              <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>Total Neto:</div>
              <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>{formatCurrency(totals.totalNeto)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
              <div style={{ textAlign: 'right', fontWeight: 500, color: '#666' }}>Total en Impuestos:</div>
              <div style={{ textAlign: 'right', fontWeight: 500, color: totals.totalImpuestos >= 0 ? '#52c41a' : '#ff4d4f' }}>
                {totals.totalImpuestos >= 0 ? '+' : ''}{formatCurrency(totals.totalImpuestos)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOptions = () => {
    return (
      <div style={{ marginBottom: '16px' }}>
        <Checkbox
          checked={hasPercentageDiscount}
          onChange={(e) => setHasPercentageDiscount(e.target.checked)}
        >
          Descuento en porcentaje
        </Checkbox>
        <Checkbox
          checked={hiddenDetails}
          onChange={(e) => setHiddenDetails(e.target.checked)}
        >
          Mostrar detalles (categorías)
        </Checkbox>
        <Checkbox
          checked={!hiddenImpuestos}
          onChange={(e) => setHiddenImpuestos(!e.target.checked)}
        >
          Incluir impuestos por producto
        </Checkbox>
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {renderOptions()}
      <Table
        dataSource={items}
        columns={columns}
        pagination={false}
        size="small"
        bordered
        style={{ width: '100%' }}
      />
      <Button
        onClick={handleAddRow}
        type="dashed"
        style={{ width: '100%', marginTop: '8px' }}
      >
        + Agregar línea
      </Button>
      {renderSummary()}
    </div>
  );
};

export default ProductsTable;